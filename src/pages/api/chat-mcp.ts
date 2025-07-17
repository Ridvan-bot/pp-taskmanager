import type { NextApiRequest, NextApiResponse } from 'next';
import { createChatCompletion } from '@/utils/mcp/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { messages } = req.body;
    const result = await createChatCompletion(messages);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'MCP error', details: String(err) });
  }
} 