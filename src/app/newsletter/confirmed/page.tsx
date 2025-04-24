"use client";
import { useSearchParams } from "next/navigation";

export default function ConfirmedPage() {
  const params = useSearchParams();
  const listId = params.get("listId") || "";

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Subscription Confirmed!</h1>
      <p>You’ve been added to the list <strong>{listId}</strong>. Thank you!</p>
    </div>
  );
}

