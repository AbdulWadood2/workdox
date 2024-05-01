const express = require("express");
const {
  register,
  login,
  forgetPassword,
  otpCheaker,
  logout,
  updateUserProfile,
} = require("../controllers/user_controller");
const { refreshToken, verifyUser } = require("../utils/verifyToken_util");
const ROUTE = express.Router();

// route /api/v1/user/signup
// method POST
// @privacy only user can do this
ROUTE.route("/signup").post(register);
// route /api/v1/user/login
// method POST
// @privacy only user can do this
ROUTE.route("/login").post(login);
// route /api/v1/user/logout
// method GET
// @privacy only user can do this
ROUTE.route("/logout").get(verifyUser, logout);
// route /api/v1/user/forgetPassword
// method GET
// @privacy only user can do this
ROUTE.route("/forgetPassword").get(forgetPassword);
// route /api/v1/user/setPassword
// method POST
// @privacy only user can do this
ROUTE.route("/setPassword").post(otpCheaker);
// route /api/v1/user/refreshToken
// method GET
// @privacy all do this but with their valid token
ROUTE.route("/refreshToken").get(refreshToken);
// API Route: PUT /api/v1/user/profile
// Permission (only user can do this)
ROUTE.route("/profile").put(verifyUser, updateUserProfile);
module.exports = ROUTE;
