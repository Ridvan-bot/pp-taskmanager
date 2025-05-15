import React, { useState, useEffect } from 'react';
import styles from './newTaskModal.module.css';
import { Priority, Status } from '@prisma/client';
import { NewTaskModalProps } from '@/types';

const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onRequestClose, onCreateTask, customers, selectedCategory}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Priority | ''>('');
  const [status, setStatus] = useState('');
  const [projectId, setProjectId] = useState<number | ''>(''); 
  const [customerId, setCustomerId] = useState<number | ''>(''); 

  useEffect(() => {
    if (selectedCategory) {
      setStatus(selectedCategory);
    }
  }, [selectedCategory]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setPriority('');
    setStatus('');
    setProjectId('');
    setCustomerId('');
  };

  const handleClose = () => {
    resetForm();
    onRequestClose();
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTask(title, content, priority, status, customerId as number, projectId as number);
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
              {Object.values(Priority).map((value) => (
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
              {Object.values(Status).map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="project">Project</label>
            <select
              id="project"
              value={projectId}
              onChange={e => setProjectId(Number(e.target.value))}
              required
            >
              <option value="" disabled>Select Project</option>
              {customers.flatMap(customer => customer.projects).map((project) => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="customer">Customer</label>
            <select
              id="customer"
              value={customerId}
              onChange={e => setCustomerId(Number(e.target.value))}
              required
            >
              <option value="" disabled>Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
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