import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';;
import styles from './workSpace.module.css';
import { CustomSession } from '../../types';
import { Customer, Task } from '@prisma/client';
import { TaskCard } from './taskCard';

const WorkSpace: React.FC = () => {
  const { data: session, status } = useSession() as { data: CustomSession | null; status: string };
  const [customers, setCustomers] = useState<string[]>([]);
  const [tasks, setTasks] = useState<{ [key: string]: Task[] }>({});

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
    return <p>Please log in to view tasks.</p>;
  }


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
        {/* Display all tasks */}
        {Object.keys(tasks).length > 0 ? (
          <div className={styles.taskList}>
            {Object.values(tasks).flat().map((task, index) => (
              <TaskCard key={index} task={task} />
            ))}
          </div>
        ) : (
          'No tasks available'
        )}
      </div>
    </div>
  );
};

export default WorkSpace;