import { supabase } from "../../lib/supaBase";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { token } = req.query;
  if (!token) return res.status(400).send("No token");

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("verifyToken", token)
    .single();

  if (!user) return res.status(400).send("Invalid or used link");

  await supabase
    .from("users")
    .update({ verified: true, verifyToken: null })
    .eq("id", user.id);

  res.send("Your email is now verified! You can login.");
}
