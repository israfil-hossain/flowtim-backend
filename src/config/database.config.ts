import mongoose from "mongoose";
import { config } from "./app.config";

const connectDatabase = async () => {
  try {
    console.log("Attempting to connect to MongoDB:", config.MONGO_URI);
    await mongoose.connect(config.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log("Connected to Mongo database successfully");

    // Test the connection
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      console.log("MongoDB ping successful");
    }
  } catch (error) {
    console.log("Error connecting to Mongo database:", error);
    setTimeout(connectDatabase, 5000);
  }
};

export default connectDatabase;
