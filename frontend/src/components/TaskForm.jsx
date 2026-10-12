import { useState, useEffect } from "react";

// One component handles both create and edit.
// If "task" is passed, we are editing; if null, we are creating.
const TaskForm = ({ task, onSubmit, onClose }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: "",
  });
  const [saving, setSaving] = useState(false);

  // When editing, pre-fill the form with the existing task.
  // The dependency array [task] re-runs this if a different task is opened.
  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "pending",
        priority: task.priority || "medium",
        // An <input type="date"> needs the YYYY-MM-DD format,
        // so we slice it out of the full ISO string
        dueDate: task.dueDate ? task.dueDate.substring(0, 10) : "",
      });
    }
  }, [task]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit(form); // the parent decides create vs update
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* stopPropagation prevents a click inside the modal
          from bubbling up and closing it */}
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{task ? "Edit Task" : "New Task"}</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="What needs doing?"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional details"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : task ? "Update Task" : "Create Task"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;