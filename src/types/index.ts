
import { Session } from 'next-auth';


export type Customer = {
    id: number;
    name: string;
    email: string;
    image: string;
    tasks: Task[];
  };

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