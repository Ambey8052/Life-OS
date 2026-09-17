import "dotenv/config";
import app from "./app.js";
import { pingSupabase } from "./config/supabase.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`LifeOS server listening on port ${PORT}`);
  pingSupabase()
    .then(() => {
      console.log("Supabase connected successfully");
    })
    .catch((err) => {
      console.warn("Warning: Supabase connection failed on startup:", err.message);
      console.warn("Server is running, but database operations will fail until valid Supabase credentials and network connectivity are established.");
    });
});

