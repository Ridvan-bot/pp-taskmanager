import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { supabase } from "../../lib/supaBase";
import { rateLimit } from "../../lib/rateLimit";
import crypto from "crypto";
import { sendVerificationEmail } from "../../lib/sendMail";

// Rate limiting storage (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries every 10 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  },
  10 * 60 * 1000,
);

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5; // Max 5 attempts per 15 minutes

  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await rateLimit(req.socket.remoteAddress || "", 5);
  } catch {
    return res
      .status(429)
      .json({
        error: "För många registreringsförsök. Försök igen om en minut.",
      });
  }

  // Get client IP
  const clientIp =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress || "unknown";
  const ip = Array.isArray(clientIp) ? clientIp[0] : clientIp;

  // Check rate limit
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      error: "Too many registration attempts. Try again later.",
    });
  }

  const { name, email, password } = req.body;

  // Input validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("User")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "A user with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const { data: user, error: createUserError } = await supabase
      .from("User")
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          updatedAt: new Date().toISOString(),
          verified: false,
          verifyToken,
        },
      ])
      .select()
      .single();

    if (createUserError) {
      console.error("Supabase createUserError:", createUserError, user);
      throw createUserError;
    }

    await sendVerificationEmail(email, verifyToken);

    res.status(201).json({
      message: "User created successfully",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error: unknown) {
    console.error("Registration error:", error);
    let errorMessage = "Something went wrong during registration";
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof (error as { message?: string }).message === "string"
    ) {
      errorMessage = (error as { message: string }).message;
    } else {
      errorMessage = JSON.stringify(error);
    }
    res.status(500).json({ error: errorMessage });
  }
}
