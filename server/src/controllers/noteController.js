import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { noteCreateSchema, noteUpdateSchema } from "../validators/noteValidators.js";
import { toNoteDTO, fromNoteInput } from "../utils/mappers.js";

export const listNotes = asyncHandler(async (req, res) => {
  const { q } = req.query;

  let query = supabase.from("notes").select("*").eq("user_id", req.userId);
  if (q) query = query.ilike("title", `%${q}%`);
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  res.json(data.map(toNoteDTO));
});

export const createNote = asyncHandler(async (req, res) => {
  const data = noteCreateSchema.parse(req.body);
  const { data: row, error } = await supabase
    .from("notes")
    .insert({ ...fromNoteInput(data), user_id: req.userId })
    .select()
    .single();
  if (error) throw error;
  res.status(201).json(toNoteDTO(row));
});

export const updateNote = asyncHandler(async (req, res) => {
  const data = noteUpdateSchema.parse(req.body);
  const { data: row, error } = await supabase
    .from("notes")
    .update(fromNoteInput(data))
    .eq("id", req.params.id)
    .eq("user_id", req.userId)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!row) return res.status(404).json({ error: "Note not found" });
  res.json(toNoteDTO(row));
});

export const deleteNote = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from("notes")
    .delete()
    .eq("id", req.params.id)
    .eq("user_id", req.userId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) return res.status(404).json({ error: "Note not found" });
  res.status(204).send();
});
