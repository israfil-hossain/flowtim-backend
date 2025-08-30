import app from "./app";
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";

connectDatabase()
  .then(() => {
    app.listen(config.PORT, () => {
      console.log(`Server is running http://localhost:${config.PORT}`);
    });
  })
  .catch((error) => console.log("Failed to connect to database: ", error));
