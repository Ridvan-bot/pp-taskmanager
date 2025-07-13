import { supabase } from '@/lib/supaBase';
import { Task, Customer, Priority, Status } from '@/types';

// Typdefinitioner
export type TaskInput = {
  title: string;
  content: string;
  priority: Priority;
  status: Status;
  customerId: number;
  projectId: number;
  parentId: number | null;
};

// Hjälptyper för join-tabellen

type CustomerUserWithCustomer = { customer: Customer };
type CustomerUserWithUser = { user: { id: number; name: string; email: string; password: string; createdAt: string; updatedAt: string } };

// Hämta alla tasks med relationer
export async function getAllTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('Task')
    .select(`*, parent:parentId(*), subtasks:Task(*), customer:customerId(name), project:projectId(title)`);
  if (error) throw error;
  return data as Task[];
}

// Hämta tasks för en viss kund
export async function getTasksByCustomerName(customerName: string): Promise<Task[]> {
  const { data: customer, error: customerError } = await supabase
    .from('Customer')
    .select('id')
    .eq('name', customerName)
    .single();
  if (customerError || !customer) throw new Error('Customer not found');

  const { data, error } = await supabase
    .from('Task')
    .select(`*, parent:parentId(*), subtasks:Task(*), customer:customerId(name), project:projectId(title)`)
    .eq('customerId', customer.id);
  if (error) throw error;
  return data as Task[];
}

// Hämta tasks för en användare, platt lista
export async function getTasksByUserId(userId: string): Promise<Task[]> {
  const { data: customers, error: customerError } = await supabase
    .from('Customer')
    .select('id')
    .eq('userId', userId);
  if (customerError || !customers) throw new Error('User not found');
  const customerIds = customers.map((c: { id: number }) => c.id);
  if (customerIds.length === 0) return [];
  const { data: tasks, error: taskError } = await supabase
    .from('Task')
    .select(`*, customer:customerId(name), project:projectId(title)`)
    .in('customerId', customerIds);
  if (taskError) throw taskError;
  return tasks as Task[];
}

// Skapa en task
export async function createTask(data: TaskInput): Promise<Task> {
  const { data: task, error } = await supabase
    .from('Task')
    .insert([{
      title: data.title,
      content: data.content,
      priority: data.priority,
      status: data.status,
      customerId: data.customerId,
      projectId: data.projectId,
      parentId: data.parentId
    }])
    .select()
    .single();
  if (error) throw error;
  return task as Task;
}

// Hämta alla customers för en användare via join-tabellen
export async function getAllUsersCustomers(userId: number): Promise<Customer[]> {
  const { data: customerUsers, error } = await supabase
    .from('CustomerUser')
    .select('customer:customerId(*, Task(*), Project(*))')
    .eq('userId', userId);
  if (error) throw error;
  const customers = (customerUsers as unknown as CustomerUserWithCustomer[])?.map(cu => cu.customer) ?? [];
  return customers as Customer[];
}

// Uppdatera en task
export async function updateTask(taskId: number, data: Partial<TaskInput>): Promise<Task> {
  const { data: task, error } = await supabase
    .from('Task')
    .update(data)
    .eq('id', taskId)
    .select()
    .single();
  if (error) throw error;
  return task as Task;
}

// Ta bort en task
export async function deleteTask(taskId: number): Promise<boolean> {
  const { error } = await supabase
    .from('Task')
    .delete()
    .eq('id', taskId);
  if (error) throw error;
  return true;
}

// Hämta tasks för kund och projekt
export async function getTasksByCustomerAndProject(customerName: string, projectTitle?: string): Promise<Task[]> {
  const { data: customer, error: customerError } = await supabase
    .from('Customer')
    .select('id')
    .eq('name', customerName)
    .single();
  if (customerError || !customer) throw new Error('Customer not found');

  let projectId: number | undefined;
  if (projectTitle) {
    const { data: project, error: projectError } = await supabase
      .from('Project')
      .select('id')
      .eq('title', projectTitle)
      .eq('customerId', customer.id)
      .single();
    if (projectError || !project) throw new Error('Project not found for this customer');
    projectId = project.id;
  }

  let query = supabase
    .from('Task')
    .select(`*, parent:parentId(*), subtasks:Task(*), customer:customerId(name), project:projectId(title)`)
    .eq('customerId', customer.id);
  if (projectId) query = query.eq('projectId', projectId);
  const { data, error } = await query;
  if (error) throw error;
  return data as Task[];
}

// Lägg till en relation mellan user och customer
export async function addUserToCustomer(userId: number, customerId: number) {
  const { error } = await supabase
    .from('CustomerUser')
    .insert([{ userId, customerId }]);
  if (error) throw error;
  return true;
}

// (Valfritt) Hämta alla users för en customer
export async function getUsersForCustomer(customerId: number) {
  const { data: customerUsers, error } = await supabase
    .from('CustomerUser')
    .select('user:userId(*)')
    .eq('customerId', customerId);
  if (error) throw error;
  return (customerUsers as unknown as CustomerUserWithUser[])?.map(cu => cu.user) ?? [];
}

// Hämta alla tasks för en användare (via customers via join-tabellen)
export async function getAllUsersTasks(userId: number): Promise<Task[]> {
  const { data: customerUsers, error: cuError } = await supabase
    .from('CustomerUser')
    .select('customerId')
    .eq('userId', userId);
  if (cuError || !customerUsers) throw new Error('User not found');
  const customerIds = (customerUsers as { customerId: number }[]).map(cu => cu.customerId);
  if (customerIds.length === 0) return [];
  const { data: tasks, error: taskError } = await supabase
    .from('Task')
    .select(`*, parent:parentId(*), subtasks:Task(*), customer:customerId(name), project:projectId(title)`)
    .in('customerId', customerIds);
  if (taskError) throw taskError;
  return tasks as Task[];
} 