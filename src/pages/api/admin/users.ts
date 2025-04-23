// src/pages/api/admin/users.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const users = await prisma.user.findMany({
      include: {
        roles: { include: { role: true } }
      }
    });
    return res.status(200).json(users);
  } catch (err) {
    console.error('List users error:', err);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}
