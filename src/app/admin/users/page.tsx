"use client";

import { useState } from "react";

export default function AdminUsersPage() {
  const [status, setStatus] = useState("");

  const exportUsers = () => window.open("/api/admin/users/export", "_blank");

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);

    const res  = await fetch("/api/admin/users/import", { method: "POST", body: form });
    const json = await res.json();
    if (res.ok) setStatus(`Imported ${json.imported} users.`);
    else       setStatus(`Error: ${json.error}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      <button
        onClick={exportUsers}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Export Users (CSV)
      </button>

      <div className="mb-6">
        <label className="block mb-2 font-medium">Import Users (CSV)</label>
        <input type="file" accept=".csv" onChange={onFileChange} />
        {status && <p className="mt-2 text-sm">{status}</p>}
      </div>

      {/* You can add your users table here */}
    </div>
  );
}

