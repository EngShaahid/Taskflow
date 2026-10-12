import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import ChatBot from "../components/ChatBot";
import TaskForm from "../components/TaskForm";

const Dashboard = () => {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Modal state. editingTask = null means "create mode"
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // useCallback keeps the same function reference between renders,
  // so the useEffect below does not fire on every single render.
  const fetchTasks = useCallback(async () => {
    try {
      // The backend does the filtering, not the browser.
      // This scales properly and keeps the logic in one place.
      const res = await api.get("/tasks", {
        params: { search, status: statusFilter, priority: priorityFilter },
      });
      setTasks(res.data.tasks);
      setError("");
    } catch (err) {
      setError("Could not load tasks. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/tasks/stats");
      setStats(res.data.stats);
    } catch (err) {
      // Stats failing should not break the page
      console.error("Stats fetch failed");
    }
  }, []);

  // DEBOUNCE: wait 400ms after the user stops typing before searching.
  // Without this, every keystroke fires a request.
  useEffect(() => {
    const timer = setTimeout(fetchTasks, 400);

    // Cleanup runs before the next effect, cancelling the pending timer
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Refresh both lists after any change
  const refresh = () => {
    fetchTasks();
    fetchStats();
  };

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, formData);
      } else {
        await api.post("/tasks", formData);
      }
      closeForm();
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await api.delete(`/tasks/${id}`);
      refresh();
    } catch (err) {
      setError("Delete failed");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status });
      refresh();
    } catch (err) {
      setError("Status update failed");
    }
  };

  const openCreate = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  return (
    <>
      <Navbar />

      <div className="container">
        <h2>Welcome, {user?.name}</h2>

        {/* STATISTICS */}
        <div className="stats-grid" style={{ marginTop: 20 }}>
          <div className="stat-card stat-total">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card stat-pending">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card stat-progress">
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card stat-completed">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        {/* SEARCH + FILTERS */}
        <div className="toolbar">
          <input
            className="search-input"
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button className="btn btn-primary" onClick={openCreate}>
            + New Task
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* TASK LIST */}
        {loading ? (
          <div className="empty-state">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            No tasks found. Create your first one.
          </div>
        ) : (
          <div className="task-grid">
            {tasks.map((task) => (
              // key helps React track which items changed.
              // Using the database _id is the correct choice here.
              <TaskCard
                key={task._id}
                task={task}
                onEdit={openEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={handleCreateOrUpdate}
          onClose={closeForm}
          
        />
      )}

      {/* Floating AI assistant - fixed position, sits above all content */}
      <ChatBot />
    </>
  );
};

export default Dashboard;