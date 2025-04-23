import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import styles from './workSpace.module.css';
import { CustomSession, Customer } from '../../types';
import { Task } from '@prisma/client';
import TaskCard from './taskCard';
import LoginModal from './modals/loginModal';
import NewTaskModal from './modals/newTaskModal';
import { fetchTasksForCustomers } from '@/lib/getRequest';

const WorkSpace: React.FC = () => {
  const { data: session, status } = useSession() as { data: CustomSession | null; status: string };
  const [customersName, setCustomersName] = useState<string[]>([]);
  const [customerData, setCustomerData] = useState<Customer[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState<boolean>(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedTask, setSelectedTask] = useState<Task | null>(null); 
  const [sortOrders, setSortOrders] = useState<{ [key: string]: 'asc' | 'desc' }>({
    NOT_STARTED: 'asc',
    WIP: 'asc',
    WAITING: 'asc',
    CLOSED: 'asc',
    OTHER: 'asc',
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
    if (prevIsTaskModalOpen.current && !isTaskModalOpen) {
    }
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
      <LoginModal isOpen={isLoginModalOpen} onRequestClose={() => setIsLoginModalOpen(false)} />
    );
  }

  const categorizeTasks = (tasks: Task[]) => {
    const categories = {
      NOT_STARTED: [] as Task[],
      WIP: [] as Task[],
      WAITING: [] as Task[],
      CLOSED: [] as Task[],
      OTHER: [] as Task[],
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
    return tasks.sort((a, b) => {
      return sortOrder === 'asc'
        ? a.priority.localeCompare(b.priority)
        : b.priority.localeCompare(a.priority);
    });
  };

  const handleSortClick = (category: string) => {
    setSortOrders(prev => ({
      ...prev,
      [category]: prev[category] === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleNewTaskClick = () => {
    setIsNewTaskModalOpen(true);
  };

  const handleCreateTask = async (title: string, content: string, priority: string, status: string, customerId: number, projectId: number) => {
    try {
      const response = await fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, priority, status, customerId, projectId }),
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
    <div className={styles.workspaceContainer}>
      <div className={`${styles.workspaceDiv} ${styles.borderRed}`}>
        <p>Filtrerar på kund</p>
        <select className={styles.customSelect}>
          {customersName.map((customer, index) => (
            <option key={index} value={customer}>{customer}</option>
          ))}
        </select>
      </div>
      <div className={`${styles.workspaceDiv} ${styles.borderGreen}`}>
        <button className={styles.newTaskButton} onClick={handleNewTaskClick}>New Task</button>
        <button className={styles.newProjectButton} onClick={handleNewProjectClick}>New Project</button>
        {tasks.length > 0 ? tasks[0].title : 'No tasks available'}
      </div>
      <div className={`${styles.workspaceDiv} ${styles.borderBlue}`}>
        <div className={styles.taskTable}>
          {/* Rubriker med sorterings-knappar */}
          {['NOT_STARTED', 'WIP', 'WAITING', 'CLOSED', 'OTHER'].map(category => (
            <div key={category} className={styles.taskTableHeader}>
              {category}
              <button className={styles.sortButton} onClick={() => handleSortClick(category)}>▼</button>
            </div>
          ))}
          {/* Rendera varje kategori */}
          {(['NOT_STARTED', 'WIP', 'WAITING', 'CLOSED', 'OTHER'] as const).map(category => (
            <div key={category} className={styles.taskList}>
              {sortTasksByPriority(categorizedTasks[category], sortOrders[category]).map((task, index) => (
                <TaskCard
                  key={index}
                  task={task}
                  onClick={() => handleTaskClick(task)}
                  onUpdateTask={handleUpdateTask}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onRequestClose={() => setIsNewTaskModalOpen(false)}
        onCreateTask={handleCreateTask}
        customers={customerData}
      />
    </div>
  );
};

export default WorkSpace;