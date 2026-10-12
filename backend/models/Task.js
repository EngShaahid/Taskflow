const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    // enum = only these exact values are allowed.
    // Mongoose rejects anything else with a validation error.
    status: {
      type: String,
      enum: {
        values: ["pending", "in-progress", "completed"],
        message: "Status must be pending, in-progress or completed",
      },
      default: "pending",
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "Priority must be low, medium or high",
      },
      default: "medium",
    },

    dueDate: {
      type: Date,
      default: null,
    },

    // THE OWNERSHIP LINK.
    // ObjectId stores a reference to a document in the users collection.
    // ref: "User" tells Mongoose which model it points to, which is what
    // makes .populate() possible if we ever need the full user object.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true } // createdAt and updatedAt
);

// INDEX: MongoDB builds a lookup table for these two fields together.
// Every one of our queries filters by user, so this makes them fast
// even when the collection holds thousands of tasks from many users.
taskSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Task", taskSchema);