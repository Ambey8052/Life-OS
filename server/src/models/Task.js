import mongoose from "mongoose";

export const TASK_STATUSES = ["todo", "in_progress", "done"];
export const TASK_PRIORITIES = ["low", "medium", "high", "critical"];

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    dueDate: { type: Date },
    priority: { type: String, enum: TASK_PRIORITIES, default: "medium" },
    status: { type: String, enum: TASK_STATUSES, default: "todo" },

    linkedOpportunityId: { type: mongoose.Schema.Types.ObjectId, ref: "Opportunity" },

    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, status: 1 });

export default mongoose.model("Task", taskSchema);
