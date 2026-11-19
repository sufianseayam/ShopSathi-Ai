import { Router } from "express";
import { createDashboardController } from "../controllers/dashboard.controller.js";
import { requireShopOwner } from "../middleware/auth.js";

export function createDashboardRoutes({ database, requireAuth }) {
  const router = Router();
  const controller = createDashboardController(database);

  router.use(requireAuth, requireShopOwner);
  router.get("/summary", controller.summary);

  return router;
}
