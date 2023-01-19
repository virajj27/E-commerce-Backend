const mongoose=require('mongoose')

const connectWithDB=()=>{
    mongoose.connect(process.env.DB_URL,{
        useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log(`DB CONNECTED`))
    .catch(error=>{
        console.log(`ISSUES WITH DB`);
        console.log(error);
        process.exit(1)
    })
}
module.exports=connectWithDB


