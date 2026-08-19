import Note from "../models/Note.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { noteCreateSchema, noteUpdateSchema } from "../validators/noteValidators.js";

export const listNotes = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const filter = { userId: req.userId };
  if (q) filter.title = { $regex: q, $options: "i" };

  const notes = await Note.find(filter).sort({ createdAt: -1 });
  res.json(notes);
});

export const createNote = asyncHandler(async (req, res) => {
  const data = noteCreateSchema.parse(req.body);
  const note = await Note.create({ ...data, userId: req.userId });
  res.status(201).json(note);
});

export const updateNote = asyncHandler(async (req, res) => {
  const data = noteUpdateSchema.parse(req.body);
  const note = await Note.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, data, {
    new: true,
    runValidators: true,
  });
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json(note);
});

export const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.status(204).send();
});
