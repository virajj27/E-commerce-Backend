const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOneOrder,
  getLoggedInOrders,
  adminGetAllOrders,
  adminUpdateOrder,
  adminDeleteOrder,
} = require("../controllers/ordercontroller");
const { customRole, isLoggedIn } = require("../middlewares/userMiddleware");

//user routes
router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/:id").get(isLoggedIn, getOneOrder);
router.route("/myorder").get(isLoggedIn, getLoggedInOrders);

//admin routes
router
  .route("/admin/orders")
  .get(isLoggedIn, customRole("admin"), adminGetAllOrders);
router
  .route("/admin/orders/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateOrder);
router
  .route("/admin/orders/:id")
  .delete(isLoggedIn, customRole("admin"), adminDeleteOrder);

module.exports = router;
