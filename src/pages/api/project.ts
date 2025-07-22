import type { NextApiRequest, NextApiResponse } from "next";
import { getAllTasks, createTask, getAllUsersTasks } from "../../lib/supabaseTasks";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET":
      const { userId } = req.query;
      if (userId) {
        if (typeof userId !== "string") {
          return res.status(400).json({ error: "Invalid userId" });
        }
        const userIdNum = Number(userId);
        if (isNaN(userIdNum)) {
          return res.status(400).json({ error: "Invalid userId" });
        }
        const tasks = await getAllUsersTasks(userIdNum);
        return res.status(200).json({ tasks });
      } else {
        const tasks = await getAllTasks();
        res.status(200).json(tasks);
      }
      break;
    case "POST":
      try {
        const { title, content, priority, status, customerId, projectId } =
          req.body;
        console.log("Incoming data:", {
          title,
          content,
          priority,
          status,
          customerId,
          projectId,
        });
        if (
          !title ||
          !content ||
          !priority ||
          !status ||
          !customerId ||
          !projectId
        ) {
          throw new Error("Missing required fields");
        }
        const newTask = await createTask({
          title,
          content,
          priority,
          status,
          customerId,
          projectId,
          parentId: null,
        });
        res.status(201).json(newTask);
      } catch (error) {
        console.error("Failed to create task:", error);
        res.status(500).json({ error: "Failed to create task" });
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
}
