import React, { useState } from 'react';
import { Task } from '@prisma/client';
import styles from './taskCard.module.css';
import TaskModal from './modals/taskModal';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const truncateContent = (content: string, length: number) => {
    if (content.length <= length) {
      return content;
    }
    return content.substring(0, length) + '...';
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className={styles.taskCard} onClick={handleCardClick}>
        <strong>Title:</strong> {task.title}
        <br />
        <strong>Beskrivning:</strong> {truncateContent(task.content, 30)}
        <br />
        <strong>Prio:</strong> {task.priority}
        <br />
        <strong>Status:</strong> {task.status}
      </div>
      <TaskModal 
      task={task} 
      isOpen={isModalOpen} 
      onRequestClose={handleCloseModal}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars 
      onUpdateTask={(updatedTask) => { /* handle task update */ }} /> 
    </>
  );
};

export default TaskCard;