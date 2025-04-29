import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) Auth + admin check
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });
  const userId = String(session.user.id);
  const isAdmin = await prisma.userRole.findFirst({
    where: { userId, role: { name: "admin" } },
  });
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

  // 2) Only allow POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email, name, phone, listIds = [], tagIds = [] } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const newSubscriber = await prisma.subscriber.create({
      data: {
        email,
        name,
        phone,
        subscriptions: {
          create: listIds.map((listId: string) => ({
            listId,
            status: "ACTIVE",
          })),
        },
        tags: {
          create: tagIds.map((tagId: string) => ({
            tagId,
          })),
        },
      },
    });

    return res.status(200).json(newSubscriber);
  } catch (error) {
    console.error("Error creating subscriber:", error);
    return res.status(500).json({ error: "Failed to create subscriber" });
  }
}

