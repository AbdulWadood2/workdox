function validateEmail(email) {
  // Regular expression for a basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function validatePassword(password) {
  // Password should be at least 8 characters long and contain at least one digit and one special character
  const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{8,}$/;
  return passwordRegex.test(password);
}

let getExtensionOfFile = (fileName) => {
  let lastDotIndex = fileName.lastIndexOf(".");

  // Split the string into two parts based on the last dot
  let firstPart = fileName.substring(0, lastDotIndex);
  let secondPart = fileName.substring(lastDotIndex + 1);

  // Create an array with the two parts
  return secondPart;
};
let isValidObjectId = (str) => {
  /* mongoose */
  const mongoose = require("mongoose");
  if (!mongoose.Types.ObjectId.isValid(str)) {
    return false;
  }
  return true;
};
let generateRandomString = (length) => {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
};
let validateEmailAndPassword = (email, password) => {
  const error = [];
  if (!email) {
    error.push("email");
  } else if (!validateEmail(email)) {
    error.push("this is not a valid email address");
  }
  if (!password) {
    error.push("password");
  } else if (!validatePassword(password)) {
    error.push(
      "Password should be at least 8 characters long and contain at least one digit and one special character"
    );
  }
  return error;
};
let validatePasswordIs = (password) => {
  const error = [];
  if (!password) {
    error.push("password");
  } else if (!validatePassword(password)) {
    error.push(
      "Password should be at least 8 characters long and contain at least one digit and one special character"
    );
  }
  return error;
};
let successMessage = (statusCode, res, message, data) => {
  return res.status(statusCode).json({
    status: "success",
    data,
    message,
  });
};

module.exports = {
  getExtensionOfFile,
  isValidObjectId,
  generateRandomString,
  validateEmailAndPassword,
  validatePassword: validatePasswordIs,
  successMessage,
};
