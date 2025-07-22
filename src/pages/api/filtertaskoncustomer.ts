import type { NextApiRequest, NextApiResponse } from "next";
import { getTasksByCustomerAndProject } from "../../lib/supabaseTasks";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET":
      const { customer, project } = req.query;
      try {
        const data = await getTasksByCustomerAndProject(
          customer as string,
          project as string,
        );
        res.status(200).json({ data });
      } catch {
        console.error(`Failed to fetch tasks for customer:`);
        res.status(500).json({ error: "Failed to fetch tasks" });
      }
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ error: "Method not allowed" });
      break;
  }
}
