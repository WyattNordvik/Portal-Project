"use client";

import { useEffect, useState } from "react";

type FileRecord = { id: string; filename: string; url: string; createdAt: string };
const videoExtensions = [".mp4", ".webm", ".ogg"];

export default function VideoLibrary() {
  const [videos, setVideos] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/files/list")
      .then(res => res.json())
      .then((data: FileRecord[]) => {
        setVideos(data.filter(f => videoExtensions.some(ext => f.filename.toLowerCase().endsWith(ext))));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/files/delete?id=${id}`, { method: "DELETE" });
    setVideos(videos.filter(v => v.id !== id));
  };

  if (loading) return <p>Loading videos…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (videos.length === 0) return <p>No videos uploaded yet.</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Video Library</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {videos.map(v => (
          <div key={v.id} className="space-y-2">
            <video
              src={v.url}
              controls
              className="w-full rounded shadow"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{v.filename}</span>
              <button
                onClick={() => handleDelete(v.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
