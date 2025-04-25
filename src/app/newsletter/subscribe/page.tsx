"use client";

import { useState, useEffect } from "react";

export default function SubscribePage() {
  const [email, setEmail]       = useState("");
  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState("");
  const [listId, setListId]     = useState("");
  const [lists, setLists]       = useState<{ id: string; name: string }[]>([]);
  const [tags, setTags]         = useState<{ id: string; name: string }[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [status, setStatus]     = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/newsletter/lists")
      .then((r) => r.json())
      .then(setLists);
    fetch("/api/newsletter/tags")
      .then((r) => r.json())
      .then(setTags);
  }, []);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, name, phone, listId, tagIds: selectedTagIds });
    setStatus("Sending confirmation…");

    const res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, phone, listId, tagIds: selectedTagIds }),
    });
    const json = await res.json();
    if (res.ok) setStatus("Check your email for confirmation link.");
    else       setStatus(`Error: ${json.error}`);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Subscribe</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <label className="block">
          <span className="font-medium">Email *</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border p-2 rounded"
          />
        </label>

        {/* Name */}
        <label className="block">
          <span className="font-medium">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border p-2 rounded"
          />
        </label>

        {/* Phone */}
        <label className="block">
          <span className="font-medium">Phone</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full border p-2 rounded"
          />
        </label>

        {/* List selector */}
        <label className="block">
          <span className="font-medium">Choose List *</span>
          <select
            required
            value={listId}
            onChange={(e) => setListId(e.target.value)}
            className="mt-1 block w-full border p-2 rounded"
          >
            <option value="">Select a list</option>
            {lists.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>

        {/* Tag checkboxes */}
        <fieldset>
          <legend className="font-medium mb-2">Interests (Tags)</legend>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <label key={t.id} className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={selectedTagIds.includes(t.id)}
                  onChange={() => toggleTag(t.id)}
                />
                <span>{t.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Subscribe
        </button>
      </form>
      {status && <p className="mt-4 text-center">{status}</p>}
    </div>
  );
}

