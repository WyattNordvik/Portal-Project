"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";

export default function AdminSubscriberPage() {
  const { id } = useParams() as { id: string };
  const [subscriber, setSubscriber] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscriber = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/newsletter/subscribers/${id}`);
      const data = await res.json();
      setSubscriber(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load subscriber");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriber();
  }, [id]);

  if (loading) return <p>Loading subscriber...</p>;
  if (!subscriber) return <p>No subscriber found.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Subscriber</h1>

      <div className="mb-6">
        <p><strong>Name:</strong> {subscriber.name}</p>
        <p><strong>Email:</strong> {subscriber.email}</p>
        <p><strong>Phone:</strong> {subscriber.phone || "N/A"}</p>
      </div>

      <div className="mb-8">
        <h2 className="font-semibold mb-2">Subscribed Lists</h2>
        {subscriber.subscriptions.length === 0 ? (
          <p>No active subscriptions.</p>
        ) : (
          subscriber.subscriptions.map((s: any) => (
            <div key={s.id} className="flex items-center justify-between border-b p-2">
              <span>{s.list.name}</span>
              <button
                onClick={() => handleRemoveList(s.id)}
                className="text-sm text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mb-8">
        <h2 className="font-semibold mb-2">Tags</h2>
        {subscriber.tags.length === 0 ? (
          <p>No tags.</p>
        ) : (
          subscriber.tags.map((t: any) => (
            <div key={t.id} className="flex items-center justify-between border-b p-2">
              <span>{t.tag.name}</span>
              <button
                onClick={() => handleRemoveTag(t.id)}
                className="text-sm text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {/* Future enhancement: add lists and tags */}
    </div>
  );

  async function handleRemoveList(subscriptionId: string) {
    if (!confirm("Remove this subscriber from the list?")) return;
    try {
      const res = await fetch(`/api/admin/newsletter/subscribers/${id}/lists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", subscriptionId }),
      });
      if (!res.ok) throw new Error("Failed to remove");
      toast.success("Subscription removed");
      fetchSubscriber();
    } catch (e) {
      console.error(e);
      toast.error("Error removing subscription");
    }
  }

  async function handleRemoveTag(tagRelationId: string) {
    if (!confirm("Remove this tag from the subscriber?")) return;
    try {
      const res = await fetch(`/api/admin/newsletter/subscribers/${id}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", tagRelationId }),
      });
      if (!res.ok) throw new Error("Failed to remove");
      toast.success("Tag removed");
      fetchSubscriber();
    } catch (e) {
      console.error(e);
      toast.error("Error removing tag");
    }
  }
}

