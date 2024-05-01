/* jwt */
const JWT = require("jsonwebtoken");
const Email = require("../utils/emails");
/* status codes */
const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");
/* custom error */
/* models */
const admin_model = require("../model/admin_model");
const resume_model = require("../model/resume_model");
const user_model = require("../model/user_model");
/* for hashing */
const CryptoJS = require("crypto-js");
/* verification component */
const { signToken, signRefreshToken } = require("../utils/verifyToken_util");
/* error handling */
const AppError = require("../utils/appError");
/* utility functions */
const {
  validatePassword,
  validateEmailAndPassword,
  successMessage,
  generateRandomString,
} = require("../functions/utility.functions");
// method POST
// route /api/v1/admin/login
// privacy only admin can do this
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const check = validateEmailAndPassword(email, password);
    if (check.length > 0) {
      return next(new AppError(check, StatusCodes.BAD_REQUEST));
    }
    const admin = await admin_model.findOne({ email });
    // Check if admin exist or not
    if (!admin) {
      return next(new AppError("admin not found", StatusCodes.NOT_FOUND));
    } else {
      // Decrypt the password which is stored in Encryption form in database
      const hashedPassword = CryptoJS.AES.decrypt(
        admin.password,
        process.env.CRYPTO_SEC
      );
      const realPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
      if (realPassword !== password) {
        return next(
          new AppError("password is incorrect", StatusCodes.BAD_REQUEST)
        );
      } else {
        const randomString = generateRandomString(40);
        // Create refresh Token
        const refreshTokenIs = signRefreshToken(randomString);
        // ectually it is access token
        const accessToken = signToken(admin._id, randomString);
        let adminIs = await admin_model
          .findByIdAndUpdate(
            admin._id,
            { $push: { refreshToken: refreshTokenIs } },
            { new: true, select: "-password -refreshToken" }
          )
          .lean();
        return successMessage(StatusCodes.ACCEPTED, res, "login success", {
          ...adminIs,
          accessToken,
          refreshToken: refreshTokenIs,
        });
      }
    }
  } catch (error) {
    return next(new AppError(error, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};
// method POST
// route /api/v1/admin/logout
// privacy only specific admin can do this
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
    const admin = await admin_model.findOne({ refreshToken });
    if (!admin) {
      return next(
        new AppError("this refreshToken not exist", StatusCodes.BAD_REQUEST)
      );
    }
    await admin_model.updateOne(
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
// method GET
// route /api/v1/admin/forgetPassword
// privacy only admin can do this
// @details generate send otp
const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.query;
    const user = await admin_model.findOne({ email });
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
// method POST
// route /api/v1/admin/setPassword
// privacy only admin can do this
// @details check otp then change password
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
    const user = await admin_model.findOne({ email });

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

/* profile section */
// method GET
// route /api/v1/admin/userProfile
// @privacy only admin can do this
// @detail get profile
const getUserProfile = async (req, res, next) => {
  try {
    // Assuming you have the user ID from the token
    const userId = req.user.id;
    const user = await admin_model
      .findById(userId)
      .select("-password -refreshToken");

    if (!user) {
      return next(new AppError("User not found.", StatusCodes.NOT_FOUND));
    }
    if (user.profileImg) {
      user = await extractImgUrlSingleRecordAWSflexible(user, "profileImg");
    }
    return successMessage(
      StatusCodes.OK,
      res,
      "User profile retrieved successfully",
      user
    );
  } catch (error) {
    return next(new AppError(error, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};
// method PUT
// route /api/v1/admin/userProfile
// @privacy only admin can do this
// @detail edit profile
const updateUserProfile = async (req, res, next) => {
  try {
    // Assuming you have the user ID from the token
    const userId = req.user.id;

    // Fetch the user from the database
    let user = await admin_model.findById(userId);

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
// method GET
// route /api/v1/admin/dashboard
// @privacy only admin can do this
// @detail get app information
const getDashboardInformation = async (req, res, next) => {
  try {
    // Fetch the user from the database
    let [
      userCount,
      resumeCount,
      friendsAndFamilyUsers,
      socialMediaUsers,
      googleUsers,
      naverBlogUsers,
    ] = await Promise.all([
      admin_model.find().countDocuments(),
      resume_model.find().countDocuments(),
      user_model.find({ findWorkDox: "Friends/Family" }).countDocuments(),
      user_model.find({ findWorkDox: "Social media" }).countDocuments(),
      user_model.find({ findWorkDox: "Google" }).countDocuments(),
      user_model.find({ findWorkDox: "Naver blog" }).countDocuments(),
    ]);

    return successMessage(StatusCodes.OK, res, "App Information", {
      userCount,
      resumeCount,
      friendsAndFamilyUsers,
      socialMediaUsers,
      googleUsers,
      naverBlogUsers,
    });
  } catch (error) {
    return next(new AppError(error, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

module.exports = {
  login,
  logout,
  forgetPassword,
  otpCheaker,
  getUserProfile,
  updateUserProfile,
  getDashboardInformation,
};
