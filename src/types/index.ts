import { Session } from 'next-auth';
import { Project, Priority, Status } from '@prisma/client';


export type Task = {
    id: number;
    title: string;
    content: string;
    status: Status;
    priority: Priority;
    createdAt: Date;
    updatedAt: Date;
    customerId: number;
    projectId: number;
    parentId: number | null;  // Changed from optional to required null
    parent?: Task | null;      // Parent task
    subtasks?: Task[];         // Array of subtasks
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