import mongoose, { Schema, Document } from "mongoose";

export interface IInternshipApplication extends Document {
  applicationNumber: string;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  branch: string;
  yearOfStudy: string;
  registrationNumber: string;
  internshipRole: string;
  deliveryMode: "online" | "offline";
  utrNumber: string;
  collegeIdUrl?: string;
  resumeUrl?: string;
  motivation: string;
  adminNote?: string;
  status: "submitted" | "reviewing" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const InternshipApplicationSchema = new Schema<IInternshipApplication>({
  applicationNumber: { type: String, required: true, unique: true, index: true },
  fullName: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160, index: true },
  phone: { type: String, required: true, trim: true, maxlength: 20 },
  college: { type: String, required: true, trim: true, maxlength: 180 },
  branch: { type: String, required: true, trim: true, maxlength: 120 },
  yearOfStudy: { type: String, required: true, trim: true, maxlength: 60 },
  registrationNumber: { type: String, required: true, trim: true, maxlength: 80 },
  internshipRole: { type: String, required: true, trim: true, maxlength: 120 },
  deliveryMode: { type: String, enum: ["online", "offline"], required: true },
  utrNumber: { type: String, required: true, trim: true, maxlength: 100 },
  collegeIdUrl: { type: String, default: "" },
  resumeUrl: { type: String, default: "" },
  motivation: { type: String, default: "", trim: true, maxlength: 1500 },
  adminNote: { type: String, default: "", trim: true, maxlength: 1500 },
  status: { type: String, enum: ["submitted", "reviewing", "accepted", "rejected"], default: "submitted", index: true },
}, { timestamps: true });

const InternshipApplication = mongoose.models.InternshipApplication ||
  mongoose.model<IInternshipApplication>("InternshipApplication", InternshipApplicationSchema);
export default InternshipApplication;
