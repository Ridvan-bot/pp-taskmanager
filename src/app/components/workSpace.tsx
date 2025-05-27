import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from './sidebar';
import TaskCard from './taskCard';
import LoginModal from './modals/loginModal';
import NewTaskModal from './modals/newTaskModal';
import { fetchTasksForCustomers } from '@/lib/getRequest';
import { Task } from '@prisma/client';
import { CustomSession, Customer } from '../../types';

const WorkSpace: React.FC = () => {
   const { data: session, status } = useSession() as { data: CustomSession | null; status: string };
  const [customersName, setCustomersName] = useState<string[]>([]);
  const [customerData, setCustomerData] = useState<Customer[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [, setSelectedTask] = useState<Task | null>(null);
  const [sortOrders, setSortOrders] = useState<{ [key: string]: 'asc' | 'desc' }>({
    NOT_STARTED: 'asc',
    WIP: 'asc',
    WAITING: 'asc',
    CLOSED: 'asc',
    OTHER: 'asc'
  });

  const prevIsTaskModalOpen = useRef(isTaskModalOpen);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setIsLoginModalOpen(true);
    } else {
      setIsLoginModalOpen(false);
    }
  }, [status]);

  useEffect(() => {
    if (customersName.length > 0) {
      const fetchData = async () => {
        const data = await fetchTasksForCustomers(customersName);
        setTasks(data);
      };
      fetchData();
    }
  }, [customersName]);

  useEffect(() => {
    if (session && session.user) {
      fetchUserCustomers();
    }
  }, [session]);

  useEffect(() => {
    prevIsTaskModalOpen.current = isTaskModalOpen;
  }, [isTaskModalOpen]);

  const fetchUserCustomers = async () => {
    if (!session || !session.user) {
      console.error('User ID is not available');
      return;
    }
    try {
      const response = await fetch(`/api/customer?userId=${session.user.id}`);
      const customerData = await response.json();
      const customerArray = customerData.customers.map((customer: Customer) => customer.name);
      setCustomersName(customerArray);
      setCustomerData(customerData.customers);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  if (status !== 'authenticated') {
    return (
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onRequestClose={() => setIsLoginModalOpen(false)} 
      />
    );
  }

  const categorizeTasks = (tasks: Task[]) => {
    const categories = {
      NOT_STARTED: [] as Task[],
      WIP: [] as Task[],
      WAITING: [] as Task[],
      CLOSED: [] as Task[],
      OTHER: [] as Task[]
    };

    tasks.forEach(task => {
      switch (task.status) {
        case 'NOT_STARTED':
          categories.NOT_STARTED.push(task);
          break;
        case 'WIP':
          categories.WIP.push(task);
          break;
        case 'WAITING':
          categories.WAITING.push(task);
          break;
        case 'CLOSED':
          categories.CLOSED.push(task);
          break;
        default:
          categories.OTHER.push(task);
          break;
      }
    });

    return categories;
  };

  const sortTasksByPriority = (tasks: Task[], sortOrder: 'asc' | 'desc') => {
    return tasks.sort((a, b) => 
      sortOrder === 'asc' 
        ? a.priority.localeCompare(b.priority) 
        : b.priority.localeCompare(a.priority)
    );
  };

  const handleSortClick = (category: string) => {
    setSortOrders(prev => ({
      ...prev,
      [category]: prev[category] === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleNewTaskClick = (category: string) => {
    console.log("Creating new task in column:", category);
    setIsNewTaskModalOpen(true);
    setSelectedCategory(category);
  };

  const handleCreateTask = async (title: string, content: string, priority: string, status: string, customerId: number, projectId: number) => {
    try {
      const response = await fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, priority, status, customerId, projectId })
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();
      setTasks(prev => [...prev, newTask]);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const categorizedTasks = categorizeTasks(tasks);

  const handleNewProjectClick = () => {
    console.log('New project button clicked');
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev =>
      prev.map(task => task.id === updatedTask.id ? updatedTask : task)
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Optionally, include Sidebar if needed */}
      <Sidebar 
        onLogout={() => window.location.href = '/api/logout'}
        isOpen={false}
        onToggle={() => {}}
      />

      <main className="flex-1 flex flex-col">
        {/* Header (similar to Dashboard header) */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-white">Workspace</h2>
            <p className="text-sm text-slate-400">Manage your tasks</p>
          </div>
          <div className="flex items-center space-x-4">
            <select className="bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 text-xs">
              {customersName.map((customer, index) => (
                <option key={index} value={customer}>{customer}</option>
              ))}
            </select>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-2 text-xs"
              onClick={handleNewProjectClick}
            >
              New Project
            </button>
          </div>
        </header>

        {/* Content */}
        <section className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Task Table Headers */}
          <div className="grid grid-cols-5 gap-4">
            {['NOT_STARTED', 'WIP', 'WAITING', 'CLOSED', 'OTHER'].map(category => (
              <div key={category} className="flex items-center justify-between font-bold text-white/60 border border-white/60 rounded-md px-2 hover:text-white">
                <span>{category}</span>
                <button 
                  className="text-white text-sm"
                  onClick={() => handleSortClick(category)}
                >
                  ▼
                </button>
              </div>
            ))}
          </div>

          {/* Task Lists */}
          <div className="grid grid-cols-5 gap-4">
            {(['NOT_STARTED', 'WIP', 'WAITING', 'CLOSED', 'OTHER'] as const).map(category => (
              <div key={category} className="flex flex-col gap-4">
                {sortTasksByPriority(categorizedTasks[category], sortOrders[category]).map((task, index) => (
                  <TaskCard
                    key={index}
                    task={task}
                    onClick={() => handleTaskClick(task)}
                    onUpdateTask={handleUpdateTask}
                  />
                ))}
                <button
                  className="w-full h-20 border-2 border-dashed border-slate-600 rounded-md bg-transparent text-white/75 text-3xl flex items-center justify-center hover:shadow-lg"
                  onClick={() => handleNewTaskClick(category)}
                  aria-label={`Create new task in ${category}`}
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </section>

        <NewTaskModal
          isOpen={isNewTaskModalOpen}
          onRequestClose={() => setIsNewTaskModalOpen(false)}
          onCreateTask={handleCreateTask}
          customers={customerData}
          selectedCategory={selectedCategory}
        />
      </main>
    </div>
  );
};

export default WorkSpace;