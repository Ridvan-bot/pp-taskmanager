import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllUsersCustomers } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      const { userId } = req.query;
      try {
        if (typeof userId !== 'string') {
          return res.status(400).json({ error: 'Invalid userId' });
        }
        const customers = await getAllUsersCustomers(userId);
        res.status(200).json({customers});
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
      }
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ error: 'Method not allowed' });
      break;
  }
}