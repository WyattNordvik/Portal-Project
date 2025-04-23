"use client";
import { useEffect, useState } from "react";

type FileRecord = {
  id: string;
  filename: string;
  url: string;
  uploadedBy: string;
  createdAt: string;
};

export default function FileList() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/files/list")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch files");
        return res.json();
      })
      .then((data) => setFiles(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading files…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (files.length === 0) return <p>No files uploaded yet.</p>;

  return (
    <ul className="space-y-2">
      {files.map((f) => (
        <li key={f.id} className="flex justify-between items-center">
          <a
            href={f.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {f.filename}
          </a>
          <span className="text-sm text-gray-500">
            {new Date(f.createdAt).toLocaleString()}
          </span>
        </li>
      ))}
    </ul>
  );
}

