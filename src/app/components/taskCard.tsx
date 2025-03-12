import React from 'react';
import { Task } from '@prisma/client';
import styles from './taskCard.module.css';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  return (
    <div className={styles.taskCard}>
      <strong>Title:</strong> {task.title}
      <br />
      <strong>Beskrivning:</strong> {task.content}
      <br />
      <strong>Prio:</strong> {task.priority}
      <br />
      <strong>Status:</strong> {task.status}
    </div>
  );
};

export default TaskCard;