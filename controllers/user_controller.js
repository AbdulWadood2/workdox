/* email sent */
const Email = require("../utils/emails");
/* status codes */
const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");
/* jwt */
const JWT = require("jsonwebtoken");
/* custom error */
const AppError = require("../utils/appError");
/* file System */
const fs = require("fs");
/* models */
const user_model = require("../model/user_model");
/* for hashing */
const CryptoJS = require("crypto-js");
/* verification component */
const { signToken, signRefreshToken } = require("../utils/verifyToken_util");
/* utilities functions */
const {
  generateRandomString,
  validateEmailAndPassword,
  successMessage,
  validatePassword,
} = require("../functions/utility.functions");
const { validateUserSignUp } = require("../utils/joi_validator_util");

// route /api/v1/user/signup
// method POST
// @privacy only user can do this
const register = async (req, res, next) => {
  try {
    const result = validateUserSignUp(req.body);
    // If validation fails, return an error response
    if (result.error) {
      return next(
        next(
          new AppError(
            result.error.details.map((error) => error.message + " in req.body"),
            StatusCodes.BAD_REQUEST
          )
        )
      );
    }
    // Check if the user already exists
    const isUserExist = await user_model.findOne({ email: result.value.email });
    if (isUserExist) {
      return next(
        new AppError("User is already exist", StatusCodes.BAD_REQUEST)
      );
    }

    // Password encryption (you might want to improve the encryption method)
    let encryptPassword = CryptoJS.AES.encrypt(
      result.value.password,
      process.env.CRYPTO_SEC
    ).toString();
    result.value.password = encryptPassword;
    const user = await user_model.create({
      ...result.value,
      dateCreated: Date.now(),
    });

    const randomString = generateRandomString(40);
    // Create refresh Token
    let refreshTokenIs = signRefreshToken(randomString);
    // ectually it is access token
    const accessToken = signToken(user._id, randomString);
    user.refreshToken.push(refreshTokenIs);
    await user.save();
    const { password: _, refreshToken, ...others } = user._doc;
    // Send Verification Email (implement email sending logic here)
    return successMessage(
      StatusCodes.ACCEPTED,
      res,
      "user register successfully",
      { ...others, accessToken, refreshToken: refreshTokenIs }
    );
  } catch (error) {
    return next(new AppError(error, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

// route /api/v1/user/login
// method POST
// @privacy only user can do this
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await user_model.findOne({ email });

    if (!user) {
      return next(new AppError("user not found", StatusCodes.BAD_REQUEST));
    }
    const check = validateEmailAndPassword(email, password);
    if (check.length > 0) {
      return next(new AppError(check, StatusCodes.BAD_REQUEST));
    }
    // Decrypt the password which is stored in Encryption form in database
    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.CRYPTO_SEC
    );
    const realPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    if (realPassword !== password) {
      return next(
        new AppError("password is incorrect", StatusCodes.BAD_REQUEST)
      );
    }
    const randomString = generateRandomString(40);
    // Create refresh Token
    const refreshTokenIs = signRefreshToken(randomString);
    // ectually it is access token
    const accessToken = signToken(user._id, randomString);
    let userIs = await user_model.findByIdAndUpdate(user._id);
    userIs.refreshToken.push(refreshTokenIs);
    await userIs.save();
    const { password: _, refreshToken, ...others } = userIs._doc;
    return successMessage(StatusCodes.ACCEPTED, res, "login successfully", {
      ...others,
      accessToken,
      refreshToken: refreshTokenIs,
    });
  } catch (error) {
    return next(new AppError(error, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};
// route /api/v1/user/logout
// method GET
// @privacy only user can do this
const logout = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    token = token.split(" ");
    token = token[1];
    let { refreshToken } = req.query;
    if (!refreshToken) {
      return next(
        new AppError(
          "refreshToken in params is required",
          StatusCodes.BAD_REQUEST
        )
      );
    }
    refreshToken = refreshToken.split(" ");
    refreshToken = refreshToken[1];
    const payloadAccess = JWT.verify(token, process.env.JWT_SEC);
    const payloadRefresh = JWT.verify(refreshToken, process.env.JWT_SEC);
    if (!(payloadAccess.uniqueId == payloadRefresh.uniqueId)) {
      return next(
        new AppError(
          "the refreshToken and accessToken are not matched",
          StatusCodes.BAD_REQUEST
        )
      );
    }
    const user = await user_model.findOne({ refreshToken });
    if (!user) {
      return next(
        new AppError("this refreshToken not exist", StatusCodes.BAD_REQUEST)
      );
    }
    await user_model.updateOne(
      { _id: req.user.id },
      { $pull: { refreshToken: refreshToken } }
    );
    return successMessage(
      StatusCodes.ACCEPTED,
      res,
      "logout successfully",
      null
    );
  } catch (error) {
    return next(new AppError(error, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};
// route /api/v1/user/forgetPassword
// method GET
// @privacy only user can do this
const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.query;
    const user = await user_model.findOne({ email });
    if (user) {
      function generateSixDigitNumber() {
        const min = 100000; // Smallest 6-digit number
        const max = 999999; // Largest 6-digit number
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      const sixDigitNumber = generateSixDigitNumber();
      await new Email(
        { email, name: "" },
        sixDigitNumber
      ).sendVerificationCode();
      let otp = CryptoJS.AES.encrypt(
        `${sixDigitNumber}`,
        process.env.CRYPTO_SEC
      ).toString();
      user.forgetPassword = otp;
      await user.save();
      return successMessage(StatusCodes.ACCEPTED, res, null, { email, otp });
    } else {
      return next(
        new AppError("not user with this email", StatusCodes.NOT_FOUND)
      );
    }
  } catch (error) {
    return next(new AppError(error, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};
// route /api/v1/user/setPassword
// method POST
// @privacy only user can do this
const otpCheaker = async (req, res, next) => {
  try {
    const { email, encryptOpts, otp, newPassword } = req.body;
    const check = validatePassword(newPassword);
    if (check.length > 0) {
      return next(new AppError(check, StatusCodes.BAD_REQUEST));
    }
    const errors = [];

    if (!email) {
      errors.push("Email is required.");
    }

    if (!otp) {
      errors.push("Verification code is required.");
    }

    if (errors.length > 0) {
      return next(new AppError(errors, StatusCodes.BAD_REQUEST));
    }

    // Decrypt the encrypted options and compare with the user-entered code
    const decrypted = CryptoJS.AES.decrypt(
      encryptOpts,
      process.env.CRYPTO_SEC
    ).toString(CryptoJS.enc.Utf8);

    if (decrypted !== otp) {
      return next(
        new AppError("Invalid verification code.", StatusCodes.UNAUTHORIZED)
      );
    }

    // Find the user by email
    const user = await user_model.findOne({ email });

    if (!user) {
      return next(new AppError("User not found.", StatusCodes.NOT_FOUND));
    }
    if (!user.forgetPassword) {
      return next(
        new AppError(
          "you are not able to change password because of not otp",
          StatusCodes.NOT_FOUND
        )
      );
    }
    if (encryptOpts != user.forgetPassword) {
      new AppError("generate otp first", StatusCodes.NOT_FOUND);
    }
    // Update the user's password
    user.password = CryptoJS.AES.encrypt(
      newPassword,
      process.env.CRYPTO_SEC
    ).toString();
    user.forgetPassword = null;
    await user.save();
    return successMessage(
      StatusCodes.ACCEPTED,
      res,
      "Password reset successfully.",
      null
    );
  } catch (error) {
    return next(new AppError(error, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};
// API Route: PUT /api/v1/user/profile
// Permission (only user can do this)
const updateUserProfile = async (req, res, next) => {
  try {
    // Assuming you have the user ID from the token
    const userId = req.user.id;

    // Fetch the user from the database
    let user = await user_model.findById(userId);

    if (!user) {
      return next(new AppError("User not found.", StatusCodes.NOT_FOUND));
    }

    // Update user data based on the request body
    const { fullName, password } = req.body;

    // Validate and update the fields you want to allow updating
    if (fullName) user.fullName = fullName;
    if (password) {
      const check = validatePassword(password);
      if (check.length > 0) {
        return next(new AppError(check, StatusCodes.BAD_REQUEST));
      }
      // Encrypt and update the password
      user.password = CryptoJS.AES.encrypt(
        password,
        process.env.CRYPTO_SEC
      ).toString();
    }
    user.dateModified = Date.now();
    // Save the updated user data
    await user.save();

    // Omit sensitive information like password and refresh token
    let { password: _, refreshToken, ...updatedUserProfile } = user._doc;
    return successMessage(
      StatusCodes.OK,
      res,
      "User profile updated successfully",
      updatedUserProfile
    );
  } catch (error) {
    return next(new AppError(error, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

module.exports = {
  register,
  login,
  logout,
  forgetPassword,
  otpCheaker,
  updateUserProfile,
};
