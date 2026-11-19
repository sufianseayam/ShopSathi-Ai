import { Router } from "express";
import { createShopController } from "../controllers/shop.controller.js";
import { requireShopOwner } from "../middleware/auth.js";
import { createImageUploadController } from "../controllers/upload.controller.js";
import { createUploadMiddleware } from "../middleware/upload.js";

export function createShopRoutes({ database, client, requireAuth }) {
  const router = Router();
  const controller = createShopController({ database, client });
  const upload = createImageUploadController();

  router.use(requireAuth, requireShopOwner);
  router.post("/", controller.create);
  router.get("/", controller.list);
  router.get("/:shopId", controller.get);
  router.patch("/:shopId", controller.update);
  router.delete("/:shopId", controller.remove);
  router.post("/:shopId/logo", createUploadMiddleware(1), upload.shopLogo(database));

  return router;
}
