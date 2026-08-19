import Task from "../models/Task.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { taskCreateSchema, taskUpdateSchema } from "../validators/taskValidators.js";

export const listTasks = asyncHandler(async (req, res) => {
  const { status, priority } = req.query;
  const filter = { userId: req.userId };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const tasks = await Task.find(filter).sort({ dueDate: 1, createdAt: -1 });
  res.json(tasks);
});

export const createTask = asyncHandler(async (req, res) => {
  const data = taskCreateSchema.parse(req.body);
  const task = await Task.create({ ...data, userId: req.userId });
  res.status(201).json(task);
});

export const updateTask = asyncHandler(async (req, res) => {
  const data = taskUpdateSchema.parse(req.body);
  const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, data, {
    new: true,
    runValidators: true,
  });
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.status(204).send();
});
