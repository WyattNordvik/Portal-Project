// src/app/forum/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";

interface Props {
  params: {
    slug: string;
  };
}

export default async function ForumChannelPage({ params }: Props) {
  const session = await getServerSession(authOptions);

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

  if (!channel) return redirect("/forum");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">#{channel.name}</h1>

      {session?.user && (
        <form
          action={async (formData) => {
            "use server";

            const session = await getServerSession(authOptions);
            const title = formData.get("title")?.toString().trim();
            const content = formData.get("content")?.toString().trim();

			console.log("DEBUG: session =", session);
			console.log("DEBUG: title =", title);
			console.log("DEBUG: content =", content);

            if (!session?.user?.id || !title || !content) {
              throw new Error("Missing required fields");
            }

            const thread = await prisma.thread.create({
              data: {
                title,
                content,
                forumChannelId: channel.id,
                authorId: session.user.id,
              },
            });

            revalidatePath(`/forum/${params.slug}`);
            redirect(`/forum/${params.slug}/${thread.id}`);
          }}
          className="mb-6 space-y-4"
        >
          <h2 className="text-xl font-semibold">Start a new thread</h2>
          <input
            type="text"
            name="title"
            placeholder="Thread title"
            required
            className="w-full border p-2 rounded"
          />
          <textarea
            name="content"
            placeholder="What do you want to say?"
            required
            className="w-full border p-2 rounded h-32"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Post Thread
          </button>
        </form>
      )}

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

