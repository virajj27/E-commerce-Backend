const Product = require("../models/product");
const bigPromise = require("../middlewares/bigPromise");
const customError = require("../utils/customError");
const cloudinary = require("cloudinary").v2;
const cookieToken = require("../utils/cookieToken");
const whereClause = require("../utils/whereClause");
exports.addProduct = bigPromise(async (req, res, next) => {
  //handling images first
  const imagesArray = [];
  if (!req.files) {
    return next(new customError("images are required", 401));
  }
  if (req.files) {
    for (let i = 0; i < req.files.photos.length; i++) {
      const photo = req.files.photos[i];

      const result = await cloudinary.uploader.upload(photo.tempFilePath, {
        folder: "products",
      });
      imagesArray.push({
        id: result.secure_id,
        url: result.secure_url,
      });
    }
  }
  //things came in req.files and after uploading it to
  //cloudinary we are pushing imageArray to photos
  //just changing whatever we got in req.body(photos field was empty since we received the photos from req.files)
  req.body.photos = imagesArray;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);
  res.status({
    success: true,
    product,
  });
});
exports.getAllProduct = bigPromise(async (req, res, next) => {
  const resultPerPage = 6;
  const totalcountProduct = await Product.countDocuments();

  const productsObj = new whereClause(Product.find(), req.query) //what will this contain?
    .search()
    .filter();

  let products = await ProductsObj.base;
  const filteredProductNumber = products.length;

  //products.limit().skip()
  products.pager(resultPerPage);
  products = await productsObj.base.clone();

  res.status(200).json({
    success: true,
    products,
    filteredProductNumber,
    totalcountProduct,
  });
});
