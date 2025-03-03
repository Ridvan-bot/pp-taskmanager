import React, { useState } from 'react';
import { WorkSpaceProps, Task } from '../../types';

const WorkSpace: React.FC<WorkSpaceProps> = ({ selectedCustomer }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const fetchCustomerTasks = async () => {
    try {
      console.log(selectedCustomer);
      const response = await fetch(`/api/tasks/`);	
      const data = await response.json();
      setTasks(data);
      console.log(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  return (
    <div>
      <h1>Selected Customer</h1>
      <p>{selectedCustomer}</p>
      <button className="p-3 px-6 rounded-lg pohlman-button" onClick={fetchTasks}>
        Fetch all tasks
      </button>
      <div>
        {tasks.length > 0 ? (
          <ul>
            {tasks.map((task) => (
              <li key={task.id}>{task.title}</li>
            ))}
          </ul>
        ) : (
          <p>No tasks found</p>
        )}
      </div>
      <button className="p-3 px-6 rounded-lg pohlman-button" onClick={fetchCustomerTasks}>
        Fetch Customer Tasks
      </button>
      <div>
        {tasks.length > 0 ? (
          <ul>
            {tasks.map((task) => (
              <li key={task.id}>{task.title}</li>
            ))}
          </ul>
        ) : (
          <p>No tasks found</p>
        )}
      </div>
    </div>
  );
};

export default WorkSpace;