import { useState } from "react";
import {
  supabase,
  isSupabaseConfigured,
  getStorageHint,
  uniqueImagePath,
} from "../src/lib/supabase";

const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || "uploads";

export default function TestingPage() {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");

  async function fileUpload() {
    if (!isSupabaseConfigured) {
      setError("Supabase is not configured.");
      setHint("Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then restart npm run dev.");
      return;
    }

    if (!image) {
      setError("Please select a file first.");
      return;
    }

    setUploading(true);
    setError("");
    setHint("");
    setUploadedUrl("");

    // e.g. "products/1730123456789-photo.jpg"
    const filePath = uniqueImagePath(image.name, "products");

    try {
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, image, {
          upsert: false,
          contentType: image.type || "image/jpeg",
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      setUploadedUrl(data.publicUrl);
    } catch (err) {
      const message = err.message || "Upload failed.";
      setError(message);
      setHint(getStorageHint(message) ?? "");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex justify-center items-center bg-base-200 p-6">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Supabase Storage Test</h2>

          {!isSupabaseConfigured && (
            <div className="alert alert-warning text-sm">
              <span>Missing Supabase env vars. Restart dev server after updating .env.</span>
            </div>
          )}

          <p className="text-sm text-base-content/70">
            Bucket: <span className="font-mono font-semibold">{BUCKET}</span>
          </p>

          <input
            type="file"
            accept="image/*"
            className="file-input file-input-bordered w-full"
            onChange={(e) => {
              setImage(e.target.files?.[0] ?? null);
              setError("");
              setHint("");
              setUploadedUrl("");
            }}
          />

          {image && (
            <p className="text-xs text-base-content/60 truncate">{image.name}</p>
          )}

          {error && (
            <div className="alert alert-error text-sm py-2 flex-col items-start gap-1">
              <span className="font-medium">{error}</span>
              {hint && <span className="text-xs opacity-90">{hint}</span>}
            </div>
          )}

          <button
            onClick={fileUpload}
            disabled={uploading || !image || !isSupabaseConfigured}
            className="btn btn-primary"
          >
            {uploading ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                Uploading…
              </>
            ) : (
              "Upload"
            )}
          </button>

          {uploadedUrl && (
            <div className="mt-2">
              <p className="text-sm font-medium text-success mb-2">Upload successful</p>
              <img
                src={uploadedUrl}
                alt="Uploaded"
                className="rounded-lg border border-base-300 max-h-48 object-contain"
              />
              <a
                href={uploadedUrl}
                target="_blank"
                rel="noreferrer"
                className="link link-primary text-xs mt-2 block truncate"
              >
                {uploadedUrl}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
