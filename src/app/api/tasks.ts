import { supabase } from '@/lib/supaBase';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(tasks);
  }

  if (req.method === 'POST') {
    const { title, content, status, priority, customerId, projectId, parentId } = req.body;
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title, content, status, priority, customerId, projectId, parentId }])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  }
}