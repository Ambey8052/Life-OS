import "dotenv/config";
import app from "./app.js";
import { pingSupabase } from "./config/supabase.js";

const PORT = process.env.PORT || 5000;

pingSupabase()
  .then(() => {
    console.log("Supabase connected");
    app.listen(PORT, () => console.log(`LifeOS server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to Supabase:", err.message);
    process.exit(1);
  });
