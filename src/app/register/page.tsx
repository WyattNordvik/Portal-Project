// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [email,    setEmail]    = useState("");
  const [name,     setName]     = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Registration failed");
    } else {
      // After successful signup, redirect to sign-in
      router.push("/signin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center">Sign Up</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <label className="block mb-4">
          <span className="text-gray-700">Name</span>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)} required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400"
          />
        </label>
        <label className="block mb-4">
          <span className="text-gray-700">Email</span>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)} required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400"
          />
        </label>
        <label className="block mb-6">
          <span className="text-gray-700">Password</span>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)} required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400"
          />
        </label>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}

