import React, { useState, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { Task } from '@prisma/client';
import styles from './taskCard.module.css';
import TaskModal from './modals/taskModal';
import { CheckSquare, Users, ChartLine, Settings, FolderOpen, MessageCircle } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask?: (deletedTaskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdateTask, onDeleteTask, onClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mouseDownPos = useRef<{x: number, y: number} | null>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [task]);

  const truncateContent = (content: string, length: number) => {
    if (content.length <= length) {
      return content;
    }
    return content.substring(0, length) + '...';
  };

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

  return (
    <>
      <div
        className={styles.taskCard}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        ref={node => { if (node) drag(node); }}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
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