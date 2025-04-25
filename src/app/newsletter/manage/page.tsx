"use client";

import { useEffect, useState } from "react";

type Subscription = {
  id: string;
  listName: string;
};

type Tag = {
  id: string;
  name: string;
};

type SubscriberData = {
  name: string;
  email: string;
  subscriptions: Subscription[];
  tags: Tag[];
};

export default function ManageSubscriptionsPage() {
  const [data, setData] = useState<SubscriberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/newsletter/manage");
        if (!res.ok) throw new Error("Failed to fetch data");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <p>Loading your preferences…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!data) return <p>No data found.</p>;

  const removeSubscription = async (id: string) => {
    await fetch("/api/newsletter/manage/remove-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId: id }),
    });
    location.reload();
  };

  const removeTag = async (id: string) => {
    await fetch("/api/newsletter/manage/remove-tag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagId: id }),
    });
    location.reload();
  };

  const unsubscribeAll = async () => {
    if (!confirm("Are you sure you want to unsubscribe from everything?")) return;
    await fetch("/api/newsletter/manage/unsubscribe-all", {
      method: "POST",
    });
    location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Your Preferences</h1>

      <div className="mb-6">
        <p><strong>Name:</strong> {data.name}</p>
        <p><strong>Email:</strong> {data.email}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Subscriptions</h2>
        {data.subscriptions.length === 0 ? (
          <p className="text-gray-500">No active subscriptions.</p>
        ) : (
          <ul className="space-y-2">
            {data.subscriptions.map((sub) => (
              <li key={sub.id} className="flex justify-between items-center border p-2 rounded">
                <span>{sub.listName}</span>
                <button
                  onClick={() => removeSubscription(sub.id)}
                  className="text-red-600 hover:underline"
                >
                  Unsubscribe
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Interests</h2>
        {data.tags.length === 0 ? (
          <p className="text-gray-500">No interests selected.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag) => (
              <div key={tag.id} className="bg-blue-100 px-3 py-1 rounded-full flex items-center">
                <span>{tag.name}</span>
                <button
                  onClick={() => removeTag(tag.id)}
                  className="ml-2 text-sm text-red-600"
                >
                  ✖
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={unsubscribeAll}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Unsubscribe from All Communications
        </button>
      </div>
    </div>
  );
}

