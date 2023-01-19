const express=require('express')
require('dotenv').config();
const app=express();
const morgan=require('morgan')
const cookieParser=require("cookie-parser")
const fileUpload=require("express-fileupload")

//general middlewares
app.use(express.json())
app.use(express.urlencoded({extended:true}))
//ejs middleware
app.set("view engine",'ejs')
//cookie and file middlewares
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp/"
}));

//morgan middleware
app.use(morgan("tiny"))

//import all your routes here
const home=require('./routes/homeRoutes')//note it is require
const user=require('./routes/userRoutes')
const product=require('./routes/productRoutes')


//router middlewares to be written here
app.use('/api/v1',home)//control passed to homeRoutes.js once /api/v1 route is hit
app.use('/api/v1',user)
// app.use('/api/v1',product)


app.get("/signuptest",(req,res)=>{
    res.render("postform")
})

//export app.js
module.exports=app