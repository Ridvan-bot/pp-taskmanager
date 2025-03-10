import React from 'react';
import { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (taskId: number, newStatus: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdateStatus }) => {
  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateStatus(task.id, event.target.value);
  };

  return (
    <div className="task-card">
      <h3>{task.title}</h3>
      <p>{task.content}</p>
      <div>
        <label>Status: </label>
        <select value={task.status} onChange={handleStatusChange}>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
    </div>
  );
};

export default TaskCard;