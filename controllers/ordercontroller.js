const Order = require("../models/order");
const Product = require("../models/product");
const bigPromise = require("../middlewares/bigPromise");
const customError = require("../utils/customError");

exports.createOrder = bigPromise(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
  });
  res.status(200).json({
    success: true,
    order,
  });
});
exports.getOneOrder = bigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!order) {
    return next(new customError("order not found"));
  }
  res.status(200).json({
    success: true,
    order,
  });
});
exports.getLoggedInOrders = bigPromise(async (req, res, next) => {
  const order = await Order.findById({ user: req.user._id });
  if (!order) {
    return next(new customError("please check order id", 401));
  }
  res.status(200).json({
    success: true,
    order,
  });
});
exports.adminGetAllOrders = bigPromise(async (req, res, next) => {
  const orders = await Order.find();
  res.status(200).json({
    success: true,
    orders,
  });
});
exports.adminUpdateOrder = bigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (order.orderStatus === "delivered") {
    return next(new customError("order is already delivered", 401));
  }
  order.orderItems.forEach(async (prod) => {
    await updateStock(prod.productId, prod.quantity);
  });
  order.orderStatus = req.body.orderStatus;
  await order.save();
  res.status(200).json({
    success: true,
    order,
  });
});
exports.adminDeleteOrder = bigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new customError("order not found", 401));
  }

  await order.deleteOne(order);
  res.status(200).json({
    success: true,
  });
});
async function updateStock(productId, quantity) {
  const product = Product.findById(productId);
  //implement a check if stock and quantity are equal or not(stock should not be less than quantity)
  product.stock = product.stock - quantity;

  await product.save({ validateBeforeSave: false });
}
