"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function AddSubscriberPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Load available lists and tags
  useEffect(() => {
    fetch("/api/newsletter/lists")
      .then((r) => r.json())
      .then(setLists)
      .catch(() => toast.error("Failed to load lists"));

    fetch("/api/newsletter/tags")
      .then((r) => r.json())
      .then(setTags)
      .catch(() => toast.error("Failed to load tags"));
  }, []);

  const toggleList = (id: string) => {
    setSelectedListIds((prev) =>
      prev.includes(id) ? prev.filter((lid) => lid !== id) : [...prev, id]
    );
  };

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  const saveSubscriber = async () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      const res = await fetch("/api/admin/newsletter/subscribers/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, phone, listIds: selectedListIds, tagIds: selectedTagIds }),
      });
      if (res.ok) {
        toast.success("Subscriber created!");
        window.location.href = "/admin/newsletter/subscribers"; // Redirect after success
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to create subscriber");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create subscriber");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Add New Subscriber</h1>

      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Email *</label>
          <input
            type="email"
            className="border p-2 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Name</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Phone</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Subscribe to Lists</label>
          <div className="flex flex-wrap gap-2">
            {lists.map((list) => (
              <button
                key={list.id}
                onClick={() => toggleList(list.id)}
                className={`px-3 py-1 border rounded ${
                  selectedListIds.includes(list.id)
                    ? "bg-green-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                {list.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Assign Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1 border rounded ${
                  selectedTagIds.includes(tag.id)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={saveSubscriber}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save Subscriber
        </button>
      </div>
    </div>
  );
}

