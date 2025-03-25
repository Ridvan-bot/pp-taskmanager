import { PrismaClient, Priority, Status} from '@prisma/client';

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

export async function getAllUsersTasks(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: { 
      customers: {
        include: {
          tasks: true,
        },
      },
    },
  });
}

export async function getTasksByUserId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      customers: {
        include: {
          tasks: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user.customers.flatMap(customer => customer.tasks);
}


export async function createTask(data: { title: string; content: string; priority: Priority; status: Status; customerId: number; projectId: number }) {
  return await prisma.task.create({
    data: {
      title: data.title,
      content: data.content,
      priority: data.priority,
      status: data.status,
      customer: { connect: { id: data.customerId } },
      project: { connect: { id: data.projectId } },
    },
  });
}

export async function getAllUsersCustomers(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      customers: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user.customers;
}