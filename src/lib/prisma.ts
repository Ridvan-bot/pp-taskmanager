import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAllTasks() {
  return await prisma.task.findMany();
}

export async function getTasksByCustomerName(customerName: string) {
  const customer = await prisma.customer.findFirst({
    where: {
      name: customerName,
    },
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  return await prisma.task.findMany({
    where: {
      customerId: customer.id,
    },
  });
}