const app=require('./app');
const connectWithDB = require('./config/db');
const cloudinary=require('cloudinary').v2
require('dotenv').config();
//connected to database
connectWithDB()
//cloudinary config goes here
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_KEY,
    api_secret:process.env.CLOUDINARY_SECRET
})
app.listen(process.env.PORT,()=>{
    console.log(`server running on port: ${process.env.PORT}`);
})
    