import cors from "cors";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { env } from "./config/env.js";
import apiRoutes from "./routes/api.routes.js";
import { errorHandler } from "./middleware/error-handler.js";

export function createApp(auth, database, client) {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    }),
  );

  app.all("/api/auth/*", toNodeHandler(auth));
  app.use(express.json());
  app.use("/api", apiRoutes({ auth, database, client }));
  app.use((request, response) => {
    response.status(404).json({ error: "Route not found" });
  });
  app.use(errorHandler);

  return app;
}
