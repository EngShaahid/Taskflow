const Task = require("../models/Task");

// @desc   Create a new task
// @route  POST /api/tasks
// @access Private
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // The owner comes from the VERIFIED TOKEN, never from req.body.
    // Even if the client sends "user": "<someone else's id>", we ignore it.
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      user: req.user._id,
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc   Get all tasks for the logged-in user (with search + filters)
// @route  GET /api/tasks?search=&status=&priority=
// @access Private
const getTasks = async (req, res) => {
  try {
    const { search, status, priority } = req.query;

    // Start every query scoped to the owner. This is the security boundary.
    const query = { user: req.user._id };

    // FILTER: only add the condition if the value was actually sent.
    // "all" is what the frontend dropdown sends for "no filter".
    if (status && status !== "all") {
      query.status = status;
    }

    if (priority && priority !== "all") {
      query.priority = priority;
    }

    // SEARCH: $regex matches partial text, "i" makes it case-insensitive.
    // $or means "title matches OR description matches".
    if (search && search.trim() !== "") {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // sort -1 = descending, so newest tasks appear first
    const tasks = await Task.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get a single task
// @route  GET /api/tasks/:id
// @access Private
const getTaskById = async (req, res) => {
  try {
    // findOne with BOTH conditions - not findById.
    // A task belonging to another user simply is not found.
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    // A malformed id (not 24 hex chars) throws a CastError
    res.status(400).json({ success: false, message: "Invalid task id" });
  }
};

// @desc   Update a task
// @route  PUT /api/tasks/:id
// @access Private
const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    // Build the update object from only the fields that were sent,
    // so a partial update does not wipe the other fields.
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (dueDate !== undefined) updates.dueDate = dueDate || null;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, // scoped to the owner
      updates,
      {
        new: true,          // return the UPDATED document, not the old one
        runValidators: true // re-check the enum rules on update
      }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc   Delete a task
// @route  DELETE /api/tasks/:id
// @access Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      taskId: req.params.id,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid task id" });
  }
};

// @desc   Get task statistics for the dashboard cards
// @route  GET /api/tasks/stats
// @access Private
const getTaskStats = async (req, res) => {
  try {
    // countDocuments returns a number, not the documents themselves.
    // Promise.all runs all four counts in parallel instead of one by one.
    const [total, pending, inProgress, completed] = await Promise.all([
      Task.countDocuments({ user: req.user._id }),
      Task.countDocuments({ user: req.user._id, status: "pending" }),
      Task.countDocuments({ user: req.user._id, status: "in-progress" }),
      Task.countDocuments({ user: req.user._id, status: "completed" }),
    ]);

    res.status(200).json({
      success: true,
      stats: { total, pending, inProgress, completed },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
};