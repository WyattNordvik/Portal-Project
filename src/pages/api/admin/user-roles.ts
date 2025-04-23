// src/pages/api/admin/user-roles.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, roleIds } = req.body as { userId: string; roleIds: string[] };
  if (!userId || !Array.isArray(roleIds)) {
    return res.status(400).json({ error: 'Missing userId or roleIds' });
  }

  try {
    // Remove existing roles
    await prisma.userRole.deleteMany({ where: { userId } });
    // Assign new roles
    const creates = roleIds.map(roleId =>
      prisma.userRole.create({ data: { userId, roleId } })
    );
    await Promise.all(creates);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Update user roles error:', err);
    return res.status(500).json({ error: 'Failed to update roles' });
  }
}
