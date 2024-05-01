const express = require("express");
const {
  createResume,
  findAllResumes,
  findResumeById,
  updateResume,
  deleteResume,
} = require("../controllers/resume_controller");
const ROUTE = express.Router();

const { verifyAll } = require("../utils/verifyToken_util");

// route /api/v1/resume/
// method POST
// @privacy all can do this
ROUTE.route("/").post(verifyAll, createResume);

// route /api/v1/resume/
// method GET
// @privacy all can do this
ROUTE.route("/").get(verifyAll, findAllResumes);

// route /api/v1/resume/specificResume
// method GET
// @privacy all can do this
ROUTE.route("/specificResume").get(verifyAll, findResumeById);

// route /api/v1/resume/specificResume
// method PUT
// @privacy all can do this
ROUTE.route("/specificResume").put(verifyAll, updateResume);

// route /api/v1/resume/specificResume
// method DELETE
// @privacy all can do this
ROUTE.route("/specificResume").delete(verifyAll, deleteResume);

module.exports = ROUTE;
