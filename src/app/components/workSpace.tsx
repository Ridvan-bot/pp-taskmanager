import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from './workSpace.module.css';
import { CustomSession, Customer } from '../../types';
import { Task } from '@prisma/client';
import TaskCard from './taskCard';
import LoginModal from './modals/loginModal';
import NewTaskModal from './modals/newTaskModal';
import TaskModal from './modals/taskModal';

const WorkSpace: React.FC = () => {
  const { data: session, status } = useSession() as { data: CustomSession | null; status: string };
  const [customersName, setCustomersName] = useState<string[]>([]);
  const [customerData, setCustomerData] = useState<Customer[]>([]);
  const [tasks, setTasks] = useState<{ [key: string]: Task[] }>({});
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState<boolean>(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sortOrders, setSortOrders] = useState<{ [key: string]: 'asc' | 'desc' }>({
    NOT_STARTED: 'asc',
    WIP: 'asc',
    WAITING: 'asc',
    CLOSED: 'asc',
    OTHER: 'asc',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      setIsLoginModalOpen(true);
    } else {
      setIsLoginModalOpen(false);
    }
  }, [status]);

  useEffect(() => {
    if (customersName.length > 0) {
      fetchTasksForCustomers(customersName);
    }
  }, [customersName]);

  useEffect(() => {
    if (customerData.length > 0) {
    }
  }, [customerData]);

  useEffect(() => {
    if (Object.keys(tasks).length > 0) {
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
    console.log('user Session: ', session.user);

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

  const fetchTasksForCustomers = async (customers: string[]) => {
    for (const customer of customers) {
      try {
        const response = await fetch(`/api/task?customerName=${customer}`);
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

  const sortTasksByPriority = (tasks: Task[], sortOrder: 'asc' | 'desc') => {
    return tasks.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.priority.localeCompare(b.priority);
      } else {
        return b.priority.localeCompare(a.priority);
      }
    });
  };

  const handleSortClick = (category: string) => {
    setSortOrders(prevSortOrders => ({
      ...prevSortOrders,
      [category]: prevSortOrders[category] === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleNewTaskClick = () => {
    setIsNewTaskModalOpen(true);
  };

  const handleCreateTask = async (title: string, content: string, priority: string, status: string, customerId: number, projectId: number) => {
    try {
      const response = await fetch('/api/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, priority, status, customerId, projectId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();
      setTasks(prevTasks => ({
        ...prevTasks,
        [status]: [...(prevTasks[status] || []), newTask],
      }));
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      console.log('kommer vi ens hit?')
      const response = await fetch(`/api/task/${updatedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTasks = tasks[updatedTask.status].map(task =>
        task.id === updatedTask.id ? updatedTask : task
      );

      setTasks(prevTasks => ({
        ...prevTasks,
        [updatedTask.status]: updatedTasks,
      }));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const allTasks = Object.values(tasks).flat();
  const categorizedTasks = categorizeTasks(allTasks);

  const handleNewProjectClick = () => {
    // Logic to handle new project creation
    console.log('New project button clicked');
    // You can open a modal or navigate to a new page for project creation
    // For example, you can set a state to open a new project modal
    // setIsNewProjectModalOpen(true);
  };

  return (
    <div className={styles.workspaceContainer}>
      <div className={`${styles.workspaceDiv} ${styles.borderRed}`}>
        {/* Display customer information */}
        <p>Filtrerar på kund</p>
        <select className={styles.customSelect}>
          {customersName.map((customer, index) => (
            <option key={index} value={customer}>{customer}</option>
          ))}
        </select>
      </div>
      <div className={`${styles.workspaceDiv} ${styles.borderGreen}`}>
        {/* Display the title of the first task */}
        <button className={styles.newTaskButton} onClick={handleNewTaskClick}>New Task</button>
        <button className={styles.newProjectButton} onClick={handleNewProjectClick}>New Project</button>
        {Object.keys(tasks).length > 0 ? tasks[customersName[0]]?.[0]?.title : 'No tasks available'}
      </div>
      <div className={`${styles.workspaceDiv} ${styles.borderBlue}`}>
        {/* Display all tasks in a table */}
        <div className={styles.taskTable}>
          <div className={styles.taskTableHeader}>
            Not Started
            <button className={styles.sortButton} onClick={() => handleSortClick('NOT_STARTED')}>▼</button>
          </div>
          <div className={styles.taskTableHeader}>
            WIP
            <button className={styles.sortButton} onClick={() => handleSortClick('WIP')}>▼</button>
          </div>
          <div className={styles.taskTableHeader}>
            Waiting
            <button className={styles.sortButton} onClick={() => handleSortClick('WAITING')}>▼</button>
          </div>
          <div className={styles.taskTableHeader}>
            Closed
            <button className={styles.sortButton} onClick={() => handleSortClick('CLOSED')}>▼</button>
          </div>
          <div className={styles.taskTableHeader}>
            Other
            <button className={styles.sortButton} onClick={() => handleSortClick('OTHER')}>▼</button>
          </div>
          <div className={styles.taskList}>
            {sortTasksByPriority(categorizedTasks.NOT_STARTED, sortOrders.NOT_STARTED).map((task, index) => (
              <TaskCard key={index} task={task} onClick={() => handleTaskClick(task)} />
            ))}
          </div>
          <div className={styles.taskList}>
            {sortTasksByPriority(categorizedTasks.WIP, sortOrders.WIP).map((task, index) => (
              <TaskCard key={index} task={task} onClick={() => handleTaskClick(task)} />
            ))}
          </div>
          <div className={styles.taskList}>
            {sortTasksByPriority(categorizedTasks.WAITING, sortOrders.WAITING).map((task, index) => (
              <TaskCard key={index} task={task} onClick={() => handleTaskClick(task)} />
            ))}
          </div>
          <div className={styles.taskList}>
            {sortTasksByPriority(categorizedTasks.CLOSED, sortOrders.CLOSED).map((task, index) => (
              <TaskCard key={index} task={task} onClick={() => handleTaskClick(task)} />
            ))}
          </div>
          <div className={styles.taskList}>
            {sortTasksByPriority(categorizedTasks.OTHER, sortOrders.OTHER).map((task, index) => (
              <TaskCard key={index} task={task} onClick={() => handleTaskClick(task)} />
            ))}
          </div>
        </div>
      </div>
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onRequestClose={() => setIsNewTaskModalOpen(false)}
        onCreateTask={handleCreateTask}
        customers={customerData}
      />
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={isTaskModalOpen}
          onRequestClose={() => setIsTaskModalOpen(false)}
          onUpdateTask={handleUpdateTask}
        />
      )}
    </div>
  );
};

export default WorkSpace;