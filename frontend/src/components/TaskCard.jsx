const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  // Convert the ISO date string from MongoDB into a readable format
  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className={`task-card priority-${task.priority}`}>
      <h3>{task.title}</h3>

      {/* Render the description only if it exists */}
      {task.description && <p className="task-desc">{task.description}</p>}

      <div className="task-meta">
        <span className={`badge badge-${task.status}`}>
          {task.status.replace("-", " ")}
        </span>
        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
      </div>

      {task.dueDate && (
        <div className="task-due">Due: {formatDate(task.dueDate)}</div>
      )}

      {/* Quick status change without opening the edit modal */}
      <select
        value={task.status}
        onChange={(e) => onStatusChange(task._id, e.target.value)}
      >
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      <div className="task-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(task._id)}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;