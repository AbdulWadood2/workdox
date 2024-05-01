const mongoose = require("mongoose");
const adminSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  findWorkDox: {
    type: String,
    enum: ["Friends/Family", "Social media", "Google", "Naver blog"],
    required: true,
  },
  refreshToken: [{ type: String, default: null, required: true }],
  dateCreated: { type: Date, default: Date.now() },
  dateModified: { type: Date, default: null },
  forgetPassword: { type: String, default: null },
});
const data = mongoose.model("user", adminSchema);
module.exports = data;
