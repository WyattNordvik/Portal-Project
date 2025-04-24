"use client";

import { useSearchParams } from "next/navigation";

export default function ConfirmedPage() {
  const params         = useSearchParams();
  const listName       = params.get("listName")       || "your list";
  const subscriberName = params.get("subscriberName") || "";

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Subscription Confirmed!</h1>
      <p>
        You have been added to the <strong>{listName}</strong> list
        {subscriberName && <>, {subscriberName}</>}
        .
      </p>
      <p className="mt-4">Thank you!</p>
      <p className="mt-4">
        <a href="/" className="text-blue-600 hover:underline">
          Return to Home
        </a>
      </p>
    </div>
  );
}

