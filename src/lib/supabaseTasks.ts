import { supabase } from "../lib/supaBase";
import { Task, Customer, Priority, Status } from "@/types";

// Type definitions
export type TaskInput = {
  title: string;
  content: string;
  priority: Priority;
  status: Status;
  customerId: number;
  projectId: number;
  parentId: number | null;
};

// Helper types for the join table

type CustomerUserWithCustomer = { customer: Customer };
type CustomerUserWithUser = {
  user: {
    id: number;
    name: string;
    email: string;
    password: string;
    createdAt: string;
    updatedAt: string;
  };
};

// Fetch all tasks with relations
export async function getAllTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("Task")
    .select(
      `*, parent:parentId(*), subtasks:Task(*), customer:customerId(name), project:projectId(title)`,
    );
  if (error) throw error;
  return data as Task[];
}

// Fetch tasks for a specific customer
export async function getTasksByCustomerName(
  customerName: string,
): Promise<Task[]> {
  const { data: customer, error: customerError } = await supabase
    .from("Customer")
    .select("id")
    .eq("name", customerName)
    .single();
  if (customerError || !customer) throw new Error("Customer not found");

  const { data, error } = await supabase
    .from("Task")
    .select(
      `*, parent:parentId(*), subtasks:Task(*), customer:customerId(name), project:projectId(title)`,
    )
    .eq("customerId", customer.id);
  if (error) throw error;
  return data as Task[];
}

// Fetch tasks for a user, flat list
export async function getTasksByUserId(userId: string): Promise<Task[]> {
  const { data: customers, error: customerError } = await supabase
    .from("Customer")
    .select("id")
    .eq("userId", userId);
  if (customerError || !customers) throw new Error("User not found");
  const customerIds = customers.map((c: { id: number }) => c.id);
  if (customerIds.length === 0) return [];
  const { data: tasks, error: taskError } = await supabase
    .from("Task")
    .select(`*, customer:customerId(name), project:projectId(title)`)
    .in("customerId", customerIds);
  if (taskError) throw taskError;
  return tasks as Task[];
}

// Create a task
export async function createTask(data: TaskInput): Promise<Task> {
  const now = new Date().toISOString();
  const closedAt = data.status === "CLOSED" ? now : null;
  const { data: task, error } = await supabase
    .from("Task")
    .insert([
      {
        title: data.title,
        content: data.content,
        priority: data.priority,
        status: data.status,
        customerId: data.customerId,
        projectId: data.projectId,
        parentId: data.parentId,
        updatedAt: now,
        createdAt: now,
        closedAt: closedAt,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return task as Task;
}

// Fetch all customers for a user via the join table
export async function getAllUsersCustomers(
  userId: number,
): Promise<Customer[]> {
  const { data: customerUsers, error } = await supabase
    .from("CustomerUser")
    .select("customer:customerId(*, projects:Project(*), Task(*))")
    .eq("userId", userId);
  if (error) throw error;
  const customers =
    (customerUsers as unknown as CustomerUserWithCustomer[])?.map(
      (cu) => cu.customer,
    ) ?? [];
  return customers as Customer[];
}

// Update a task
export async function updateTask(
  taskId: number,
  data: Partial<TaskInput> & { status?: Status },
): Promise<Task> {
  // Hämta nuvarande task för att jämföra status
  const { data: currentTask, error: fetchError } = await supabase
    .from("Task")
    .select("status, closedAt")
    .eq("id", taskId)
    .single();
  if (fetchError) throw fetchError;

  let closedAt = currentTask.closedAt || null;
  if (data.status === "CLOSED" && currentTask.status !== "CLOSED") {
    closedAt = new Date().toISOString();
  } else if (
    data.status &&
    data.status !== "CLOSED" &&
    currentTask.status === "CLOSED"
  ) {
    closedAt = null;
  }

  const { data: task, error } = await supabase
    .from("Task")
    .update({ ...data, updatedAt: new Date().toISOString(), closedAt })
    .eq("id", taskId)
    .select()
    .single();
  if (error) throw error;
  return task as Task;
}

// Delete a task
export async function deleteTask(taskId: number): Promise<boolean> {
  const { error } = await supabase.from("Task").delete().eq("id", taskId);
  if (error) throw error;
  return true;
}

// Fetch tasks for customer and project
export async function getTasksByCustomerAndProject(
  customerName: string,
  projectTitle?: string,
): Promise<Task[]> {
  const { data: customer, error: customerError } = await supabase
    .from("Customer")
    .select("id")
    .eq("name", customerName)
    .single();
  if (customerError || !customer) throw new Error("Customer not found");

  let projectId: number | undefined;
  if (projectTitle) {
    const { data: project, error: projectError } = await supabase
      .from("Project")
      .select("id")
      .eq("title", projectTitle)
      .eq("customerId", customer.id)
      .single();
    if (projectError || !project) {
      // Gracefully handle unknown project for this customer by returning no tasks
      return [] as Task[];
    }
    projectId = project.id;
  }

  let query = supabase
    .from("Task")
    .select(
      `*, parent:parentId(*), subtasks:Task(*), customer:customerId(name), project:projectId(title)`,
    )
    .eq("customerId", customer.id);
  if (projectId) query = query.eq("projectId", projectId);
  const { data, error } = await query;
  if (error) throw error;
  return data as Task[];
}

// Add a relation between user and customer
export async function addUserToCustomer(userId: number, customerId: number) {
  const { error } = await supabase
    .from("CustomerUser")
    .insert([{ userId, customerId }]);
  if (error) throw error;
  return true;
}

// (Optional) Fetch all users for a customer
export async function getUsersForCustomer(customerId: number) {
  const { data: customerUsers, error } = await supabase
    .from("CustomerUser")
    .select("user:userId(*)")
    .eq("customerId", customerId);
  if (error) throw error;
  return (
    (customerUsers as unknown as CustomerUserWithUser[])?.map(
      (cu) => cu.user,
    ) ?? []
  );
}

// Fetch all tasks for a user (via customers via the join table)
export async function getAllUsersTasks(userId: number): Promise<Task[]> {
  const { data: customerUsers, error: cuError } = await supabase
    .from("CustomerUser")
    .select("customerId")
    .eq("userId", userId);
  if (cuError || !customerUsers) throw new Error("User not found");
  const customerIds = (customerUsers as { customerId: number }[]).map(
    (cu) => cu.customerId,
  );
  if (customerIds.length === 0) return [];
  const { data: tasks, error: taskError } = await supabase
    .from("Task")
    .select(
      `*, parent:parentId(*), subtasks:Task(*), customer:customerId(name), project:projectId(title)`,
    )
    .in("customerId", customerIds);
  if (taskError) throw taskError;
  return tasks as Task[];
}
