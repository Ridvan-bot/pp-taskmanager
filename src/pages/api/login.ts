import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { supabase } from "../../lib/supaBase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  try {
    const { data: user } = await supabase
      .from("User")
      .select("*")
      .eq("email", email)
      .single();

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.verified) {
      return res
        .status(403)
        .json({ error: "Please verify your email before logging in." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.status(200).json({ message: "Login successful", success: true });
  } catch (error) {
    console.error("Failed to login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
