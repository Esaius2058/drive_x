import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Supabase URL must be set in environment variables."
  );
}

if(!supabaseKey) {
    throw new Error("Anon Key must be set in environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);