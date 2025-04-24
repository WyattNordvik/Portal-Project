
// src/pages/api/newsletter/confirm.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma }                              from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = Array.isArray(req.query.token) ? req.query.token[0] : req.query.token;
  if (!token) {
    return res.status(400).send("Missing token");
  }

  // Find the pending subscription by token
  const sub = await prisma.subscription.findFirst({
    where: { confirmToken: token },
    include: { subscriber: true, list: true },
  });
  if (!sub) {
    return res.status(404).send("Subscription not found or already confirmed");
  }

  // 1) Update the subscription to ACTIVE
  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status:       "ACTIVE",
      confirmedAt:  new Date(),
      subscribedAt: sub.subscribedAt ?? new Date(),
      confirmToken: null,
    },
  });

  // 2) URL-encode list & subscriber names for the redirect
  const listName       = encodeURIComponent(sub.list.name);
  const subscriberName = encodeURIComponent(sub.subscriber.name || "");

  // 3) Redirect to the client-side thank-you page
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";
  return res.redirect(
    `${base}/newsletter/confirmed?listName=${listName}&subscriberName=${subscriberName}`
  );
}

