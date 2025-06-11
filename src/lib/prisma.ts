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
          tasks: {
            include: {
              customer: { select: { name: true } }, 
              project: { select: { title: true } } 
            }
          },
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
          tasks: {
            include: {
              customer: { select: { name: true } }, 
              project: { select: { title: true } } 
            }
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Plattar ut tasks, där varje task innehåller exempelvis task.customer.name och task.project.name
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
      customers: {
        include: {
          tasks: true,
          projects: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user.customers;
}

export async function updateTask(taskId: number, data: { title?: string; content?: string; priority?: Priority; status?: Status; customerId?: number; projectId?: number }) {
  return await prisma.task.update({
    where: { id: taskId },
    data: {
      title: data.title,
      content: data.content,
      priority: data.priority,
      status: data.status,
      customer: data.customerId ? { connect: { id: data.customerId } } : undefined,
      project: data.projectId ? { connect: { id: data.projectId } } : undefined,
    },
  });
}

export async function deleteTask(taskId: number) {
  return await prisma.task.delete({
    where: { id: taskId },
  });
}