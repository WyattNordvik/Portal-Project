// src/app/forum/[slug]/[threadId]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface Props {
  params: {
    slug: string;
    threadId: string;
  };
}

export default async function ThreadPage({ params }: Props) {
  const thread = await prisma.thread.findUnique({
    where: { id: params.threadId },
    include: {
      author: true,
      replies: {
        orderBy: { createdAt: "asc" },
        include: { author: true },
      },
      channel: true,
    },
  });

  if (!thread || thread.channel.slug !== params.slug) return notFound();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{thread.title}</h1>
      <p className="text-sm text-gray-600 mb-4">
        by {thread.author.name || "Unknown"} • {new Date(thread.createdAt).toLocaleString()}
      </p>
      <div className="mb-6 text-gray-800 whitespace-pre-line">{thread.content}</div>

      <h2 className="text-xl font-semibold mb-2">Replies</h2>
      <ul className="space-y-4">
        {thread.replies.map((reply) => (
          <li key={reply.id} className="border p-3 rounded shadow">
            <p className="text-sm text-gray-600">
              {reply.author.name || "Unknown"} • {new Date(reply.createdAt).toLocaleString()}
            </p>
            <div className="mt-1 text-gray-800 whitespace-pre-line">{reply.content}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

