/* status codes */
const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");
const JWT = require("jsonwebtoken");
/* error */

const AppError = require("./appError");
/* models */
const admin_model = require("../model/admin_model");
const user_model = require("../model/user_model");
const { successMessage } = require("../functions/utility.functions");

const signRefreshToken = (uniqueId) => {
  return JWT.sign({ uniqueId }, process.env.JWT_SEC);
};

const signToken = (id, uniqueId) => {
  return JWT.sign({ id, uniqueId }, process.env.JWT_SEC, {
    expiresIn: process.env.expirydateAccessJwt,
  });
};
// Verify token and admin
const verifyTokenAndAdmin = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    if (!token) {
      return next(
        new AppError("token in req is required", StatusCodes.BAD_REQUEST)
      );
    }
    token = token.split(" ");
    token = token[1];
    const payload = JWT.verify(token, process.env.JWT_SEC);
    let admin = await admin_model.findById(payload.id);
    let user = admin;
    if (!user) {
      return next(
        new AppError(
          "Access Denied! only do this by Admin",
          StatusCodes.UNAUTHORIZED
        )
      );
    }
    // const payloadunique = [];
    // for (let item of user.refreshToken) {
    //   const token = JWT.verify(item, process.env.JWT_SEC);
    //   payloadunique.push(token.uniqueId);
    // }
    // if (!payloadunique.includes(payload.uniqueId)) {
    //   return next(new AppError("Invalid Token", StatusCodes.UNAUTHORIZED));
    // }
    try {
      const verified = JWT.verify(token, process.env.JWT_SEC);
      req.user = verified;
      next();
    } catch (error) {
      return next(new AppError(error, StatusCodes.UNAUTHORIZED));
    }
  } catch (error) {
    return next(new AppError(error, StatusCodes.UNAUTHORIZED));
  }
};
// Verify token and user
const verifyUser = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    if (!token) {
      return next(
        new AppError("token in req is required", StatusCodes.BAD_REQUEST)
      );
    }
    token = token.split(" ");
    token = token[1];
    const payload = JWT.verify(token, process.env.JWT_SEC);
    let user = await user_model.findById(payload.id);
    user = user ? user : false;
    if (!user) {
      return next(
        new AppError(
          "Access Denied! only do this by user",
          StatusCodes.UNAUTHORIZED
        )
      );
    }
    // const payloadunique = [];
    // for (let item of user.refreshToken) {
    //   const token = JWT.verify(item, process.env.JWT_SEC);
    //   payloadunique.push(token.uniqueId);
    // }
    // if (!payloadunique.includes(payload.uniqueId)) {
    //   return next(new AppError("Invalid Token", StatusCodes.UNAUTHORIZED));
    // }
    try {
      const verified = JWT.verify(token, process.env.JWT_SEC);
      req.user = verified;
      next();
    } catch (error) {
      return next(new AppError(error, StatusCodes.UNAUTHORIZED));
    }
  } catch (error) {
    return next(new AppError(error, StatusCodes.UNAUTHORIZED));
  }
};
// admin and vender and user both use this middleware
const verifyAll = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    if (!token) {
      return next(
        new AppError("token in req is required", StatusCodes.BAD_REQUEST)
      );
    }
    token = token.split(" ");
    token = token[1];
    const payload = JWT.verify(token, process.env.JWT_SEC);
    let admin = await admin_model.findById(payload.id);
    let userIs = await user_model.findById(payload.id);
    user = admin ? admin : userIs ? userIs : null;
    if (!user) {
      return next(
        new AppError(
          "Access Denied! this is not a valid token",
          StatusCodes.UNAUTHORIZED
        )
      );
    }
    // const payloadunique = [];
    // for (let item of user.refreshToken) {
    //   const token = JWT.verify(item, process.env.JWT_SEC);
    //   payloadunique.push(token.uniqueId);
    // }
    // if (!payloadunique.includes(payload.uniqueId)) {
    //   return next(new AppError("Invalid Token", StatusCodes.UNAUTHORIZED));
    // }
    try {
      const verified = JWT.verify(token, process.env.JWT_SEC);
      if (verified) {
        req.user = user;
      }
      next();
    } catch (error) {
      return next(new AppError("Invalid Token", StatusCodes.UNAUTHORIZED));
    }
  } catch (error) {
    return next(new AppError(error, StatusCodes.UNAUTHORIZED));
  }
};
/* refreshToken for all*/
const refreshToken = async (req, res, next) => {
  try {
    let refreshToken = req.header("Authorization");
    if (!refreshToken) {
      return next(
        new AppError("refreshToken in req is required", StatusCodes.BAD_REQUEST)
      );
    }
    refreshToken = refreshToken.split(" ");
    refreshToken = refreshToken[1];

    // Retrieve the user from the database based on the refresh token
    let admin = await admin_model.findOne({ refreshToken });
    let client = await user_model.findOne({ refreshToken });
    let user = admin ? admin : client ? client : false;
    if (!user) {
      throw new Error("User not found or invalid refresh token.");
    }
    const payload = JWT.verify(refreshToken, process.env.JWT_SEC);
    // Issue a new access token
    const newAccessToken = signToken(user.id, payload.uniqueId);
    return successMessage(StatusCodes.ACCEPTED, res, null, {
      accessToken: newAccessToken,
    });
  } catch (error) {
    return next(new AppError(error, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

module.exports = {
  signToken,
  signRefreshToken,
  verifyTokenAndAdmin,
  verifyUser,
  verifyAll,
  refreshToken,
};
