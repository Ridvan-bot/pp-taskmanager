import { Session } from 'next-auth';

// Define enums as string unions if you want type support
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'; // Adjust according to your Supabase enum
export type Status = 'NOT_STARTED' | 'WIP' | 'WAITING' | 'CLOSED' | 'TODO' | 'IN_PROGRESS' | 'DONE';

export type Project = {
  id: number;
  title: string;
  // Lägg till fler fält om du behöver
};

export type Task = {
  id: number;
  title: string;
  content: string;
  status: Status;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;
  customerId: number;
  projectId: number;
  parentId: number | null;
  parent?: Task | null;
  subtasks?: Task[];
};

export type LoginModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
};

export type RegisterModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
};

export interface CustomSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export type NewTaskModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onCreateTask: (title: string, content: string, priority: string, status: string, customerId: number, projectId: number, parentId: number | null) => void;
  customers: Customer[];
  selectedCategory: string;
  availableTasks?: Task[];  // Available tasks that can be parent tasks
  selectedCustomerObj?: Customer | null;
  selectedProjectObj?: Project | null;
}

export type Customer = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  projects: Project[];
  tasks: Task[];
};

export type TaskModalProps = {
  task: Task;
  isOpen: boolean;
  onRequestClose: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (deletedTaskId: string) => void;
}

export type TaskCardProps = {
  task: Task;
  onClick?: () => void;
}