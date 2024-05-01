const express = require("express");
const {
  login,
  logout,
  forgetPassword,
  otpCheaker,
  getUserProfile,
  updateUserProfile,
  getDashboardInformation,
} = require("../controllers/admin_controller");
const {
  refreshToken,
  verifyTokenAndAdmin,
} = require("../utils/verifyToken_util");
const ROUTE = express.Router();
// method POST
// route /api/v1/admin/login
// privacy only admin can do this
ROUTE.route("/").post(login);
// method POST
// route /api/v1/admin/logout
// privacy only specific admin can do this
ROUTE.route("/logout").post(verifyTokenAndAdmin, logout);
// method GET
// route /api/v1/admin/forgetPassword
// privacy only admin can do this
// @details generate send otp
ROUTE.route("/forgetPassword").get(forgetPassword);
// method POST
// route /api/v1/admin/setPassword
// privacy only admin can do this
// @details check otp then change password
ROUTE.route("/setPassword").post(otpCheaker);
// method GET
// route /api/v1/admin/refreshToken
// @privacy all can do this by their valid token
ROUTE.route("/refreshToken").get(refreshToken);
// method GET
// route /api/v1/admin/userProfile
// @privacy only admin can do this
// @detail get profile
ROUTE.route("/profile").get(verifyTokenAndAdmin, getUserProfile);
// method PUT
// route /api/v1/admin/userProfile
// @privacy only admin can do this
// @detail edit profile
ROUTE.route("/profile").put(verifyTokenAndAdmin, updateUserProfile);
// method GET
// route /api/v1/admin/dashboard
// @privacy only admin can do this
// @detail get app information
ROUTE.route("/dashboard").get(verifyTokenAndAdmin, getDashboardInformation);

module.exports = ROUTE;
