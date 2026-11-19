import { Router } from "express";
import { createProductController } from "../controllers/product.controller.js";
import { createImageUploadController } from "../controllers/upload.controller.js";
import { requireShopOwner } from "../middleware/auth.js";
import { createUploadMiddleware } from "../middleware/upload.js";

export function createProductRoutes({ database, requireAuth }) {
  const router = Router();
  const controller = createProductController({ database });
  const upload = createImageUploadController();

  router.use(requireAuth, requireShopOwner);
  router.post("/images", createUploadMiddleware(5), upload.productImages(database));
  router.post("/", controller.create);
  router.get("/", controller.list);
  router.get("/:productId", controller.get);
  router.patch("/:productId", controller.update);
  router.delete("/:productId", controller.remove);

  return router;
}
