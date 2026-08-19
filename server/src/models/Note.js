import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    title: { type: String, required: true, trim: true },
    content: { type: String, trim: true },

    tags: [{ type: String, trim: true }],

    linkedOpportunityId: { type: mongoose.Schema.Types.ObjectId, ref: "Opportunity" },
  },
  { timestamps: true }
);

noteSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Note", noteSchema);
