const mongoose = require("mongoose");
const adminSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  refreshToken: [{ type: String, default: null }],
  dateCreated: { type: Date, default: Date.now() },
  dateModified: { type: Date, default: null },
  forgetPassword: { type: String, default: null },
});
const data = mongoose.model("admin", adminSchema);
module.exports = data;
