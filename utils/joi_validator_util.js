const Joi = require("joi");

/* checks is the mongoose id */
const mongoose = require("mongoose");
const isObjectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid ObjectId");
  }
  return value;
});

/* buyer */
const userSignUpSchema = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .required()
    .min(8)
    .regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)
    .required()
    .message(
      "Password should be at least 8 characters long and contain at least one digit and one special character"
    ),
  findWorkDox: Joi.string()
    .valid("Friends/Family", "Social media", "Google", "Naver blog")
    .required(),
}).unknown(false);
const validateUserSignUp = (item) => {
  return userSignUpSchema.validate(item, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  });
};
const buyerEditSchema = Joi.object({
  firstName: Joi.string().allow(null),
  lastName: Joi.string().allow(null),
  password: Joi.string()
    .allow(null)
    .required()
    .min(8)
    .regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)
    .required()
    .message(
      "Password should be at least 8 characters long and contain at least one digit and one special character"
    ),
}).unknown(false);
const validateBuyerEdit = (product) => {
  return buyerEditSchema.validate(product, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  });
};

const resumeSchema = Joi.object({
  userId: isObjectId,
  titleForResume: Joi.string().required(),
  firstName: Joi.string().allow(null),
  lastName: Joi.string().allow(null),
  email: Joi.string().email().allow(null),
  phoneNumber: Joi.number().allow(null),
  linkedInAccount: Joi.string().allow(null),
  professionalSummary: Joi.string().allow(null),
  professionalExperience: Joi.array().items(
    Joi.object({
      storeName: Joi.string().allow(null),
      position: Joi.string().allow(null),
      startDate: Joi.string().allow(null),
      endDate: Joi.string().allow(null),
      jobResponsibilities: Joi.array().items(Joi.string().allow(null)),
    })
  ),
  keySkillsAndExpertise: Joi.array().items(
    Joi.object({
      certificationName: Joi.string().allow(null),
      issueAuthority: Joi.string().allow(null),
      dateOfAcquisition: Joi.string().allow(null),
    })
  ),
  education: Joi.array().items(
    Joi.object({
      affiliatedInstitution: Joi.string().allow(null),
      degree: Joi.string().allow(null),
      enrollmentDate: Joi.string().allow(null),
      graduationDate: Joi.string().allow(null),
    })
  ),
  reference: Joi.array().items(
    Joi.object({
      name: Joi.string().allow(null),
      title: Joi.string().allow(null),
      contact: Joi.string().allow(null),
    })
  ),
}).unknown(false);

const validateResumeData = (data) => {
  return resumeSchema.validate(data, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  });
};
const editResumeSchema = Joi.object({
  titleForResume: Joi.string().allow(null),
  firstName: Joi.string().allow(null),
  lastName: Joi.string().allow(null),
  email: Joi.string().email().allow(null),
  phoneNumber: Joi.number().allow(null),
  linkedInAccount: Joi.string().allow(null),
  professionalSummary: Joi.string().allow(null),
  professionalExperience: Joi.array().items(
    Joi.object({
      storeName: Joi.string().allow(null),
      position: Joi.string().allow(null),
      startDate: Joi.string().allow(null),
      endDate: Joi.string().allow(null),
      jobResponsibilities: Joi.array().items(Joi.string().allow(null)),
    })
  ),
  keySkillsAndExpertise: Joi.array().items(
    Joi.object({
      certificationName: Joi.string().allow(null),
      issueAuthority: Joi.string().allow(null),
      dateOfAcquisition: Joi.string().allow(null),
    })
  ),
  education: Joi.array().items(
    Joi.object({
      affiliatedInstitution: Joi.string().allow(null),
      degree: Joi.string().allow(null),
      enrollmentDate: Joi.string().allow(null),
      graduationDate: Joi.string().allow(null),
    })
  ),
  reference: Joi.array().items(
    Joi.object({
      name: Joi.string().allow(null),
      title: Joi.string().allow(null),
      contact: Joi.string().allow(null),
    })
  ),
}).unknown(false);

const editValidateResumeData = (data) => {
  return editResumeSchema.validate(data, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  });
};

module.exports = {
  validateUserSignUp,
  validateBuyerEdit,
  validateResumeData,
  editValidateResumeData,
};
