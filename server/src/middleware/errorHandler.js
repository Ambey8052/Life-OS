import { ZodError } from "zod";

export function notFound(req, res) {
  res.status(404).json({ error: "Route not found" });
}

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    const first = err.issues[0];
    return res.status(400).json({ error: `${first.path.join(".") || "input"}: ${first.message}` });
  }

  // supabase-js reports an unreachable database as a network error in the message.
  if (/fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT/i.test(`${err.message} ${err.details || ""}`)) {
    console.error("Database unreachable:", err.message);
    return res.status(503).json({
      error: "Can't reach the database right now. If the Supabase project is paused, restore it from the Supabase dashboard.",
    });
  }

  console.error(err);
  const status = err.status || 500;
  // Only app-raised errors (which set a status) expose their code — not raw DB error codes.
  res.status(status).json({
    error: err.message || "Internal server error",
    code: err.status ? err.code : undefined,
  });
}
