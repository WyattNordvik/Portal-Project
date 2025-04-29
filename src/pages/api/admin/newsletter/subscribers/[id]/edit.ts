import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const userId = String(session.user.id);
  const isAdmin = await prisma.userRole.findFirst({
    where: { userId, role: { name: "admin" } },
  });
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

  if (req.method !== "PATCH" && req.method !== "POST") {
    res.setHeader("Allow", ["PATCH", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id } = req.query;
  const { email, name, phone, listIds = [], tagIds = [] } = req.body;

  try {
    // Update subscriber core fields
    const updatedSubscriber = await prisma.subscriber.update({
      where: { id: String(id) },
      data: {
        email,
        name,
        phone,
        // Reset and recreate subscriptions and tags
        subscriptions: {
          deleteMany: {},
          create: listIds.map((listId: string) => ({
            listId,
            status: "ACTIVE",
          })),
        },
        tags: {
          deleteMany: {},
          create: tagIds.map((tagId: string) => ({
            tagId,
          })),
        },
      },
    });

    return res.status(200).json(updatedSubscriber);
  } catch (error) {
    console.error("Error updating subscriber:", error);
    return res.status(500).json({ error: "Failed to update subscriber" });
  }
}

