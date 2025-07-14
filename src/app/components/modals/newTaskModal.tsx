import React, { useState, useEffect } from 'react';
import styles from './newTaskModal.module.css';
import { Priority, Status, Project } from '@/types';
import { NewTaskModalProps } from '@/types';

const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onRequestClose, onCreateTask, customers, selectedCategory, availableTasks = [], selectedCustomerObj, selectedProjectObj }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Priority | ''>('');
  const [status, setStatus] = useState('');
  const [projectId, setProjectId] = useState<number | ''>(selectedProjectObj?.id ?? '');
  const [customerId, setCustomerId] = useState<number | ''>(selectedCustomerObj?.id ?? '');
  const [parentId, setParentId] = useState<number | null>(null);

  useEffect(() => {
    if (selectedCategory) {
      setStatus(selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    setCustomerId(selectedCustomerObj?.id ?? '');
    setProjectId(selectedProjectObj?.id ?? '');
  }, [selectedCustomerObj, selectedProjectObj]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setPriority('');
    setStatus('');
    setProjectId(selectedProjectObj?.id ?? '');
    setCustomerId(selectedCustomerObj?.id ?? '');
    setParentId(null);
  };

  const handleClose = () => {
    resetForm();
    onRequestClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTask(title, content, priority, status, customerId as number, projectId as number, parentId);
    resetForm();
    onRequestClose();
  };

  if (!isOpen) {
    return null;
  }
  
  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose}>X</button>
        <h2>New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={priority}
              onChange={e => setPriority(e.target.value as Priority)}
              required
            >
              <option value="" disabled>Select priority</option>
              {["LOW", "MEDIUM", "HIGH"].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={e => setStatus(e.target.value as Status)}
              required
            >
              <option value="" disabled>Select status</option>
              {["NOT_STARTED", "WIP", "WAITING", "CLOSED"].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Customer</label>
            <div className={styles.readOnlyField}>{selectedCustomerObj ? selectedCustomerObj.name : 'No customer selected'}</div>
          </div>
          <div className={styles.formGroup}>
            <label>Project</label>
            <div className={styles.readOnlyField}>{selectedProjectObj ? selectedProjectObj.title : 'No project selected'}</div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="parent">Parent Task (Optional)</label>
            <select
              id="parent"
              value={parentId || ''}
              onChange={e => setParentId(Number(e.target.value) || null)}
            >
              <option value="">No parent task</option>
              {availableTasks
                .filter(task => task.customerId === customerId && task.projectId === projectId)
                .map((task) => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
            </select>
          </div>
          <button type="submit" className={styles.submitButton}>Create Task</button>
        </form>
      </div>
    </div>
  );
};

export default NewTaskModal;