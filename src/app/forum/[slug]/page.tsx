// src/app/forum/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: {
    slug: string;
  };
}

export default async function ForumChannelPage({ params }: Props) {
  const channel = await prisma.forumChannel.findUnique({
    where: { slug: params.slug },
    include: {
      threads: {
        orderBy: { createdAt: "desc" },
        include: {
          author: true,
        },
      },
    },
  });

  if (!channel) return notFound();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">#{channel.name}</h1>
      <ul className="space-y-4">
        {channel.threads.map((thread) => (
          <li key={thread.id} className="border p-4 rounded shadow">
            <Link
              href={`/forum/${channel.slug}/${thread.id}`}
              className="text-xl font-semibold text-blue-600 hover:underline"
            >
              {thread.title}
            </Link>
            <p className="text-sm text-gray-600">
              by {thread.author.name || "Unknown"} • {new Date(thread.createdAt).toLocaleString()}
            </p>
            <p className="mt-2 text-gray-800">{thread.content.slice(0, 140)}...</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

