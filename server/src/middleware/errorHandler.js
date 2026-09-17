import { ZodError } from "zod";

export function notFound(req, res) {
  res.status(404).json({ error: "Route not found" });
}

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    const first = err.issues[0];
    return res.status(400).json({ error: `${first.path.join(".") || "input"}: ${first.message}` });
  }

  console.error(err);
  const status = err.status || 500;
  // Only app-raised errors (which set a status) expose their code — not raw DB error codes.
  res.status(status).json({
    error: err.message || "Internal server error",
    code: err.status ? err.code : undefined,
  });
}
