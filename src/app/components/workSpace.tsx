import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from './workSpace.module.css';
import { CustomSession } from '../../types';
import { Customer, Task } from '@prisma/client';
import TaskCard from './taskCard';
import LoginModal from './loginModal';

const WorkSpace: React.FC = () => {
  const { data: session, status } = useSession() as { data: CustomSession | null; status: string };
  const [customers, setCustomers] = useState<string[]>([]);
  const [tasks, setTasks] = useState<{ [key: string]: Task[] }>({});
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setIsLoginModalOpen(true);
    } else {
      setIsLoginModalOpen(false);
    }
  }, [status]);

  useEffect(() => {
    console.log('Customers updated:', customers);
    if (customers.length > 0) {
      fetchTasksForCustomers(customers);
    }
  }, [customers]);

  useEffect(() => {
    if (Object.keys(tasks).length > 0) {
      console.log('Tasks:', tasks);
    }
  }, [tasks]);

  useEffect(() => {
    if (session && session.user) {
      fetchUserCustomers();
    }
  }, [session]);

  const fetchUserCustomers = async () => {
    if (!session || !session.user) {
      console.error('User ID is not available');
      return;
    }
    console.log(session.user);

    try {
      const response = await fetch(`/api/customer?userId=${session.user.id}`);
      const data = await response.json();
      const customerArray = data.customers.map((customer: Customer) => customer.name);
      setCustomers(customerArray);

    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const fetchTasksForCustomers = async (customers: string[]) => {
    for (const customer of customers) {
      try {
        const response = await fetch(`/api/tasks?customerName=${customer}`);
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error(`Failed to fetch tasks for customer ${customer}:`, error);
      }
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

  const allTasks = Object.values(tasks).flat();
  const categorizedTasks = categorizeTasks(allTasks);

  return (
    <div className={styles.workspaceContainer}>
      <div className={`${styles.workspaceDiv} ${styles.borderRed}`}>
        {/* Display customer information */}
        <ul>
          {customers.map((customer, index) => (
            <li key={index}>{customer}</li>
          ))}
        </ul>
      </div>
      <div className={`${styles.workspaceDiv} ${styles.borderGreen}`}>
        {/* Display the title of the first task */}
        {Object.keys(tasks).length > 0 ? tasks[customers[0]]?.[0]?.title : 'No tasks available'}
      </div>
      <div className={`${styles.workspaceDiv} ${styles.borderBlue}`}>
        {/* Display all tasks in a table */}
        <div className={styles.taskTable}>
          <div className={styles.taskTableHeader}>Not Started</div>
          <div className={styles.taskTableHeader}>WIP</div>
          <div className={styles.taskTableHeader}>Waiting</div>
          <div className={styles.taskTableHeader}>Closed</div>
          <div className={styles.taskTableHeader}>Other</div>
          <div className={styles.taskList}>
            {categorizedTasks.NOT_STARTED.map((task, index) => (
              <TaskCard key={index} task={task} />
            ))}
          </div>
          <div className={styles.taskList}>
            {categorizedTasks.WIP.map((task, index) => (
              <TaskCard key={index} task={task} />
            ))}
          </div>
          <div className={styles.taskList}>
            {categorizedTasks.WAITING.map((task, index) => (
              <TaskCard key={index} task={task} />
            ))}
          </div>
          <div className={styles.taskList}>
            {categorizedTasks.CLOSED.map((task, index) => (
              <TaskCard key={index} task={task} />
            ))}
          </div>
          <div className={styles.taskList}>
            {categorizedTasks.OTHER.map((task, index) => (
              <TaskCard key={index} task={task} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkSpace;