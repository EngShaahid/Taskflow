const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
} = require("../controllers/taskController");

const { protect } = require("../middleware/authMiddleware");

// Apply "protect" to EVERY route in this file.
// One line instead of repeating it six times - and impossible to forget.
router.use(protect);

// ORDER MATTERS: /stats must come before /:id.
// Otherwise Express matches "stats" as an :id value and tries
// to look up a task with the id "stats".
router.get("/stats", getTaskStats);

router.route("/").post(createTask).get(getTasks);

router
  .route("/:id")
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;