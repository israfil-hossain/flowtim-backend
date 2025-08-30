import mongoose from "mongoose";
import { config } from "./app.config";

const connectDatabase = async () => {
  try {
    console.log("Attempting to connect to MongoDB:", config.MONGO_URI);
    await mongoose.connect(config.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("Connected to Mongo database successfully");
  } catch (error) {
    console.log("Error connecting to Mongo database:", error);
    // Don't exit process, let it retry
    setTimeout(connectDatabase, 5000);
  }
};

export default connectDatabase;
