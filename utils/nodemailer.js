const nodemailer = require("nodemailer");

const mailHelper=async(options)=>{
     // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "54d59338f7a3ed",
      pass: "35060605d226c1", // generated ethereal password
    },
  });
  const message={
    from: 'vpadale86@gmail.com', // sender address
    to: options.email, // list of receivers
    subject:options.subject , // Subject line
    text:options.message , // plain text body
  }
  // send mail with defined transport object
  await transporter.sendMail(message);
}
module.exports=mailHelper