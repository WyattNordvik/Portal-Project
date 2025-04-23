// src/pages/api/events/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession }   from "next-auth/next";
import { authOptions }        from "@/pages/api/auth/[...nextauth]";
import { prisma }             from "@/lib/db";
import { sendEmail } from "@/lib/email";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) Protect the route
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();

  // 2) List events
  if (req.method === "GET") {
    const events = await prisma.event.findMany({ orderBy: { start: "asc" } });
    return res.status(200).json(events);
  }

  // 3) Create a new event
  if (req.method === "POST") {
    const { title, description, start, end } = req.body;
    // coerce session.user.id into a string
	const userId = String(session.user.id);

	const event = await prisma.event.create({
      data: {
        title,
        description,
        start: new Date(start),
        end: new Date(end),
        createdBy: userId,
      },
    });
	// after creating the event:
	const allUsers = await prisma.user.findMany({ select: { id: true } });
	const notifMessage = `New event created: ${event.title}`;

	await Promise.all(
		allUsers.map(({ id: uid }) =>
			prisma.notification.create({
				data: {
					userId: uid,
					type: "event_created",
					message: notifMessage,
					metadata: { eventId: event.id },
				},
			})
		)
	);

	const admins = await prisma.userRole.findMany({
		where: { role: { name: "admin" } },
		include: { user: true },
});
for (const { user } of admins) {
  await sendEmail(
    user.email,
    "New Event Created",
    `<p>A new event <strong>${event.title}</strong> was just scheduled from ${new Date(event.start).toLocaleString()} to ${new Date(event.end).toLocaleString()}.</p>`
  );
}

    return res.status(201).json(event);
  }

  // 4) Disallow other methods
  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
