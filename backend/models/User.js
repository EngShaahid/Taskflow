const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// SCHEMA = blueprint of a User document.
// MongoDB is schema-less; Mongoose adds structure and validation.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,    // no two users share an email
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never returned in queries by default
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// PRE-SAVE HOOK: runs automatically before any user is saved.
//
// NOTE: this is an ASYNC function, so it takes NO "next" parameter.
// Mongoose 9 awaits the returned promise instead of calling a callback.
// A plain "return" is how we exit early.
userSchema.pre("save", async function () {
  // Only hash when the password actually changed.
  // Without this, editing a name would re-hash the hash and break login.
  if (!this.isModified("password")) return;

  // Salt = random data mixed in, so identical passwords get different hashes.
  // 10 = cost factor (higher is slower and safer)
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// INSTANCE METHOD: available on every user document.
// Hashing is ONE-WAY, so we re-hash the input and compare.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);