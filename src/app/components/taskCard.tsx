import React, { useState } from 'react';
import { Task } from '@prisma/client';
import styles from './taskCard.module.css';
import TaskModal from './modals/taskModal';


interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask?: (deletedTaskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdateTask, onDeleteTask }) => {
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
      </div>
      <TaskModal 
        task={task} 
        isOpen={isModalOpen} 
        onRequestClose={handleCloseModal}
        onUpdateTask={onUpdateTask}
        onDeleteTask={(deletedTaskId: string) => {
          setIsModalOpen(false);
          if (onDeleteTask) {
            onDeleteTask(deletedTaskId);
          }
        }}
      /> 
    </>
  );
};

export default TaskCard;