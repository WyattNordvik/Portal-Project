"use client";

import { useState, useEffect } from "react";

type EventRecord = {
  id: string;
  userId: string;
  action: string;
  metadata?: any;
  createdAt: string;
};

export default function AnalyticsDashboard() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analytics/events")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
      })
      .then(data => setEvents(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading analytics…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      <section>
        <h2 className="text-2xl font-semibold">Recent Events</h2>
        <ul className="space-y-2 mt-4">
          {events.map(e => (
            <li key={e.id} className="flex justify-between">
              <span>{new Date(e.createdAt).toLocaleString()}</span>
              <span className="font-mono">{e.action}</span>
              <span className="italic">by {e.userId}</span>
            </li>
          ))}
        </ul>
      </section>
      {/* TODO: Add stat cards and charts here */}
    </div>
  );
}
