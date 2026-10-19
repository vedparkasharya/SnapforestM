import mongoose, { Schema, Document } from "mongoose";

export interface IOfferLetter extends Document {
  offerLetterNumber: string;
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
  employmentType: string;
  workLocation: string;
  salary: string;
  joiningDate: Date;
  issueDate: Date;
  probationPeriod: string;
  reportingTo: string;
  organization: string;
  issuerName: string;
  issuerTitle: string;
  terms: string;
  deliveryMode: "online" | "offline";
  status: "active" | "revoked";
  createdAt: Date;
  updatedAt: Date;
}

const OfferLetterSchema = new Schema<IOfferLetter>({
  offerLetterNumber: { type: String, required: true, unique: true, trim: true, uppercase: true, index: true },
  fullName: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
  jobTitle: { type: String, required: true, trim: true, maxlength: 120 },
  department: { type: String, default: "", trim: true, maxlength: 120 },
  employmentType: { type: String, default: "Internship", trim: true, maxlength: 80 },
  workLocation: { type: String, default: "Remote", trim: true, maxlength: 160 },
  salary: { type: String, default: "As discussed", trim: true, maxlength: 120 },
  joiningDate: { type: Date, required: true },
  issueDate: { type: Date, required: true },
  probationPeriod: { type: String, default: "Not applicable", trim: true, maxlength: 120 },
  reportingTo: { type: String, default: "Team Lead", trim: true, maxlength: 120 },
  organization: { type: String, default: "Snapforest", trim: true, maxlength: 120 },
  issuerName: { type: String, default: "Snapforest", trim: true, maxlength: 120 },
  issuerTitle: { type: String, default: "Authorized Signatory", trim: true, maxlength: 120 },
  terms: { type: String, default: "", trim: true, maxlength: 5000 },
  deliveryMode: { type: String, enum: ["online", "offline"], default: "online", index: true },
  status: { type: String, enum: ["active", "revoked"], default: "active", index: true },
}, { timestamps: true });

OfferLetterSchema.index({ fullName: 1 });
const OfferLetter = mongoose.models.OfferLetter || mongoose.model<IOfferLetter>("OfferLetter", OfferLetterSchema);
export default OfferLetter;
