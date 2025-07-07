import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllTasks, createTask, getAllUsersTasks, updateTask, deleteTask } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      const { userId } = req.query;
      try {
        if (userId) {
          if (typeof userId !== 'string') {
            return res.status(400).json({ error: 'Invalid userId' });
          }
          const tasks = await getAllUsersTasks(userId);
          res.status(200).json(tasks);
        } else {
          const tasks = await getAllTasks();

          res.status(200).json(tasks);
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
      }
      break;
    case 'POST':
      try {
        const { title, content, priority, status, customerId, projectId, parentId } = req.body;
        if (!title || !content || !priority || !status || !customerId || !projectId) {
          throw new Error('Missing required fields');
        }
        const newTask = await createTask({ title, content, priority, status, customerId, projectId, parentId });
        res.status(201).json(newTask);
      } catch (error) {
        console.error('Failed to create task:', error);
        res.status(500).json({ error: 'Failed to create task' });
      }
      break;
    case 'PUT':
      try {
        const { id, title, content, priority, status, customerId, projectId, parentId } = req.body;
        if (!id || !title || !content || !priority || !status || !customerId || !projectId) {
          throw new Error('Missing required fields');
        }
        const updatedTask = await updateTask(id, { title, content, priority, status, customerId, projectId, parentId });
        res.status(200).json(updatedTask);
      } catch (error) {
        console.error('Failed to update task:', error);
        res.status(500).json({ error: 'Failed to update task' });
      }
      break;
    case 'DELETE': {
      const { id } = req.body;
      try {
        const taskId = parseInt(id, 10);
        const deletedTask = await deleteTask(taskId);
        if (!deletedTask) {
          return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json(deletedTask);
      } catch (error) {
        console.error('Failed to delete task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
      }
      break;
    }
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
}