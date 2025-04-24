"use client";
import { useEffect, useState } from "react";

export default function NewsletterListsPage() {
  const [lists, setLists] = useState<{ id:string; name:string }[]>([]);
  const [name, setName]   = useState("");

  useEffect(() => {
    fetch("/api/newsletter/lists")
      .then(r => r.json())
      .then(setLists);
  }, []);

  const addList = async () => {
    const res = await fetch("/api/newsletter/lists", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name }),
    });
    if (res.ok) {
      const newList = await res.json();
      setLists((l) => [...l, newList]);
      setName("");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Newsletter Lists</h1>
      <div className="mb-6">
        <input
          className="border p-2 mr-2"
          placeholder="New list name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={addList} className="px-4 py-2 bg-green-600 text-white rounded">
          Add List
        </button>
      </div>
      <ul className="list-disc pl-6">
        {lists.map((l) => (
          <li key={l.id}>{l.name}</li>
        ))}
      </ul>
    </div>
  );
}

