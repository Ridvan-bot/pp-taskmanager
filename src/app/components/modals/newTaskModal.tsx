import React, { useState, useEffect } from 'react';
import styles from './newTaskModal.module.css';
import { Priority, Status, Project } from '@/types';
import { NewTaskModalProps } from '@/types';

const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onRequestClose, onCreateTask, customers, selectedCategory, availableTasks = []}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Priority | ''>('');
  const [status, setStatus] = useState('');
  const [projectId, setProjectId] = useState<number | ''>(''); 
  const [customerId, setCustomerId] = useState<number | ''>(''); 
  const [parentId, setParentId] = useState<number | null>(null);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (selectedCategory) {
      setStatus(selectedCategory);
    }
  }, [selectedCategory]);

  // Update available projects when customer changes
  useEffect(() => {
    if (customerId) {
      const selectedCustomer = customers.find(c => c.id === customerId);
      if (selectedCustomer) {
        setAvailableProjects(selectedCustomer.projects);
        setProjectId(''); // Reset project selection when customer changes
      }
    } else {
      setAvailableProjects([]);
      setProjectId('');
    }
  }, [customerId, customers]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setPriority('');
    setStatus('');
    setProjectId('');
    setCustomerId('');
    setParentId(null);
    setAvailableProjects([]);
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
          <div className={styles.formGroup}>
            <label htmlFor="project">Project</label>
            <select
              id="project"
              value={projectId}
              onChange={e => setProjectId(Number(e.target.value))}
              disabled={!customerId}
              required
            >
              <option value="" disabled>
                {customerId ? 'Select Project' : 'Select Customer First'}
              </option>
              {availableProjects.map((project) => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
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