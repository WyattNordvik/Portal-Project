// src/pages/api/admin/roles.ts
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
    const roles = await prisma.role.findMany();
    return res.status(200).json(roles);
  } catch (err) {
    console.error('List roles error:', err);
    return res.status(500).json({ error: 'Failed to fetch roles' });
  }
}
