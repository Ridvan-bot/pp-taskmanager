'use client';
import React, { useState, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { Task } from '@/types';
import styles from './taskCard.module.css';
import TaskModal from './modals/taskModal';
import { isToday } from 'date-fns';


interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask?: (deletedTaskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdateTask, onDeleteTask }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mouseDownPos = useRef<{x: number, y: number} | null>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [task]);

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    mouseDownPos.current = null;
  };

  const handleDoubleClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const updatedToday = task.updatedAt && isToday(new Date(task.updatedAt));

  return (
    <>
      <div
        className={styles.taskCard}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        ref={node => { if (node) drag(node); }}
        style={{ opacity: isDragging ? 0.5 : 1, position: 'relative' }}
      >
        {updatedToday && (
          <span style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: '#06b6d4',
            color: '#fff',
            borderRadius: '50%',
            width: 18,
            height: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 'bold',
            zIndex: 2
          }} title="Task updated today">
            ●
          </span>
        )}
        <strong>Title:</strong> {task.title}
        {task.subtasks && task.subtasks.length > 0 && (
          <span className={styles.parentIndicator}>(Parent)</span>
        )}
        {task.parentId && (
          <span className={styles.subtaskIndicator}> (Subtask)</span>
        )}
        <br />
        <strong>Prio:</strong> {task.priority}
        {task.subtasks && task.subtasks.length > 0 && (
          <>
            <br />
            <strong>Subtasks:</strong> {task.subtasks.length}
          </>
        )}
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