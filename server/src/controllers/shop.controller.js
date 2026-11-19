import { z } from "zod";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";
import { parseOrThrow } from "../utils/validation.js";
import {
  createShop,
  deleteShop,
  findOwnedShop,
  getShop,
  listShops,
  updateShop,
} from "../services/shop.service.js";
import { deleteImages } from "../services/image.service.js";

const optionalText = (max) => z.string().trim().max(max).optional().default("");
const shopSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: optionalText(2000),
  logo: z.object({ url: z.string().url(), publicId: z.string().min(1) }).nullable().optional().default(null),
  category: z.string().trim().min(1).max(80),
  email: z.union([z.literal(""), z.string().email()]).optional().default(""),
  phone: optionalText(40),
  website: z.union([z.literal(""), z.string().url()]).optional().default(""),
  address: optionalText(500),
  facebookPage: z.union([z.literal(""), z.string().url()]).optional().default(""),
});
const shopPatchSchema = shopSchema.partial();

export function createShopController({ database, client }) {
  return {
    create: asyncHandler(async (request, response) => {
      const values = parseOrThrow(shopSchema, request.body);
      if (values.logo) {
        throw new HttpError(400, "Create the shop first, then upload its logo.");
      }
      const shop = await createShop(database, request.authUser.id, values);
      response.status(201).json({ shop });
    }),

    list: asyncHandler(async (request, response) => {
      const shops = await listShops(database, request.authUser.id);
      response.json({ shops });
    }),

    get: asyncHandler(async (request, response) => {
      const shop = await getShop(database, request.params.shopId, request.authUser.id);
      response.json({ shop });
    }),

    update: asyncHandler(async (request, response) => {
      const values = parseOrThrow(shopPatchSchema, request.body);
      if (Object.keys(values).length === 0) {
        return response.status(400).json({ error: "Provide at least one shop field to update." });
      }
      const current = await findOwnedShop(database, request.params.shopId, request.authUser.id);
      if (values.logo) {
        const prefix = `shopshathi/${request.authUser.id}/shops/${current._id}/logo/`;
        const uploadedLogo = values.logo.publicId.startsWith(prefix)
          ? await database.collection("image_deletions").findOne({ _id: values.logo.publicId })
          : null;
        if (
          !uploadedLogo
          || !/^https:\/\/(?:[a-z0-9-]+\.)*ibb\.co\//i.test(values.logo.url)
        ) {
          throw new HttpError(400, "Shop logo must be uploaded for this shop.");
        }
      }
      const shop = await updateShop(database, request.params.shopId, request.authUser.id, values);
      let warning;
      if (Object.hasOwn(values, "logo") && current.logo?.publicId && current.logo.publicId !== values.logo?.publicId) {
        const errors = await deleteImages(database, [current.logo]);
        if (errors.length) {
          warning = "Shop was updated, but the previous logo could not be deleted.";
          console.error("ImgBB logo cleanup failed:", errors);
        }
      }
      response.json({ shop, ...(warning ? { warning } : {}) });
    }),

    remove: asyncHandler(async (request, response) => {
      const current = await findOwnedShop(database, request.params.shopId, request.authUser.id);
      const products = await database.collection("products")
        .find({ shopId: current._id }, { projection: { images: 1 } })
        .toArray();
      await deleteShop(database, client, request.params.shopId, request.authUser.id);
      const errors = await deleteImages(database, [...products.flatMap(({ images = [] }) => images), current.logo]);
      let warning;
      if (errors.length) {
        warning = "Shop and products were deleted, but some ImgBB images could not be removed.";
        console.error("ImgBB image cleanup failed:", errors);
      }
      response.json({ deleted: true, ...(warning ? { warning } : {}) });
    }),
  };
}
