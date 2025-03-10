import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { WorkSpaceProps } from '../../types';
import styles from './workSpace.module.css';
import { CustomSession } from '../../types';
import { Customer } from '@prisma/client';

const WorkSpace: React.FC<WorkSpaceProps> = () => {
  const { data: session, status } = useSession() as { data: CustomSession | null; status: string };
  const [customers, setCustomers] = useState<string[]>([]);

  useEffect(() => {
    console.log('Customers updated:', customers);
  }, [customers]);

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

  if (status !== 'authenticated') {
    return <p>Please log in to view tasks.</p>;
  }

  return (
    <div className={styles.workspaceContainer}>
      <div className={`${styles.workspaceDiv} ${styles.borderRed}`}>
        <button onClick={fetchUserCustomers} className="pohlman-button">Fetch Customers</button>
        <div>Div 1</div>
      </div>
      <div className={`${styles.workspaceDiv} ${styles.borderGreen}`}>Div 2</div>
      <div className={`${styles.workspaceDiv} ${styles.borderBlue}`}>Div 3</div>
    </div>
  );
};

export default WorkSpace;