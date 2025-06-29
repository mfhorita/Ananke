import { createClient } from "@supabase/supabase-js"

// Fallback strings ensure createClient never receives `undefined`
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://YOUR_SUPABASE_URL.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY"

if (!supabaseUrl || !supabaseAnonKey) {
  // Extra safeguard with a readable warning in the console
  // (The app will still work in preview mode thanks to placeholders)
  console.warn(
    "Supabase env vars are missing. Using placeholder credentials. " +
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
      "in your project for production.",
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
