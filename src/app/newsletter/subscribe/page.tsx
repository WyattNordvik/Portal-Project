"use client";

import { useState } from "react";

export default function SubscribePage() {
  const [email, setEmail]     = useState("");
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [listId, setListId]   = useState("");
  const [lists, setLists]     = useState<{ id: string; name: string }[]>([]);
  const [status, setStatus]   = useState<string | null>(null);

  // Fetch available lists on mount
  useState(() => {
    fetch("/api/newsletter/lists")
      .then((r) => r.json())
      .then(setLists)
      .catch(console.error);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending confirmation…");
    const res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, phone, listId }),
    });
    const json = await res.json();
    if (res.ok) setStatus("Check your email for confirmation link.");
    else       setStatus(`Error: ${json.error}`);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Subscribe</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span>Email *</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border p-2 rounded"
          />
        </label>
        <label className="block">
          <span>Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border p-2 rounded"
          />
        </label>
        <label className="block">
          <span>Phone</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full border p-2 rounded"
          />
        </label>
        <label className="block">
          <span>List *</span>
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

