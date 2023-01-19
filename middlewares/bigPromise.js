//either use try catch with async await
//or use promises everywhere with async await
//or use a bigPromise and wrap the function code inside it and use async await
module.exports=(func)=>(req,res,next)=>{
    Promise.resolve(func(req,res,next)).catch(next);
}