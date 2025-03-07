import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllUsersCustomer } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId } = req.query;
  try {

    if (typeof userId !== 'string') {
      return res.status(400).json({ error: 'Invalid userId' });
    }
    const tasks = await getAllUsersCustomer(userId);
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}