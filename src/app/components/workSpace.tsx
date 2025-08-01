"use client";
import React, { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import Sidebar from "./sidebar";
import TaskCard from "./taskCard";
import LoginModal from "./modals/loginModal";
import NewTaskModal from "./modals/newTaskModal";
import { Task, Project, Status } from "@/types";
import { CustomSession, Customer } from "../../types";
import { fetchTasksForCustomers } from "@/lib/getRequest";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ChatSidebar from "./chatSidebar";
import { ChevronsUpDown } from "lucide-react";
import TaskModal from "./modals/taskModal";

const COLUMN_STATUSES: Status[] = ["NOT_STARTED", "WIP", "WAITING", "CLOSED"];

function TaskDropColumn({
  category,
  children,
  onDropTask,
}: {
  category: string;
  children: React.ReactNode;
  onDropTask: (taskId: number, newStatus: string) => void;
}) {
  const [{ isOver }, drop] = useDrop({
    accept: "TASK",
    drop: (item: { id: number; status: string }) => {
      if (item.status !== category) {
        onDropTask(item.id, category);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });
  return (
    <div
      ref={(node) => {
        if (node) drop(node);
      }}
      style={{
        minHeight: 100,
        background: isOver ? "#3b82f6" : "transparent",
        transition: "background 0.2s",
        borderRadius: 8,
      }}
    >
      {children}
    </div>
  );
}

// Helper to format status
function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper to get color/gradient for each status
function getStatusHeaderStyle(status: string) {
  switch (status) {
    case "NOT_STARTED":
      return "bg-gradient-to-r from-blue-500/80 to-blue-400/80 text-white shadow-md";
    case "WIP":
      return "bg-gradient-to-r from-yellow-400/80 to-yellow-300/80 text-slate-900 shadow-md";
    case "WAITING":
      return "bg-gradient-to-r from-orange-400/80 to-orange-300/80 text-slate-900 shadow-md";
    case "CLOSED":
      return "bg-gradient-to-r from-green-500/80 to-green-400/80 text-white shadow-md";
    default:
      return "bg-gradient-to-r from-slate-600/80 to-slate-500/80 text-white shadow-md";
  }
}

const WorkSpace: React.FC = () => {
  const { data: session, status } = useSession() as {
    data: CustomSession | null;
    status: string;
  };
  const [customersName, setCustomersName] = useState<string[]>([]);
  const [customerData, setCustomerData] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sortOrders, setSortOrders] = useState<{
    [key: string]: "asc" | "desc";
  }>({
    NOT_STARTED: "asc",
    WIP: "asc",
    WAITING: "asc",
    CLOSED: "asc",
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showDelayedLoading, setShowDelayedLoading] = useState(false);

  const prevIsTaskModalOpen = useRef(isTaskModalOpen);

  // Delayed loading state - show spinner only after 10 seconds
  useEffect(() => {
    if (status === "loading") {
      const timer = setTimeout(() => {
        setShowDelayedLoading(true);
      }, 10000); // 10 seconds

      return () => {
        clearTimeout(timer);
        setShowDelayedLoading(false);
      };
    } else {
      setShowDelayedLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === "unauthenticated") {
      setIsLoginModalOpen(true);
    } else {
      setIsLoginModalOpen(false);
    }
  }, [status]);

  useEffect(() => {
    if (customersName.length > 0) {
      const fetchData = async () => {
        const data = await fetchTasksForCustomers(customersName);
        setTasks(data);
      };
      fetchData();
    }
  }, [customersName]);

  useEffect(() => {
    if (session && session.user) {
      fetchUserCustomers();
    }
  }, [session]);

  useEffect(() => {
    prevIsTaskModalOpen.current = isTaskModalOpen;
  }, [isTaskModalOpen]);

  // Update projects when selectedCustomer changes
  useEffect(() => {
    setSelectedProject(""); // Always reset project first
    if (selectedCustomer) {
      const customer = customerData.find((c) => c.name === selectedCustomer);
      if (customer) {
        setProjects(customer.projects);
      }
    } else {
      setProjects([]);
    }
  }, [selectedCustomer, customerData]);

  // Fetch tasks whenever selectedCustomer or selectedProject changes
  useEffect(() => {
    if (selectedCustomer && (selectedProject || projects.length === 0)) {
      const fetchData = async () => {
        let url = `/api/filtertaskoncustomer?customer=${selectedCustomer}`;
        if (selectedProject) {
          url += `&project=${selectedProject}`;
        }
        const data = await fetch(url);
        const dataJson = await data.json();
        setTasks(dataJson.data);
      };
      fetchData();
    } else {
      // Clear tasks when no customer is selected or no project is selected (if projects exist)
      setTasks([]);
    }
  }, [selectedCustomer, selectedProject, projects]);

  useEffect(() => {
    function handleOpenTaskModal(e: CustomEvent<Task>) {
      if (e.detail && e.detail.id) {
        setIsTaskModalOpen(false);
        setTimeout(() => {
          setSelectedTask(e.detail);
          setIsTaskModalOpen(true);
        }, 150); // Delay för att hinna stänga först
      }
    }
    window.addEventListener(
      "open-task-modal",
      handleOpenTaskModal as EventListener,
    );
    return () =>
      window.removeEventListener(
        "open-task-modal",
        handleOpenTaskModal as EventListener,
      );
  }, []);

  const fetchUserCustomers = async () => {

    if (!session || !session.user) {
      console.error("User ID is not available");
      return;
    }
    try {
      const response = await fetch(`/api/customer?userId=${session.user.id}`);

      if (!response.ok) {
        if (response.status === 500) {
          // User not found in database, sign out
          console.error("User not found in database, signing out");
          signOut();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const customerData = await response.json();
      const customerArray = Array.isArray(customerData.customers)
        ? customerData.customers.map((customer: Customer) => customer.name)
        : [];
      setCustomersName(customerArray);
      setCustomerData(
        Array.isArray(customerData.customers) ? customerData.customers : [],
      );
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      // If there's an error fetching user data, sign out
      signOut();
    }
  };

  // Auto-select first customer if none is selected and data is loaded
  useEffect(() => {
    if (!selectedCustomer && customerData.length > 0) {
      setSelectedCustomer(customerData[0].name);
    }
  }, [customerData, selectedCustomer]);

  // Auto-select first project if none is selected and projects are loaded
  useEffect(() => {
    if (!selectedProject && projects.length > 0) {
      setSelectedProject(projects[0].title);
    }
  }, [projects, selectedProject]);

  // Always reset selectedProject when selectedCustomer changes
  useEffect(() => {
    setSelectedProject("");
  }, [selectedCustomer]);

  // Show loading spinner only after delay while session is being fetched
  if (status === "loading") {
    if (showDelayedLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
            <p className="text-white text-lg">Laddar...</p>
          </div>
        </div>
      );
    } else {
      // Show nothing while waiting for delayed loading or session to resolve
      return (
        <div className="min-h-screen bg-slate-900">
          {/* Silent loading - no spinner yet */}
        </div>
      );
    }
  }

  // Show login modal only when explicitly unauthenticated
  if (status === "unauthenticated") {
    return (
      <LoginModal
        isOpen={isLoginModalOpen}
        onRequestClose={() => setIsLoginModalOpen(false)}
      />
    );
  }

  const categorizeTasks = (tasks: Task[] = []) => {
    const categories = {
      NOT_STARTED: [] as Task[],
      WIP: [] as Task[],
      WAITING: [] as Task[],
      CLOSED: [] as Task[],
    };

    // Calculate the date 14 days ago
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    (tasks || []).forEach((task) => {
      // Skip CLOSED tasks that are older than 14 days
      if (task.status === "CLOSED") {
        const taskUpdatedAt = new Date(task.updatedAt);
        if (taskUpdatedAt < fourteenDaysAgo) {
          return; // Skip this task - don't add it to any category
        }
      }

      switch (task.status) {
        case "NOT_STARTED":
          categories.NOT_STARTED.push(task);
          break;
        case "WIP":
          categories.WIP.push(task);
          break;
        case "WAITING":
          categories.WAITING.push(task);
          break;
        case "CLOSED":
          categories.CLOSED.push(task);
          break;
        default:
          // Skip tasks with unknown status
          break;
      }
    });

    return categories;
  };

  // Sort tasks by priority (for most columns) or by updatedAt (for CLOSED)
  const sortTasks = (
    tasks: Task[],
    sortOrder: "asc" | "desc",
    category: string,
  ) => {
    if (category === "CLOSED") {
      // Sort by updatedAt (nyast först om desc, äldst först om asc)
      return tasks.sort((a, b) => {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    } else {
      // Sort by priority
      const priorityOrder: { [key: string]: number } = {
        BC: 1,
        HIGH: 2,
        MEDIUM: 3,
        LOW: 4,
      };
      return tasks.sort((a, b) => {
        const priorityA = priorityOrder[a.priority as string] || 999;
        const priorityB = priorityOrder[b.priority as string] || 999;
        return sortOrder === "asc"
          ? priorityA - priorityB // HIGH first in ascending order
          : priorityB - priorityA; // LOW first in descending order
      });
    }
  };

  const handleSortClick = (category: string) => {
    setSortOrders((prev) => ({
      ...prev,
      [category]: prev[category] === "asc" ? "desc" : "asc",
    }));
  };

  const handleNewTaskClick = (category: string) => {
    setIsNewTaskModalOpen(true);
    setSelectedCategory(category);
  };

  const handleCreateTask = async (
    title: string,
    content: string,
    priority: string,
    status: string,
    customerId: number,
    projectId: number,
    parentId: number | null,
  ) => {
    try {
      const response = await fetch("/api/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          priority,
          status,
          customerId,
          projectId,
          parentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const newTask = await response.json();
      setTasks((prev) => [...prev, newTask]);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleDeleteTask = (deletedTaskId: string) => {
    setTasks((prev) =>
      prev.filter((task) => String(task.id) !== String(deletedTaskId)),
    );
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const categorizedTasks = categorizeTasks(tasks);

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
    );
  };

  // Fetch tasks from backend
  const fetchTasks = async () => {
    if (!selectedCustomer) return; // Guard: do nothing if no customer selected
    let url = `/api/filtertaskoncustomer?customer=${selectedCustomer}`;
    if (selectedProject) {
      url += `&project=${selectedProject}`;
    }
    const data = await fetch(url);
    const dataJson = await data.json();
    setTasks(dataJson.data);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex min-h-screen bg-slate-900 relative">
        {/* Sidebar with chat open handler */}
        <Sidebar
          onLogout={() => signOut()}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onChatClick={() => setIsChatOpen(true)}
          activeMenu={isChatOpen ? "Chat" : "Tasks"}
        />
        
        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        {/* Main content */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-slate-800/90 border-b border-slate-700 px-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between rounded-2xl shadow-xl m-4 md:m-6 mb-0 space-y-4 md:space-y-0">
            <div className="flex items-center justify-between w-full md:w-auto">
              <div className="flex items-center space-x-4">
                {/* Mobile menu button */}
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden text-white p-2 rounded-lg hover:bg-slate-700 transition-colors"
                  aria-label="Toggle menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">Task Manager</h2>
                  <p className="text-xs md:text-sm text-slate-400 hidden sm:block">Manage your tasks</p>
                </div>
              </div>
              {/* Mobile chat button */}
              <button
                onClick={() => setIsChatOpen(true)}
                className="lg:hidden text-white p-2 rounded-lg hover:bg-slate-700 transition-colors"
                aria-label="Open chat"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 text-xs w-full sm:w-auto min-w-[120px]"
              >
                <option value="">Select Customer</option>
                {Array.isArray(customerData) &&
                  customerData.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
              </select>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 text-xs w-full sm:w-auto min-w-[120px]"
                disabled={!selectedCustomer}
              >
                <option value="">Select Project</option>
                {Array.isArray(projects) &&
                  projects.map((project) => (
                    <option key={project.id} value={project.title}>
                      {project.title}
                    </option>
                  ))}
              </select>
              <button
                className="px-4 py-2 text-xs rounded-lg pohlman-button hidden sm:block"
                onClick={() => signOut()}
              >
                Logout
              </button>
            </div>
          </header>

          {/* Content */}
          <section className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
            {/* Task Table Headers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {COLUMN_STATUSES.map((category) => (
                <div
                  key={category}
                  className={`flex items-center justify-between font-bold border border-white/10 rounded-2xl px-4 py-1.5 mb-2 text-lg ${getStatusHeaderStyle(category)} transition-all`}
                  style={{ minHeight: 36 }}
                >
                  <span className="tracking-wide drop-shadow-sm flex items-center">
                    {formatStatus(category)}
                    {category === "CLOSED" && (
                      <span
                        style={{
                          color: "#0f172a",
                          fontSize: "0.95em",
                          marginLeft: 8,
                          verticalAlign: "middle",
                          cursor: "help",
                          display: "inline-flex",
                          alignItems: "center",
                          fontWeight: 500,
                        }}
                        title="Sorted by last updated, not priority"
                      >
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{ marginRight: 4 }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        (Sorted by updated)
                      </span>
                    )}
                  </span>
                  <button
                    className="text-white/70 hover:text-white text-xl px-1 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-white/40"
                    onClick={() => handleSortClick(category)}
                    aria-label={`Sort ${formatStatus(category)}`}
                  >
                    <ChevronsUpDown className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Task Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {COLUMN_STATUSES.map((category) => (
                <TaskDropColumn
                  key={category}
                  category={category}
                  onDropTask={async (taskId, newStatus) => {
                    if (!selectedCustomer) {
                      setToast(
                        "Vänligen välj en kund innan du flyttar en task.",
                      );
                      setTimeout(() => setToast(null), 3000);
                      return;
                    }
                    const task = tasks.find((t) => t.id === taskId);
                    if (task && task.status !== newStatus) {
                      const updatedTask = {
                        ...task,
                        status: newStatus as Status,
                      };
                      handleUpdateTask(updatedTask);
                      await fetch(`/api/task`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updatedTask),
                      });
                      fetchTasks();
                    }
                  }}
                >
                  <div className="flex flex-col gap-4">
                    {(
                      sortTasks(
                        categorizedTasks[
                          category as keyof typeof categorizedTasks
                        ],
                        sortOrders[category],
                        category,
                      ) ?? []
                    ).map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClick={() => handleTaskClick(task)}
                        onUpdateTask={handleUpdateTask}
                        onDeleteTask={handleDeleteTask}
                      />
                    ))}
                    <button
                      className="w-full h-16 sm:h-20 border-2 border-dashed border-slate-600 rounded-md bg-transparent text-white/75 text-2xl sm:text-3xl flex items-center justify-center hover:shadow-lg transition-all duration-200 hover:border-slate-500 hover:text-white"
                      onClick={() => handleNewTaskClick(category)}
                      aria-label={`Create new task in ${category}`}
                    >
                      +
                    </button>
                  </div>
                </TaskDropColumn>
              ))}
            </div>
          </section>

          <NewTaskModal
            isOpen={isNewTaskModalOpen}
            onRequestClose={() => setIsNewTaskModalOpen(false)}
            onCreateTask={handleCreateTask}
            customers={customerData}
            selectedCustomerObj={
              customerData.find((c) => c.name === selectedCustomer) || null
            }
            selectedProjectObj={
              projects.find((p) => p.title === selectedProject) || null
            }
            selectedCategory={selectedCategory}
            availableTasks={tasks}
          />
        </main>
        {/* ChatSidebar on the right */}
        {isChatOpen && (
          <ChatSidebar 
            onClose={() => setIsChatOpen(false)} 
            selectedCustomer={selectedCustomer}
            selectedProject={selectedProject}
          />
        )}
        {/* Toast display */}
        {toast && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow-lg text-sm sm:text-base font-semibold animate-fade-in-out max-w-[90%] text-center">
            {toast}
          </div>
        )}
        {selectedTask && (
          <TaskModal
            task={selectedTask}
            isOpen={isTaskModalOpen}
            onRequestClose={() => setIsTaskModalOpen(false)}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            allTasks={tasks}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default WorkSpace;
