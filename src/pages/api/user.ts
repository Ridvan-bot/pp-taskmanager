import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supaBase';

// Rate limiting storage (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 10 * 60 * 1000);

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get client IP
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  const ip = Array.isArray(clientIp) ? clientIp[0] : clientIp;

  // Check rate limit
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ 
      error: 'För många registreringsförsök. Försök igen om 15 minuter.' 
    });
  }

  const { name, email, password } = req.body;

  // Input validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Alla fält krävs' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Lösenordet måste vara minst 6 tecken' });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Ogiltig e-postadress' });
  }

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('User')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'En användare med denna e-post finns redan' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log('Creating user with:', { name, email, password: hashedPassword });
    const { data: user, error: createUserError } = await supabase
      .from('User')
      .insert([{ name, email, password: hashedPassword, updatedAt: new Date().toISOString() }])
      .select()
      .single();
    console.log('Supabase insert result:', user, createUserError);

    if (createUserError) {
      console.error('Supabase createUserError:', createUserError, user);
      throw createUserError;
    }

    res.status(201).json({ 
      message: 'Användare skapad framgångsrikt', 
      user: { id: user.id, name: user.name, email: user.email } 
    });
  } catch (error: unknown) {
    console.error('Registration error:', error);
    let errorMessage = 'Något gick fel vid registrering';
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
      errorMessage = (error as { message: string }).message;
    } else {
      errorMessage = JSON.stringify(error);
    }
    res.status(500).json({ error: errorMessage });
  }
}