import { createServer } from "http";
import app from "./app";
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import SocketService from "./services/socket.service";
import { validateBillingEnvironment } from "./utils/validate-billing-env";

const server = createServer(app);

connectDatabase()
  .then(() => {
    // Validate billing environment
    console.log("🔍 Validating billing environment...");
    const isBillingValid = validateBillingEnvironment();

    if (!isBillingValid) {
      console.warn("⚠️  Billing environment has issues. Payment features may not work correctly.");
    }

    // Initialize Socket.IO service
    const socketService = new SocketService(server);
    console.log("Socket.IO service initialized");

    // Make socketService available globally for other parts of the app
    (global as any).socketService = socketService;

    server.listen(config.PORT, () => {
      console.log(`Server is running http://localhost:${config.PORT}`);
      console.log(`Socket.IO ready for connections`);

      if (isBillingValid) {
        console.log("💳 Billing system ready for transactions");
      }
    });
  })
  .catch((error) => console.log("Failed to connect to database: ", error));
