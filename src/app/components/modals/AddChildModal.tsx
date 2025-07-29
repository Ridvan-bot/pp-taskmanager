import React, { useState } from "react";
import styles from "./taskModal.module.css";
import { Task } from "@/types";

interface AddChildModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  parentTask: Task;
  allTasks: Task[];
  onChildrenAdded: (newChildren: Task[]) => void;
}

const AddChildModal: React.FC<AddChildModalProps> = ({
  isOpen,
  onRequestClose,
  parentTask,
  allTasks,
  onChildrenAdded,
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  // Exclude parent itself and already linked subtasks
  const availableTasks = allTasks.filter(
    (t) =>
      t.id !== parentTask.id &&
      t.customerId === parentTask.customerId &&
      t.projectId === parentTask.projectId,
  );

  const handleToggle = (id: number) => {
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  };

  const handleLink = async () => {
    setIsSaving(true);
    try {
      const newChildren: Task[] = [];
      for (const id of selectedIds) {
        const childTask = allTasks.find((t) => t.id === id);
        if (!childTask) continue;
        const updatedChild = { ...childTask, parentId: parentTask.id };
        const response = await fetch(`/api/task`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedChild),
        });
        if (response.ok) {
          const result: Task = await response.json();
          newChildren.push(result);
        }
      }
      onChildrenAdded(newChildren);
      onRequestClose();
    } catch {
      alert("Något gick fel vid koppling!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onRequestClose}>
          X
        </button>
        <h2 className={styles.modalTitle}>Link Child Tasks</h2>
        <div className={styles.modalBody}>
          <div style={{ marginBottom: 16, fontWeight: "bold" }}>
            Select one or more tasks to link as child to:{" "}
            <span style={{ color: "#3b82f6" }}>{parentTask.title}</span>
          </div>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              maxHeight: 300,
              overflowY: "auto",
              margin: 0,
            }}
          >
            {availableTasks.length === 0 && (
              <li style={{ color: "#888" }}>No available tasks</li>
            )}
            {availableTasks.map((t) => (
              <li
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 8,
                  background: "#f3f7fd",
                  borderRadius: 6,
                  padding: "6px 10px",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(t.id)}
                  onChange={() => handleToggle(t.id)}
                  disabled={isSaving}
                  style={{ marginRight: 10 }}
                />
                <span>{t.title}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.buttonContainer}>
          <button
            className={styles.updateButton}
            onClick={handleLink}
            disabled={isSaving || selectedIds.length === 0}
          >
            Link selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddChildModal;
