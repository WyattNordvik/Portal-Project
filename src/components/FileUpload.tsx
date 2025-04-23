// File: src/components/FileUpload.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function FileUpload() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successUrl, setSuccessUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccessUrl(null);
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !session?.user) {
      setError("No file selected or not signed in.");
      return;
    }
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      // include userId in FormData or headers if needed
      formData.append("userId", session.user.id as string);

      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }
      setSuccessUrl(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="border-dashed border-2 border-gray-300 p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Upload a File</h2>
      <input
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
        className="mb-4"
      />
      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition mr-2"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {successUrl && (
        <p className="text-green-600 mt-2">
          Uploaded! Access it <a href={successUrl} className="underline">here</a>.
        </p>
      )}
    </div>
  );
}

