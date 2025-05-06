// src/app/forum/[slug]/[threadId]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface Props {
  params: {
    slug: string;
    threadId: string;
  };
}

export default async function ThreadPage({ params }: Props) {
  const session = await getServerSession(authOptions);

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

  async function postReply(formData: FormData) {
    "use server";

    const content = formData.get("content")?.toString().trim();
    if (!session?.user || !content) return;

    await prisma.reply.create({
      data: {
        content,
        threadId: thread.id,
        authorId: session.user.id,
      },
    });

    revalidatePath(`/forum/${params.slug}/${thread.id}`);
    redirect(`/forum/${params.slug}/${thread.id}`);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{thread.title}</h1>
      <p className="text-sm text-gray-600 mb-4">
        by {thread.author.name || "Unknown"} • {new Date(thread.createdAt).toLocaleString()}
      </p>
      <div className="mb-6 text-gray-800 whitespace-pre-line">{thread.content}</div>

      <h2 className="text-xl font-semibold mb-2">Replies</h2>
      <ul className="space-y-4 mb-6">
        {thread.replies.map((reply) => (
          <li key={reply.id} className="border p-3 rounded shadow">
            <p className="text-sm text-gray-600">
              {reply.author.name || "Unknown"} • {new Date(reply.createdAt).toLocaleString()}
            </p>
            <div className="mt-1 text-gray-800 whitespace-pre-line">{reply.content}</div>
          </li>
        ))}
      </ul>

      {session?.user && (
        <form action={postReply} className="space-y-4">
          <h3 className="text-lg font-medium">Add a reply</h3>
          <textarea
            name="content"
            placeholder="Write your reply..."
            required
            className="w-full border p-2 rounded h-24"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Post Reply
          </button>
        </form>
      )}
    </div>
  );
}

