import type { NextApiRequest, NextApiResponse } from 'next';
import { getTasksByCustomerName } from '../../lib/prisma';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            const { customer } = req.query;
            try {
                const data = await getTasksByCustomerName(customer as string);
                res.status(200).json({ data });
            } catch (error) {
                console.error(`Failed to fetch tasks for customer:`, error);
            }
            break;
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).json({ error: 'Method not allowed' });
            break;
    }
};