import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = "https://smezvtsrxlgopnkqmyac.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtZXp2dHNyeGxnb3Bua3FteWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MTkyMjAsImV4cCI6MjA1NjM5NTIyMH0.f0KS3qRKj9FN9eobABPXmpJTdwUSzw4AOONUsNGbKyA";

if (!supabaseUrl) {
  throw new Error(
    "Supabase URL must be set in environment variables."
  );
}

if(!supabaseKey) {
    throw new Error("Anon Key must be set in environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);