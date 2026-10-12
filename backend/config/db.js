// Import Mongoose - the library that lets us talk to MongoDB using JavaScript
const mongoose = require("mongoose");

// Connects our app to MongoDB.
// "async" because connecting is a network request that takes time.
const connectDB = async () => {
  try {
    // Fail fast with a clear message if the .env value is missing
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in your .env file");
    }

    // Open the connection using the URI from .env
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);

    // No point running an API that cannot reach its database
    process.exit(1);
  }
};

module.exports = connectDB;