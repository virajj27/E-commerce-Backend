//token ko cookie me daal rha hai ye function
const cookieToken = (user, res) => {
  const token = user.getJwtToken();

  const options = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  user.password = undefined;
  //inserting a token into the cookie
  res.status(200).cookie("token", token, options).json({
    success: true,
    token,
    user,
  });
};

module.exports = cookieToken;
