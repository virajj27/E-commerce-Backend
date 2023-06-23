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
      const result = await cloudinary.uploader.upload(
        req.files.photos[i].tempFilePath,
        {
          folder: "products",
        }
      );
      // console.log(result);
      imagesArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }
  //things came in req.files and after uploading it to
  //cloudinary we are pushing imageArray to photos
  //just changing whatever we got in req.body(photos field was empty since we received the photos from req.files)
  req.body.photos = imagesArray;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);
  res.status(200).json({
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

  let products = await productsObj.base;
  const filteredProductNumber = products.length;

  //products.limit().skip()
  productsObj.pager(resultPerPage);
  products = await productsObj.base.clone();

  res.status(200).json({
    success: true,
    products,
    filteredProductNumber,
    totalcountProduct,
  });
});
exports.getOneProduct = bigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new customError("Product not found with this id", 401));
  }
  res.status(200).json({
    success: true,
    product,
  });
});
exports.addReview = bigPromise(async (req, res, next) => {
  const { productId, rating, comment } = req.body;
  const review = {
    id: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };
  const product = await Product.findById(productId);
  const AlreadyReview = product.reviews.find(
    //product.review.find() (function applied on an array) will return a boolean value
    (rev) => rev.user.toString() === req.user._id.toString() //toString() because _id is a bson object
  );
  if (AlreadyReview) {
    product.reviews.forEach((review) => {
      //update existing review inside db for particular user
      if (review.user.toString() === req.user._id.toString()) {
        (review.comment = comment), (review.rating = rating);
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }
  //adjust ratings
  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});
exports.deleteReview = bigPromise(async (req, res, next) => {
  const { productId } = req.query;

  const product = await Product.findById(productId);

  const reviews = product.reviews.filter(
    //filter will add only those reviews which do not match with the specific user
    (rev) => rev.user.toString() !== req.user._id.toString()
  );

  const numberOfReviews = reviews.length;

  // adjust ratings

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  //update the product

  await Product.findByIdAndUpdate(
    productId,
    {
      reviews,
      ratings,
      numberOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});
exports.getOnlyReviewsForOneProduct = bigPromise(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});
//admin routess
exports.adminGetAllProduct = bigPromise(async (req, res, next) => {
  const products = await Product.find({});

  res.status(200).json({
    success: true,
    products,
  });
});
exports.adminUpdateOneProduct = bigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new customError("Product not found with this id", 401));
  }
  let imagesArray = [];
  if (req.files) {
    for (let index = 0; index < product.photos.length; index++) {
      const res = await cloudinary.uploader.destroy(product.photos[index].id);
    }

    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products", //folder name -> .env
        }
      );

      imagesArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imagesArray;

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});
exports.adminDeleteOneProduct = bigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new customError("Product not found with this id", 401));
  }
  for (let index = 0; index < product.photos.length; index++) {
    await cloudinary.uploader.destroy(product.photos[index].id);
  }
  await product.remove();
  res.status(200).json({
    success: true,
    message: "product was deleted",
  });
});
