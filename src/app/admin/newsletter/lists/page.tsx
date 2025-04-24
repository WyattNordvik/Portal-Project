"use client";

import { useEffect, useState } from "react";

type List = { id: string; name: string; description: string | null };

export default function NewsletterListsPage() {
  const [lists, setLists]     = useState<List[]>([]);
  const [name, setName]       = useState("");
  const [desc, setDesc]       = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName]   = useState("");
  const [editDesc, setEditDesc]   = useState("");

  // load lists
  useEffect(() => {
    fetch("/api/newsletter/lists")
      .then((r) => r.json())
      .then(setLists);
  }, []);

  // create
  const addList = async () => {
    const res = await fetch("/api/newsletter/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: desc }),
    });
    if (res.ok) {
      const newList = await res.json();
      setLists((l) => [...l, newList]);
      setName(""); setDesc("");
    }
  };

  // start editing
  const startEdit = (list: List) => {
    setEditingId(list.id);
    setEditName(list.name);
    setEditDesc(list.description || "");
  };

  // save edit
  const saveEdit = async (id: string) => {
    const res = await fetch(`/api/newsletter/lists/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDesc }),
    });
    if (res.ok) {
      const updated = await res.json();
      setLists((l) => l.map((x) => (x.id === id ? updated : x)));
      setEditingId(null);
    }
  };

  // delete
  const deleteList = async (id: string) => {
    if (!confirm("Delete this list?")) return;
    const res = await fetch(`/api/newsletter/lists/${id}`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      setLists((l) => l.filter((x) => x.id !== id));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Newsletter Lists</h1>

      {/* Create new */}
      <div className="mb-6 space-y-2">
        <input
          className="border p-2 w-1/3"
          placeholder="List name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border p-2 w-1/2"
          placeholder="Short description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <button
          onClick={addList}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Add List
        </button>
      </div>

      {/* Existing lists */}
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Description</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {lists.map((list) => (
            <tr key={list.id} className="border-t">
              {editingId === list.id ? (
                <>
                  <td className="p-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border p-1 w-full"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="border p-1 w-full"
                    />
                  </td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => saveEdit(list.id)}
                      className="px-2 py-1 bg-blue-600 text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2 py-1 bg-gray-400 text-white rounded"
                    >
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="p-2">{list.name}</td>
                  <td className="p-2">{list.description}</td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => startEdit(list)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteList(list.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

