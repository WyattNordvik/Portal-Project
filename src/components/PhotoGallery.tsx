// src/components/PhotoGallery.tsx
"use client";

import { useEffect, useState } from "react";

type FileRecord = {
  id: string;
  filename: string;
  url: string;
  createdAt: string;
};

const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];

export default function PhotoGallery() {
  const [images, setImages] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/files/list")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch files");
        return res.json();
      })
      .then((data: FileRecord[]) => {
        setImages(
          data.filter((f) =>
            imageExtensions.some((ext) => f.filename.toLowerCase().endsWith(ext))
          )
        );
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/files/delete?id=${id}`, { method: "DELETE" });
    setImages(images.filter((img) => img.id !== id));
  };

  if (loading) return <p>Loading gallery…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (images.length === 0) return <p>No images uploaded yet.</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Photo Gallery</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img.id} className="relative">
            <img
              src={img.url}
              alt={img.filename}
              className="cursor-pointer object-cover w-full h-40 rounded"
              onClick={() => setLightbox(img.url)}
            />
            <button
              onClick={() => handleDelete(img.id)}
              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* Lightbox overlay */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="Preview" className="max-h-full max-w-full rounded" />
        </div>
      )}
    </div>
  );
}
