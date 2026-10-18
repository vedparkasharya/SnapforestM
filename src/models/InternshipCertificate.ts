import mongoose, { Schema, Document } from "mongoose";

export interface IInternshipCertificate extends Document {
  certificateNumber: string;
  fullName: string;
  email: string;
  internshipRole: string;
  department: string;
  organization: string;
  issuerName: string;
  issuerTitle: string;
  allotmentDate: Date;
  startDate: Date;
  endDate: Date;
  issueDate: Date;
  description: string;
  skills: string[];
  status: "active" | "revoked";
  createdAt: Date;
  updatedAt: Date;
}

const InternshipCertificateSchema = new Schema<IInternshipCertificate>({
  certificateNumber: { type: String, required: true, unique: true, trim: true, uppercase: true, index: true },
  fullName: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, default: "", trim: true, lowercase: true, maxlength: 160 },
  internshipRole: { type: String, required: true, trim: true, maxlength: 120 },
  department: { type: String, default: "", trim: true, maxlength: 120 },
  organization: { type: String, default: "Snapforest", trim: true, maxlength: 120 },
  issuerName: { type: String, default: "Snapforest", trim: true, maxlength: 120 },
  issuerTitle: { type: String, default: "Authorized Signatory", trim: true, maxlength: 120 },
  allotmentDate: { type: Date, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  issueDate: { type: Date, required: true },
  description: { type: String, default: "", trim: true, maxlength: 1500 },
  skills: { type: [String], default: [] },
  status: { type: String, enum: ["active", "revoked"], default: "active", index: true },
}, { timestamps: true });

InternshipCertificateSchema.index({ fullName: 1 });
const InternshipCertificate = mongoose.models.InternshipCertificate ||
  mongoose.model<IInternshipCertificate>("InternshipCertificate", InternshipCertificateSchema);
export default InternshipCertificate;
