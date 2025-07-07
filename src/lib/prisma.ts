import { PrismaClient, Priority, Status} from '@prisma/client';

const prisma = new PrismaClient();

export { prisma };

export async function getAllTasks() {
  return await prisma.task.findMany({
    include: {
      parent: true,
      subtasks: true,
      customer: { select: { name: true } },
      project: { select: { title: true } }
    }
  });
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
    include: {
      parent: true,
      subtasks: true,
      customer: { select: { name: true } },
      project: { select: { title: true } }
    }
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
              parent: true,
              subtasks: true,
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

export async function createTask(data: { title: string; content: string; priority: Priority; status: Status; customerId: number; projectId: number; parentId: number | null }) {
  return await prisma.task.create({
    data: {
      title: data.title,
      content: data.content,
      priority: data.priority,
      status: data.status,
      customer: { connect: { id: data.customerId } },
      project: { connect: { id: data.projectId } },
      parent: data.parentId ? { connect: { id: data.parentId } } : undefined,
    },
    include: {
      parent: true,
      subtasks: true,
      customer: { select: { name: true } },
      project: { select: { title: true } }
    }
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

export async function updateTask(taskId: number, data: { title?: string; content?: string; priority?: Priority; status?: Status; customerId?: number; projectId?: number; parentId?: number | null }) {
  return await prisma.task.update({
    where: { id: taskId },
    data: {
      title: data.title,
      content: data.content,
      priority: data.priority,
      status: data.status,
      customer: data.customerId ? { connect: { id: data.customerId } } : undefined,
      project: data.projectId ? { connect: { id: data.projectId } } : undefined,
      parent: data.parentId !== undefined ? (data.parentId ? { connect: { id: data.parentId } } : { disconnect: true }) : undefined,
    },
    include: {
      parent: true,
      subtasks: true,
      customer: { select: { name: true } },
      project: { select: { title: true } }
    }
  });
}

export async function deleteTask(taskId: number) {
  return await prisma.task.delete({
    where: { id: taskId },
  });
}

export async function getTasksByCustomerAndProject(customerName: string, projectTitle?: string) {
  const customer = await prisma.customer.findFirst({
    where: {
      name: customerName,
    },
    include: {
      projects: true,
    },
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  // If no project is specified, return all tasks for the customer
  if (!projectTitle) {
    return await prisma.task.findMany({
      where: {
        customerId: customer.id,
      },
      include: {
        parent: true,
        subtasks: true,
        customer: { select: { name: true } },
        project: { select: { title: true } }
      }
    });
  }

  // Find the specific project within the customer
  const project = customer.projects.find(p => p.title === projectTitle);
  
  if (!project) {
    throw new Error('Project not found for this customer');
  }

  // Return tasks that belong to both the customer and the specific project
  return await prisma.task.findMany({
    where: {
      customerId: customer.id,
      projectId: project.id,
    },
    include: {
      parent: true,
      subtasks: true,
      customer: { select: { name: true } },
      project: { select: { title: true } }
    }
  });
}