"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast"; // <== ADD THIS!

export default function ManagePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/newsletter/manage")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  async function removeSubscription(id: string) {
    try {
      const res = await fetch("/api/newsletter/manage/remove-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: id }),
      });
      if (!res.ok) throw new Error();
      toast.success("Unsubscribed successfully!");
      refresh();
    } catch {
      toast.error("Failed to unsubscribe.");
    }
  }

  async function removeTag(id: string) {
    try {
      const res = await fetch("/api/newsletter/manage/remove-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId: id }),
      });
      if (!res.ok) throw new Error();
      toast.success("Tag removed!");
      refresh();
    } catch {
      toast.error("Failed to remove tag.");
    }
  }

  async function unsubscribeAll() {
    if (!confirm("Are you sure you want to unsubscribe from everything?")) return;
    try {
      const res = await fetch("/api/newsletter/manage/unsubscribe-all", {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      toast.success("Unsubscribed from everything!");
      refresh();
    } catch {
      toast.error("Failed to unsubscribe from everything.");
    }
  }

  function refresh() {
    setLoading(true);
    fetch("/api/newsletter/manage")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }

  if (loading) return <p>Loading...</p>;
  if (!data) {
	  return <div>Loading your subscriptions...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Your Subscriptions</h1>

      {/* Render Subscriptions */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Subscribed Lists</h2>
        {data.subscriptions.map((s: any) => (
          <div key={s.id} className="flex items-center justify-between mb-2">
            <span>{s.listName}</span>
            <button
              onClick={() => removeSubscription(s.id)}
              className="text-sm text-red-500 hover:underline"
            >
              Unsubscribe
            </button>
          </div>
        ))}
      </div>

      {/* Render Tags */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Your Interests</h2>
        {data.tags.map((t: any) => (
          <div key={t.id} className="flex items-center justify-between mb-2">
            <span>{t.name}</span>
            <button
              onClick={() => removeTag(t.id)}
              className="text-sm text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={unsubscribeAll}
        className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
      >
        Unsubscribe from All
      </button>
    </div>
  );
}

