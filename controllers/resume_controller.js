const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/appError");
const ResumeModel = require("../model/resume_model");
const {
  validateResumeData,
  editValidateResumeData,
} = require("../utils/joi_validator_util");
const { successMessage } = require("../functions/utility.functions");

// route /api/v1/resume/
// method POST
// @privacy all can do this
const createResume = async (req, res, next) => {
  try {
    req.body.userId = req.user.id;
    const validationResult = validateResumeData(req.body);

    if (validationResult.error) {
      return next(
        new AppError(validationResult.error.message, StatusCodes.BAD_REQUEST)
      );
    }

    const resumeData = validationResult.value;
    const newResume = await ResumeModel.create(resumeData);
    return successMessage(StatusCodes.ACCEPTED, res, null, newResume);
  } catch (error) {
    return next(new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

// route /api/v1/resume/
// method GET
// @privacy all can do this
const findAllResumes = async (req, res, next) => {
  try {
    const resumes = await ResumeModel.find({ userId: req.user.id });
    return successMessage(StatusCodes.ACCEPTED, res, null, resumes);
  } catch (error) {
    return next(new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

// route /api/v1/resume/specificResume
// method GET
// @privacy all can do this
const findResumeById = async (req, res, next) => {
  try {
    const { resumeId } = req.query;

    const resume = await ResumeModel.findById(resumeId);

    if (!(resume.userId == req.user.id)) {
      return next(new AppError("this is not resume", StatusCodes.NOT_FOUND));
    }

    if (!resume) {
      return next(new AppError("Resume not found", StatusCodes.NOT_FOUND));
    }

    return successMessage(StatusCodes.ACCEPTED, res, null, resume);
  } catch (error) {
    return next(new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

// route /api/v1/resume/specificResume
// method PUT
// @privacy all can do this
const updateResume = async (req, res, next) => {
  try {
    const { resumeId } = req.query;
    const validationResult = editValidateResumeData(req.body);

    if (validationResult.error) {
      return next(
        new AppError(validationResult.error.message, StatusCodes.BAD_REQUEST)
      );
    }

    // Check if the resume exists and belongs to the user
    const existingResume = await ResumeModel.findById(resumeId);

    if (!existingResume) {
      return next(new AppError("Resume not found", StatusCodes.NOT_FOUND));
    }
    if (existingResume.userId.toString() !== req.user.id) {
      return next(
        new AppError("this is not your resume", StatusCodes.FORBIDDEN)
      );
    }

    // Update the resume
    const updatedResume = await ResumeModel.findByIdAndUpdate(
      resumeId,
      validationResult.value,
      { new: true }
    );

    if (!updatedResume) {
      return next(new AppError("Resume not found", StatusCodes.NOT_FOUND));
    }
    return successMessage(
      StatusCodes.ACCEPTED,
      res,
      "resume updated successfully",
      updatedResume
    );
  } catch (error) {
    return next(new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

// route /api/v1/resume/specificResume
// method DELETE
// @privacy all can do this
const deleteResume = async (req, res, next) => {
  try {
    const { resumeId } = req.query;
    const resume = await ResumeModel.findById(resumeId);
    if (!resume) {
      return next(new AppError("Resume not found", StatusCodes.NOT_FOUND));
    }

    if (resume.userId.toString() !== req.user.id) {
      return next(
        new AppError("this is not your resume", StatusCodes.FORBIDDEN)
      );
    }

    const deletedResume = await ResumeModel.findByIdAndDelete(resumeId);
    if (!deletedResume) {
      return next(new AppError("Resume not found", StatusCodes.NOT_FOUND));
    }
    return successMessage(
      StatusCodes.ACCEPTED,
      res,
      "Resume deleted successfully",
      null
    );
  } catch (error) {
    return next(new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

module.exports = {
  createResume,
  findAllResumes,
  findResumeById,
  updateResume,
  deleteResume,
};
