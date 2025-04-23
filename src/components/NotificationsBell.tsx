"use client";

import { useEffect, useState } from "react";
import { BellIcon }            from "@heroicons/react/24/outline";

type Notification = {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationsBell() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [open, setOpen]     = useState(false);

  // Fetch when opened
  useEffect(() => {
    if (open) {
      fetch("/api/notifications")
        .then((res) => (res.ok ? res.json() : []))
        .then(setNotifs)
        .catch(console.error);
    }
  }, [open]);

  const unreadCount = notifs.filter((n) => !n.isRead).length;
  const markAllRead = async () => {
    const ids = notifs.filter((n) => !n.isRead).map((n) => n.id);
    if (!ids.length) return;
    await fetch("/api/notifications", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ids }),
    });
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open) markAllRead();
        }}
        className="relative p-2 focus:outline-none"
      >
        <BellIcon width={24} height={24} className="text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
		  <div 
			className="
				absolute
				top-full
				right-0
				mt-2
				w-56
				max-w-xs
				overflow-y-auto
				bg-white
				border
				rounded
				shadow-lg
				z-50
			  "
			>
          <div className="p-2 border-b flex justify-between items-center">
            <span className="font-semibold">Notifications</span>
            <button className="text-sm text-blue-600" onClick={markAllRead}>
              Mark all read
            </button>
          </div>

          {notifs.length === 0 ? (
            <p className="p-4 text-center text-gray-500">No notifications</p>
          ) : (
            notifs.map((n) => (
              <div
                key={n.id}
                className={`p-3 border-b ${n.isRead ? "bg-white" : "bg-blue-50"}`}
              >
                <p className="text-sm break-words">{n.message}</p>
                <p className="text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

