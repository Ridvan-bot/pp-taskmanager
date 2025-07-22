import { supabase } from "../../lib/supaBase";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { token } = req.query;
  if (!token) return res.status(400).send("Ingen token");

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("verifyToken", token)
    .single();

  if (!user) return res.status(400).send("Ogiltig eller förbrukad länk");

  await supabase
    .from("users")
    .update({ verified: true, verifyToken: null })
    .eq("id", user.id);

  res.send("Din e-post är nu verifierad! Du kan logga in.");
}
