import React, { useState, useEffect } from 'react';
import { Priority } from '@/types';
import { Task } from '@/types';
import styles from './taskModal.module.css';

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onRequestClose: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (deletedTaskId: string) => void;
  allTasks?: Task[];
}

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onRequestClose, onUpdateTask, onDeleteTask, allTasks = [] }) => {
  const [title, setTitle] = useState(task.title);
  const [content, setContent] = useState(task.content);
  const [priority, setPriority] = useState(task.priority);
  const [status] = useState(task.status);
  const [showAddChildDropdown, setShowAddChildDropdown] = useState(false);
  const [isAddingChild, setIsAddingChild] = useState(false);

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

  const handleUpdateClick = async () => {
    const updatedTask = {
      ...task,
      title,
      content,
      priority,
      status,
      customerId: task.customerId,
      projectId: task.projectId,
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

          <div style={{ marginTop: 16, fontSize: '0.95em', color: '#666' }}>
            <div><strong>Created:</strong> {task.createdAt ? new Date(task.createdAt).toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}</div>
            <div><strong>Updated:</strong> {task.updatedAt ? new Date(task.updatedAt).toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}</div>
            {task.closedAt && (
              <div><strong>Closed:</strong> {new Date(task.closedAt).toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
            )}
          </div>
          {task.subtasks && task.subtasks.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontWeight: 'bold', color: '#3b82f6', marginBottom: 6, fontSize: '1.05em' }}>
                Child Tasks:
              </div>
              <button
                  style={{
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    fontSize: 16,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 0,
                    boxShadow: '0 2px 8px #0001',
                    transition: 'background 0.2s',
                    marginBottom: 16,
                  }}
                  title="Add child"
                  onClick={() => setShowAddChildDropdown(v => !v)}
                >
                  +
                </button>
              <ul style={{ paddingLeft: 0, margin: 0 }}>
                {task.subtasks.map((subtask) => (
                  <li
                    key={subtask.id}
                    onClick={() => window.dispatchEvent(new CustomEvent('open-task-modal', { detail: subtask }))}
                    style={{
                      marginBottom: 6,
                      color: '#f0f0f0',
                      background: '#3b83f62f',
                      border: '2px solid #3b82f6',
                      borderRadius: 6,
                      padding: '6px 12px',
                      fontSize: '1em',
                      cursor: 'pointer',
                      transition: 'background 0.2s, border-color 0.2s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = '#3b82f6')}
                    onMouseOut={e => (e.currentTarget.style.background = '#3b83f62f')}
                  >
                    {subtask.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {task.parent && (
            <button
              style={{
                background: '#3b83f62f',
                border: '2px solid #3b82f6',
                color: '#3b82f6',
                borderRadius: 6,
                padding: '6px 14px',
                fontWeight: 'bold',
                marginTop: 16,
                cursor: 'pointer',
                fontSize: '1em',
                transition: 'background 0.2s, border-color 0.2s',
                width: '100%'
              }}
              onClick={() => window.dispatchEvent(new CustomEvent('open-task-modal', { detail: task.parent }))}
              onMouseOver={e => (e.currentTarget.style.background = '#3b82f6', e.currentTarget.style.color = '#fff')}
              onMouseOut={e => (e.currentTarget.style.background = '#3b83f62f', e.currentTarget.style.color = '#3b82f6')}
            >
              ⬆ To Parent Task: {task.parent.title}
            </button>
          )}
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