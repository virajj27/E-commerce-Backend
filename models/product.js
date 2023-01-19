const mongoose = require('mongoose')
 const productSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,"please provide product name"],
        trim:true,
        maxlength:[120,"product name must be within 120 characters"],
    },
    price:{
        type:Number,
        required:[true,"please provide product price"],
        maxlength:[5,"product price must be less than 5 digits"],
    },
    description:{
        type:String,
        required:[true,"please provide product Description"],
    },
    photos:[{
        id:{
            type:String,
            required:true,
        },
        secure_url:{
            type:String,
            required:true
        }
    }],
    category:{
        type:String,
        required:[true,"please provide a category from long-sleeves,short-sleeves,sweat-shirts,hoodies"],
        enum:{
            values:["longsleeves", "shortsleeves", "sweatshirts", "hoodies"],
        },
        message:"please select category from longsleeves,shortsleeves,sweatshirts,hoodies"
    },
    stock:{
        type:Number,
        required:[true,"please add a number in stock"],
    },
    brand:{
        type:String,
        required:[true,"please add a brand for clothing"],
    },
    ratings:{
        type:Number,
        default:0
    },
    numberOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:'User',
                required:true,
            },
            name:{
                type: String,
                required:true
            },
            ratings:{
                type: Number,
                required:true
            },
            comment:{
                type: String,
                required:true
            },
        }
    ],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true,
    },
    createdAt:{
        type: Date,
        default: Date.now,
    }
    
 })

 module.exports=mongoose.model('product',productSchema)