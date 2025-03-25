import { NextApiRequest, NextApiResponse } from 'next';
import { getTasksByUserId } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const tasks = await getTasksByUserId(userId);
    res.status(200).json({ tasks });
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}
