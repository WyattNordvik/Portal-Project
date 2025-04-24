"use client";

import { useEffect, useState } from "react";

type AuditLog = {
  id: string;
  userId: string;
  action: string;
  metadata: any;
  createdAt: string;
};

export default function AuditPage() {
  const [logs, setLogs]     = useState<AuditLog[]>([]);
  const [error, setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/audit")
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setLogs(data);
        } else {
          setError(data.error || "Failed to load audit logs.");
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading audit logs…</p>;
  if (error)   return <p className="text-red-600">Error: {error}</p>;
  if (logs.length === 0) return <p>No audit logs to display.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
      <div className="max-h-[400px] overflow-y-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Time</th>
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Action</th>
              <th className="p-2 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="p-2">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="p-2">{log.userId}</td>
                <td className="p-2">{log.action}</td>
                <td className="p-2">
                  <pre className="whitespace-pre-wrap text-sm">
                    {JSON.stringify(log.metadata)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

