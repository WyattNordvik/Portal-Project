import type { NextApiRequest, NextApiResponse } from "next";
import { prisma }            from "@/lib/db";
import { nanoid }            from "nanoid";
import { sendEmail }         from "@/lib/email";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email, name, phone, listId, tagIds } = req.body as {
    email: string;
    name?: string;
    phone?: string;
    listId: string;
	tagIds?: string[];
};

  if (!email || !listId) {
    return res.status(400).json({ error: "Email and listId are required" });
  }

  // Upsert subscriber
  const subscriber = await prisma.subscriber.upsert({
    where: { email },
    create: { email, name, phone },
    update: { name, phone },
  });

  // Ensure the list exists
  const list = await prisma.newsletterList.findUnique({ where: { id: listId } });
  if (!list) {
    return res.status(404).json({ error: "List not found" });
  }

  // Create or update a pending subscription
  const token = nanoid();
  const subscription = await prisma.subscription.upsert({
    where: {
      subscriberId_listId: { subscriberId: subscriber.id, listId },
    },
    create: {
      subscriberId: subscriber.id,
      listId,
      status:       "PENDING",
      confirmToken: token,
    },
    update: {
      status:       "PENDING",
      confirmToken: token,
      confirmedAt:  null,
      subscribedAt: null,
    },
  });

	// After creating/upserting the subscription record:
  if (Array.isArray(tagIds) && tagIds.length) {
    for (const tagId of tagIds) {
      // upsert each tag assignment
      await prisma.subscriberTag.upsert({
        where: { subscriberId_tagId: { subscriberId: subscriber.id, tagId } },
        create: { subscriberId: subscriber.id, tagId },
        update: {}, // no-op if already exists
      });
    }
  }

  // Send confirmation email
  const confirmUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/newsletter/confirm?token=${token}`;
  const html = `
    <p>Hi ${subscriber.name || "there"},</p>
    <p>Please confirm your subscription to <strong>${list.name}</strong> by clicking below:</p>
    <p><a href="${confirmUrl}">Confirm Subscription</a></p>
    <p>If you didn’t request this, you can ignore this email.</p>
  `;

  try {
    await sendEmail(subscriber.email, `Confirm your subscription to ${list.name}`, html);
  } catch (e) {
    console.error("Failed to send confirmation email:", e);
  }

  return res.status(200).json({ message: "Confirmation email sent" });
}

