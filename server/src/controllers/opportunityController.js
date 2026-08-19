import Opportunity from "../models/Opportunity.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { opportunityCreateSchema, opportunityUpdateSchema } from "../validators/opportunityValidators.js";
import { computePriorityScore, scoreLabel } from "../utils/priorityScore.js";

function withScore(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  const score = computePriorityScore(obj);
  return { ...obj, priorityScore: score, priorityLabel: scoreLabel(score) };
}

export const listOpportunities = asyncHandler(async (req, res) => {
  const { status, category, priority, q } = req.query;
  const filter = { userId: req.userId };
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;
  if (q) filter.title = { $regex: q, $options: "i" };

  const opportunities = await Opportunity.find(filter).sort({ createdAt: -1 });
  res.json(opportunities.map(withScore));
});

export const getOpportunity = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findOne({ _id: req.params.id, userId: req.userId });
  if (!opportunity) return res.status(404).json({ error: "Opportunity not found" });
  res.json(withScore(opportunity));
});

export const createOpportunity = asyncHandler(async (req, res) => {
  const data = opportunityCreateSchema.parse(req.body);
  const opportunity = await Opportunity.create({ ...data, userId: req.userId });
  res.status(201).json(withScore(opportunity));
});

export const updateOpportunity = asyncHandler(async (req, res) => {
  const data = opportunityUpdateSchema.parse(req.body);
  const opportunity = await Opportunity.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    data,
    { new: true, runValidators: true }
  );
  if (!opportunity) return res.status(404).json({ error: "Opportunity not found" });
  res.json(withScore(opportunity));
});

export const deleteOpportunity = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!opportunity) return res.status(404).json({ error: "Opportunity not found" });
  res.status(204).send();
});
