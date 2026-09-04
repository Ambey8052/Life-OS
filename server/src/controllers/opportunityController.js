import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { opportunityCreateSchema, opportunityUpdateSchema } from "../validators/opportunityValidators.js";
import { computePriorityScore, scoreLabel } from "../utils/priorityScore.js";
import { toOpportunityDTO, fromOpportunityInput } from "../utils/mappers.js";

function withScore(row) {
  const dto = toOpportunityDTO(row);
  const score = computePriorityScore(dto);
  return { ...dto, priorityScore: score, priorityLabel: scoreLabel(score) };
}

export const listOpportunities = asyncHandler(async (req, res) => {
  const { status, category, priority, q } = req.query;

  let query = supabase.from("opportunities").select("*").eq("user_id", req.userId);
  if (status) query = query.eq("status", status);
  if (category) query = query.eq("category", category);
  if (priority) query = query.eq("priority", priority);
  if (q) query = query.ilike("title", `%${q}%`);
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  res.json(data.map(withScore));
});

export const getOpportunity = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", req.params.id)
    .eq("user_id", req.userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return res.status(404).json({ error: "Opportunity not found" });
  res.json(withScore(data));
});

export const createOpportunity = asyncHandler(async (req, res) => {
  const data = opportunityCreateSchema.parse(req.body);
  const { data: row, error } = await supabase
    .from("opportunities")
    .insert({ ...fromOpportunityInput(data), user_id: req.userId })
    .select()
    .single();
  if (error) throw error;
  res.status(201).json(withScore(row));
});

export const updateOpportunity = asyncHandler(async (req, res) => {
  const data = opportunityUpdateSchema.parse(req.body);
  const { data: row, error } = await supabase
    .from("opportunities")
    .update(fromOpportunityInput(data))
    .eq("id", req.params.id)
    .eq("user_id", req.userId)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!row) return res.status(404).json({ error: "Opportunity not found" });
  res.json(withScore(row));
});

export const deleteOpportunity = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from("opportunities")
    .delete()
    .eq("id", req.params.id)
    .eq("user_id", req.userId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) return res.status(404).json({ error: "Opportunity not found" });
  res.status(204).send();
});
