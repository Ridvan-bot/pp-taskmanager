
import { Session } from 'next-auth';
import { Project } from '@prisma/client';


export type Task = {
    id: number;
    title: string;
    content: string;
    status: string;
    priority: number;
    createdAt: string;
    updatedAt: string;
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
    onCreateTask: (title: string, content: string, priority: string, status: string, customerId: number, projectId: number) => void;
    customers: Customer[];
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
    customersName?: string[];
  }

  export type TaskCardProps = {
    task: Task;
    onClick?: () => void;
  }