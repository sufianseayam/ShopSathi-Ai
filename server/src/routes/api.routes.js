import { Router } from "express";
import { createAuthMiddleware } from "../middleware/auth.js";
import { createDashboardRoutes } from "./dashboard.routes.js";
import { createProductRoutes } from "./product.routes.js";
import { createShopRoutes } from "./shop.routes.js";
import healthRoutes from "./health.routes.js";

export default function apiRoutes({ auth, database, client }) {
  const router = Router();
  const requireAuth = createAuthMiddleware(auth);

  router.use(healthRoutes);
  router.use("/dashboard", createDashboardRoutes({ database, requireAuth }));
  router.use("/shops", createShopRoutes({ database, client, requireAuth }));
  router.use("/shops/:shopId/products", createProductRoutes({ database, requireAuth }));

  return router;
}
