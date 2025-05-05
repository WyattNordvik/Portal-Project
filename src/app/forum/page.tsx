// src/app/forum/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ForumHomePage() {
  const channels = await prisma.forumChannel.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Forum Channels</h1>
      <ul className="space-y-2">
        {channels.map((channel) => (
          <li key={channel.id}>
            <Link
              className="text-blue-600 hover:underline"
              href={`/forum/${channel.slug}`}
            >
              #{channel.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

