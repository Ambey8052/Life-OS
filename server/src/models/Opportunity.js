import mongoose from "mongoose";

export const CATEGORIES = [
  "job",
  "internship",
  "freelance",
  "hackathon",
  "scholarship",
  "govt_job",
  "govt_scheme",
  "competition",
  "exam",
  "college_application",
  "certification",
  "research",
  "event",
  "other",
];

export const STATUSES = [
  "discovered",
  "saved",
  "applied",
  "screening",
  "assessment",
  "interview",
  "offer",
  "accepted",
  "rejected",
  "withdrawn",
  "expired",
  "on_hold",
];

export const PRIORITIES = ["low", "medium", "high", "critical"];

const opportunitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    title: { type: String, required: true, trim: true },
    organization: { type: String, trim: true },
    category: { type: String, enum: CATEGORIES, default: "other" },

    website: { type: String, trim: true },
    applicationUrl: { type: String, trim: true },

    status: { type: String, enum: STATUSES, default: "saved" },
    priority: { type: String, enum: PRIORITIES, default: "medium" },

    deadline: { type: Date },
    appliedAt: { type: Date },

    interview: {
      scheduled: { type: Boolean, default: false },
      date: { type: Date },
      meetingUrl: { type: String, trim: true },
    },

    salary: { type: String, trim: true },
    location: { type: String, trim: true },

    skills: [{ type: String, trim: true }],

    notes: { type: String, trim: true },

    followUpDate: { type: Date },
  },
  { timestamps: true }
);

opportunitySchema.index({ userId: 1, deadline: 1 });
opportunitySchema.index({ userId: 1, status: 1 });

export default mongoose.model("Opportunity", opportunitySchema);
