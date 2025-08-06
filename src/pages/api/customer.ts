import type { NextApiRequest, NextApiResponse } from "next";
import { getAllUsersCustomers } from "../../lib/supabaseTasks";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET":
      const { userId } = req.query;
      if (typeof userId !== "string") {
        return res.status(400).json({ error: "Invalid userId" });
      }
      const userIdNum = Number(userId);
      if (isNaN(userIdNum)) {
        return res.status(400).json({ error: "Invalid userId" });
      }
      try {
        const customers = await getAllUsersCustomers(userIdNum);
        res.status(200).json({ customers });
      } catch (error) {
        console.error("Failed to fetch customers for userId:", userIdNum, error);
        res.status(500).json({ error: "Failed to fetch customers", details: error instanceof Error ? error.message : String(error) });
      }
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ error: "Method not allowed" });
      break;
  }
}
