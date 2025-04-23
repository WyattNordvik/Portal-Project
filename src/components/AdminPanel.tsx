"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  roles: { role: { id: string; name: string } }[];
};

type Role = { id: string; name: string };

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/admin/roles").then((r) => r.json()),
    ])
      .then(([u, r]) => {
        setUsers(u);
        setRoles(r);
      })
      .catch(() => setError("Failed to load admin data"));
  }, []);

  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Roles</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="border px-4 py-2">{u.email}</td>
              <td className="border px-4 py-2">
                {roles.map((r) => {
                  const hasRole = u.roles.some((ur) => ur.role.id === r.id);
                  return (
                    <label key={r.id} className="inline-flex items-center mr-4">
                      <input
                        type="checkbox"
                        checked={hasRole}
                        onChange={async (e) => {
                          const roleIds = e.target.checked
                            ? [...u.roles.map((ur) => ur.role.id), r.id]
                            : u.roles
                                .map((ur) => ur.role.id)
                                .filter((id) => id !== r.id);
                          await fetch("/api/admin/user-roles", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ userId: u.id, roleIds }),
                          });
                        }}
                      />
                      <span className="ml-2">{r.name}</span>
                    </label>
                  );
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
