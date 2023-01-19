const bigPromise=require("../middlewares/bigPromise")
//using bigPromises once and wrapping the code around it and using async await
exports.home=bigPromise(async(req,res)=>{
    // const db=await something()
    res.status(201).json({
        success:true,
        greetings:"hello from controller!"
    })
})
//using try catch and async await
exports.dummy=async(req,res)=>{
     try {
    //     const db= await something()
        res.status(201).send("hello from dummy controller!")

    } catch (error) {
     console.log(error);   
    }
}