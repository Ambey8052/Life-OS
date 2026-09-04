import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { taskCreateSchema, taskUpdateSchema } from "../validators/taskValidators.js";
import { toTaskDTO, fromTaskInput } from "../utils/mappers.js";

export const listTasks = asyncHandler(async (req, res) => {
  const { status, priority } = req.query;

  let query = supabase.from("tasks").select("*").eq("user_id", req.userId);
  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);
  query = query.order("due_date", { ascending: true, nullsFirst: false }).order("created_at", {
    ascending: false,
  });

  const { data, error } = await query;
  if (error) throw error;
  res.json(data.map(toTaskDTO));
});

export const createTask = asyncHandler(async (req, res) => {
  const data = taskCreateSchema.parse(req.body);
  const { data: row, error } = await supabase
    .from("tasks")
    .insert({ ...fromTaskInput(data), user_id: req.userId })
    .select()
    .single();
  if (error) throw error;
  res.status(201).json(toTaskDTO(row));
});

export const updateTask = asyncHandler(async (req, res) => {
  const data = taskUpdateSchema.parse(req.body);
  const { data: row, error } = await supabase
    .from("tasks")
    .update(fromTaskInput(data))
    .eq("id", req.params.id)
    .eq("user_id", req.userId)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!row) return res.status(404).json({ error: "Task not found" });
  res.json(toTaskDTO(row));
});

export const deleteTask = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", req.params.id)
    .eq("user_id", req.userId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) return res.status(404).json({ error: "Task not found" });
  res.status(204).send();
});
