import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, password, customerIds } = req.body;

  if (!Array.isArray(customerIds)) {
    return res.status(400).json({ error: 'customerIds must be an array' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        customers: {
          connect: customerIds.map((id: number) => ({ id })),
        },
      },
    });

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Failed to create user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}