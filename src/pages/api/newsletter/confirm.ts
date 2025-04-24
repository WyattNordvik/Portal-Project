import type { NextApiRequest, NextApiResponse } from "next";
import { prisma }                              from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.query;
  if (typeof token !== "string") {
    return res.status(400).send("Invalid token");
  }

  const sub = await prisma.subscription.findFirst({
  where: { confirmToken: token },
  include: { subscriber: true, list: true },
});
  if (!sub) {
    return res.status(404).send("Subscription not found");
  }

  // Mark active
  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status:        "ACTIVE",
      confirmedAt:   new Date(),
      subscribedAt:  sub.subscribedAt ?? new Date(),
      confirmToken:  null,
    },
  });

  // Redirect to a thank-you page
  return res.redirect(`/newsletter/confirmed?listId=${sub.listId}`);
}

