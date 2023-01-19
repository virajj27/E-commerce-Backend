const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const crypto = require("crypto");
const userSchema=mongoose.Schema({

    name:{
        type: String,
        required:[true,"please enter your name"],
        maxlength:[40,"name should be under 40 characters"]
    },
    email:{
        type:String,
        required:[true,"please enter a email id"],
        validate:[validator.isEmail,'please enter email in correct format'],
        unique:true
    },
    password:{
        type:String,
        required:[true,"please enter a password"],
        minlength:[6,"password should atleast be of 6 char"],
        select:false//instead of using {user.password=undefined} mention select:false here
    },
    role:{
        type:String,
        default:'user'
    },
    photo:{
        id:{
            type:String,
            required:true,
        },
        secure_url:{
            type:String,
            required:true,
        }
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createdAt:{
        type:Date,
        default:Date.now,
    }
    
})
//using hooks (pre) to hash password
userSchema.pre("save",async function(next){

    if(!this.isModified('password')){//is password field is untouched don't hash just move next
        return next();
    }
    this.password= await bcrypt.hash(this.password,10)//when new password is being set or during forgot password
})
//validating the password
userSchema.methods.IsValidatedPassword=async function(userEnteredPass){
    return await bcrypt.compare(userEnteredPass,this.password);
}
//creating JWT token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });
  };
//getting hash ,make sure to get hash on the backend
userSchema.methods.getForgotPasswordToken=function(){//note we are not saving anything into the database
                                                     //it is the responsiblity of the developer to save it wherever required
const forgotToken = crypto.randomBytes(20).toString("hex");
this.forgotPasswordToken=crypto.createHash('sha256').update(forgotToken).digest("hex")
//time of token
this.forgotPasswordExpiry=Date.now()+20*60*1000//expiry set to 20 mins from now
return forgotToken;
}

module.exports=mongoose.model("User",userSchema)