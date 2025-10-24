import mongoose from "mongoose";
import { config } from "./app.config";

const connectDatabase = async (retryCount = 0) => {
  const maxRetries = 5;
  
  try {
    console.log(`Attempting to connect to MongoDB (attempt ${retryCount + 1}/${maxRetries + 1}):`, config.MONGO_URI);
    await mongoose.connect(config.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 60000,
      bufferCommands: false,
      retryWrites: true,
      retryReads: true,
    });
    console.log("Connected to Mongo database successfully");

    // Test the connection
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      console.log("MongoDB ping successful");
    }
  } catch (error) {
    console.log(`Error connecting to Mongo database (attempt ${retryCount + 1}):`, error);
    
    if (retryCount < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Exponential backoff, max 30s
      console.log(`Retrying connection in ${delay}ms...`);
      setTimeout(() => connectDatabase(retryCount + 1), delay);
    } else {
      console.error("Max connection retries reached. Exiting...");
      process.exit(1);
    }
  }
};

export default connectDatabase;
