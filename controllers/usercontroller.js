const User = require("../models/user");
const bigPromise = require("../middlewares/bigPromise");
const customError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const mailHelper = require("../utils/nodemailer");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;

exports.signup = bigPromise(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  let result;
  if (req.files) {
    //if request contains any files
    // console.log(req.files);
    let file = req.files.photo;
    console.log(file.tempFilePath);
    result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
  }

  if (!email || !name || !password) {
    return next(new customError("Name, email and password are required", 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });

  cookieToken(user, res);
});
exports.login = bigPromise(async (req, res, next) => {
  const { email, password } = req.body;
  //if email and password is entered or not

  if (!email || !password) {
    return next(new customError("email and password are required", 400));
  }
  //getting user from database

  const user = await User.findOne({ email }).select("+password");

  //if user not found

  if (!user) {
    return next(
      new customError("Email or Password does not match or exist", 400)
    );
  }
  const isPasswordCorrect = await user.IsValidatedPassword(password);

  //if password does not match

  if (!isPasswordCorrect) {
    return next(
      new customError("Email or Password does not match or exist", 400)
    );
  }
  //if all goes good then send the token to user
  cookieToken(user, res);
});
exports.logout = bigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()), //expire it now
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "successfully logged out",
  });
});
exports.forgotPassword = bigPromise(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new customError("please enter your email", 400));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new customError("user not registered", 400));
  }
  const forgotToken = user.getForgotPasswordToken(); //random generated string obtained here
  await user.save({ validateBeforeSave: false }); //because we are not passing all the compulsary fields

  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;
  const message = `copy paste this link in your URL and hit enter\n\n${myUrl}`;
  const options = {
    email,
    subject: "password reset",
    message,
  };
  try {
    await mailHelper(options);
    res.status(200).json({
      success: true,
      message: "password mail sent",
    });
  } catch (error) {
    forgotPasswordToken = undefined;
    forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new customError("user not registered", 400));
  }
});
exports.resetPassword = bigPromise(async (req, res, next) => {
  const token = req.params.token;
  const encryptedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await User.findOne({
    encryptedToken,
    forgotPasswordExpiry: { $gt: Date.now() }, //expiry should be greater than current time i.e. future
  });
  if (!user) {
    //since we are finding user based on token's expiry time greater that current time
    return next(new customError("token is expired or invalid", 400));
  }
  const { newPassword, confirmPassword } = req.body;
  if (newPassword != confirmPassword) {
    return next(
      new customError("password and confirm password do not match", 400)
    );
  }
  user.password = newPassword;
  //reset token fields
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save();
  //send a json response or send a token to the user for further use
  cookieToken(user, res);
});
exports.getLoggedInUserDetails = bigPromise(async (req, res, next) => {
  //req.user will be added by middleware
  // find user by id
  const user = await User.findById(req.user.id);

  //send response and user data
  res.status(200).json({
    success: true,
    user,
  });
});
exports.changePassword = bigPromise(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId).select("+password");
  const { oldPassword, newPassword } = req.body;
  const isOldPasswordCorrect = await user.IsValidatedPassword(oldPassword);
  if (!isOldPasswordCorrect) {
    return next(new customError("wrong password entered", 400));
  }
  user.password = newPassword;
  await user.save();
  cookieToken(user, res);
});
exports.updateUserInformation = bigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };
  if (req.files) {
    let file = req.files.photo;
    const user = await User.findById(req.user.id);
    const userId = user.photo.id;
    await cloudinary.uploader.destroy(userId);

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }
  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new customError("user not found", 404));
  }
  res.status(200).json({
    success: true,
  });
});
exports.adminAllUsers = bigPromise(async (req, res, next) => {
  const user = await User.find({});
  res.status(200).json({
    success: true,
    user,
  });
});
exports.managerAllUsers = bigPromise(async (req, res) => {
  const user = await User.find({ role: "user" });
  res.status(200).json({
    success: true,
    user,
  });
});
exports.adminGetOneUser = bigPromise(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new customError("user not found", 400));
  }
  res.status(200).json({
    success: true,
    user,
  });
});
exports.adminUpdateUser = bigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };
  const user = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new customError("user not found", 404));
  }
  res.status(200).json({
    success: true,
  });
});
exports.adminDeleteUser = bigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new customError("user not found", 404));
  }
  await cloudinary.uploader.destroy(user.photo.id);
  await User.deleteOne({ _id: user._id });
  res.status(200).json({
    success: true,
  });
});
