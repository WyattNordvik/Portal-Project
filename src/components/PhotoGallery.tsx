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
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch files");
        return res.json();
      })
      .then((data: FileRecord[]) => {
        const imgs = data.filter(f =>
          imageExtensions.some(ext => f.filename.toLowerCase().endsWith(ext))
        );
        setImages(imgs);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading gallery…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (images.length === 0) return <p>No images uploaded yet.</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Photo Gallery</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map(img => (
          <img
            key={img.id}
            src={img.url}
            alt={img.filename}
            className="cursor-pointer object-cover w-full h-40 rounded"
            onClick={() => setLightbox(img.url)}
          />
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
