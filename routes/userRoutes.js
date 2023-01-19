const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getLoggedInUserDetails,
  changePassword,
  updateUserInformation,
  adminAllUsers,
  managerAllUsers,
  adminGetOneUser,
  adminUpdateUser,
  adminDeleteUser,
} = require("../controllers/usercontroller");
const { isLoggedIn, customRole } = require("../middlewares/userMiddleware");
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/userDashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/update").post(isLoggedIn, changePassword);
router.route("/userdashboard/update").post(isLoggedIn, updateUserInformation);

//admin only  routes
router
  .route("/admin/users")
  .get(isLoggedIn, customRole("admin"), adminAllUsers);
router
  .route("/admin/users/:id")
  .get(isLoggedIn, customRole("admin"), adminGetOneUser)
  .put(isLoggedIn, customRole("admin"), adminUpdateUser)
  .delete(isLoggedIn, customRole("admin"), adminDeleteUser);
//manager only routes
router
  .route("/manager/users")
  .get(isLoggedIn, customRole("manager"), managerAllUsers);

module.exports = router;
