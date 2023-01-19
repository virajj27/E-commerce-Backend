const User=require("../models/user")
const bigPromise=require("../middlewares/bigPromise")
const customError=require("../utils/customError");
const jwt=require('jsonwebtoken')

exports.isLoggedIn = bigPromise(async (req, res, next) => {
    // const token = req.cookies.token || req.header("Authorization").replace("Bearer ", "");
  
    // check token first in cookies
    let token = req.cookies.token;
  
    // if token not found in cookies, check if header contains Auth field
    if (!token && req.header("Authorization")) {
      token = req.header("Authorization").replace("Bearer ", "");
    }
  
    if (!token) {
      return next(new customError("Login first to access this page", 401));
    }
  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
    req.user = await User.findById(decoded.id);
  
    next();
  });
  exports.customRole=(...roles)=>{
    return (req,res,next) => {
      if(!roles.includes(req.user.role))
      {
        return next(new customError("you are not authorized to access this page",400));
      }
      next();
    }
  }