import { createClient } from "@supabase/supabase-js";

// Export the Supabase client with hardcoded credentials
export const supabase = createClient(
  "https://qpkaklmbiwitlroykjim.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwa2FrbG1iaXdpdGxyb3lramltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4MTM4NjIsImV4cCI6MjA1MjM4OTg2Mn0.4y_ogmlsnMMXCaISQeVo-oS6zDJnyAVEeAo6p7Ms97U",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
