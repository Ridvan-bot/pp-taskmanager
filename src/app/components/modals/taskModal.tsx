import React, { useState, useEffect } from 'react';
import { Priority, Status } from '@/types';
import { Task } from '@/types';
import styles from './taskModal.module.css';

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onRequestClose: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (deletedTaskId: string) => void
}

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onRequestClose, onUpdateTask, onDeleteTask }) => {
  const [title, setTitle] = useState(task.title);
  const [content, setContent] = useState(task.content);
  const [priority, setPriority] = useState(task.priority);
  const [status, setStatus] = useState(task.status);


  useEffect(() => {
    if (!isOpen) {
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onRequestClose();
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriority(e.target.value as Priority);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value as Status);
  };

  const handleUpdateClick = async () => {
    const updatedTask = {
      ...task,
      title,
      content,
      priority,
      status,
      customerId: task.customerId,
      projectId: task.projectId,
      parentId: task.parentId,
    };

    try {
      const response = await fetch(`/api/task`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const result = await response.json();
      onUpdateTask(result);
      onRequestClose();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

const handleDeleteClick = async () => {
  const confirmed = window.confirm('Are you sure you want to delete this task?');
  if (!confirmed) return;

  try {
    const response = await fetch(`/api/task/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: task.id }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete task');
    }
    onDeleteTask(String(task.id));
    onRequestClose();
  } catch (error) {
    console.error('Failed to delete task:', error);
  }
};

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onRequestClose}>X</button>
        <h2 className={styles.modalTitle}>Edit Task</h2>
        <div className={styles.modalBody}>
          <label htmlFor="title"><strong>Title:</strong></label>
          <textarea
            id="title"
            value={title}
            onChange={handleTitleChange}
            className={styles.modalTitleTextarea}
          />
          <label htmlFor="content"><strong>Beskrivning:</strong></label>
          <textarea
            id="content"
            value={content}
            onChange={handleContentChange}
            className={styles.modalTextarea}
          />
          <label htmlFor="priority"><strong>Prio:</strong></label>
          <select
            id="priority"
            value={priority}
            onChange={handlePriorityChange}
            className={styles.modalSelect}
          >
            {["LOW", "MEDIUM", "HIGH"].map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
          <label htmlFor="status"><strong>Status:</strong></label>
          <select
            id="status"
            value={status}
            onChange={handleStatusChange}
            className={styles.modalSelect}
          >
            {["TODO", "IN_PROGRESS", "DONE"].map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>
        <div className={styles.buttonContainer}>
          <button className={styles.updateButton} onClick={handleUpdateClick}>Update</button>
          <button className={styles.deleteButton} onClick={handleDeleteClick}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;