import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, "");
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "Supabase env missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then restart the dev server."
  );
}

export const supabase = createClient(
  supabaseUrl ?? "",
  supabaseAnonKey ?? ""
);

/** Unique path using timestamp (ms since 1970) + original name */
export function uniqueImagePath(originalName, folder = "") {
  const timestamp = Date.now();
  const safeName = (originalName || "image.jpg").replace(/[^\w.-]/g, "_");
  const fileName = `${timestamp}-${safeName}`;
  return folder ? `${folder.replace(/\/$/, "")}/${fileName}` : fileName;
}

export function getStorageHint(errorMessage = "") {
  const msg = errorMessage.toLowerCase();

  if (msg.includes("row-level security") || msg.includes("policy")) {
    return "Storage policy blocked the upload. In Supabase Dashboard → Storage → your bucket → Policies, allow INSERT for anon (or sign in first).";
  }
  if (msg.includes("bucket") && msg.includes("not found")) {
    return `Bucket "${import.meta.env.VITE_SUPABASE_BUCKET || "uploads"}" does not exist. Create it in Supabase Dashboard → Storage.`;
  }
  if (msg.includes("invalid") && msg.includes("key")) {
    return "Invalid anon key. Copy it from Project Settings → API → anon public.";
  }
  if (msg.includes("fetch") || msg.includes("network")) {
    return "Cannot reach Supabase. Check VITE_SUPABASE_URL (no /rest/v1/ at the end).";
  }

  return null;
}
