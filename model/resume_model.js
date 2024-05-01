const mongoose = require("mongoose");
const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  titleForResume: { type: String, required: true },
  firstName: { type: String, default: null },
  lastName: { type: String, default: null },
  email: { type: String, default: null },
  phoneNumber: { type: Number, default: null },
  linkedInAccount: { type: String, default: null },
  professionalSummary: { type: String, default: null },
  professionalExperience: [
    {
      storeName: { type: String, default: null },
      position: { type: String, default: null },
      startDate: { type: String, default: null },
      endDate: { type: String, default: null },
      jobResponsibilities: [{ type: String, default: null }],
    },
  ],
  keySkillsAndExpertise: [
    {
      certificationName: { type: String, default: null },
      issueAuthority: { type: String, default: null },
      dateOfAcquisition: { type: String, default: null },
    },
  ],
  education: [
    {
      affiliatedInstitution: { type: String, default: null },
      degree: { type: String, default: null },
      enrollmentDate: { type: String, default: null },
      graduationDate: { type: String, default: null },
    },
  ],
  reference: [
    {
      name: { type: String, default: null },
      title: { type: String, default: null },
      contact: { type: String, default: null },
    },
  ],
});
const data = mongoose.model("resume", resumeSchema);
module.exports = data;
