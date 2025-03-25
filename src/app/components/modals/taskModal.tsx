import React from 'react';
import { Task } from '@prisma/client';
import styles from './taskModal.module.css';

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onRequestClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onRequestClose }) => {
  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onRequestClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onRequestClose}>X</button>
        <h2 className={styles.modalTitle}>{task.title}</h2>
        <div className={styles.modalBody}>
          <p><strong>Beskrivning:</strong> {task.content}</p>
          <p><strong>Prio:</strong> {task.priority}</p>
          <p><strong>Status:</strong> {task.status}</p>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;