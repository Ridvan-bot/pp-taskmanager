import React from 'react';
import { Task } from '@prisma/client';
import styles from './taskCard.module.css';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const truncateContent = (content: string, length: number) => {
    if (content.length <= length) {
      return content;
    }
    return content.substring(0, length) + '...';
  };

  return (
    <div className={styles.taskCard}>
      <strong>Title:</strong> {task.title}
      <br />
      <strong>Beskrivning:</strong> {truncateContent(task.content, 30)}
      <br />
      <strong>Prio:</strong> {task.priority}
      <br />
    </div>
  );
};

export default TaskCard;