import { z } from "zod";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";
import { parseOrThrow } from "../utils/validation.js";
import { findOwnedShop } from "../services/shop.service.js";
import {
  createProduct,
  findOwnedProduct,
  listProducts,
  updateProduct,
} from "../services/product.service.js";
import { deleteImages } from "../services/image.service.js";

const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1).max(255),
});
const variantSchema = z.object({
  name: z.string().trim().min(1).max(80),
  options: z.array(z.string().trim().min(1).max(80)).max(50).default([]),
});
const productSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(5000).optional().default(""),
  images: z.array(imageSchema).max(5).default([]),
  category: z.string().trim().min(1).max(100),
  brand: z.string().trim().max(100).optional().default(""),
  price: z.number().finite().nonnegative(),
  discountPrice: z.number().finite().nonnegative().nullable().optional().default(null),
  sku: z.string().trim().max(100).optional().default(""),
  stockQuantity: z.number().int().nonnegative(),
  variants: z.array(variantSchema).max(30).default([]),
  availability: z.enum(["available", "unavailable", "preorder"]).optional(),
}).superRefine((value, context) => {
  if (value.discountPrice !== null && value.discountPrice > value.price) {
    context.addIssue({
      code: "custom",
      path: ["discountPrice"],
      message: "Discount price cannot exceed the regular price.",
    });
  }
});
const productPatchSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(5000).optional(),
  images: z.array(imageSchema).max(5).optional(),
  category: z.string().trim().min(1).max(100).optional(),
  brand: z.string().trim().max(100).optional(),
  price: z.number().finite().nonnegative().optional(),
  discountPrice: z.number().finite().nonnegative().nullable().optional(),
  sku: z.string().trim().max(100).optional(),
  stockQuantity: z.number().int().nonnegative().optional(),
  variants: z.array(variantSchema).max(30).optional(),
  availability: z.enum(["available", "unavailable", "preorder"]).optional(),
}).superRefine((value, context) => {
  if (value.discountPrice !== null && value.discountPrice !== undefined && value.price !== undefined && value.discountPrice > value.price) {
    context.addIssue({
      code: "custom",
      path: ["discountPrice"],
      message: "Discount price cannot exceed the regular price.",
    });
  }
});
const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  stockStatus: z.enum(["in_stock", "low_stock", "out_of_stock"]).optional(),
});

export function createProductController({ database }) {
  async function getShop(request) {
    return findOwnedShop(database, request.params.shopId, request.authUser.id);
  }

  return {
    create: asyncHandler(async (request, response) => {
      const values = parseOrThrow(productSchema, request.body);
      const product = await createProduct(
        database,
        request.params.shopId,
        request.authUser.id,
        values,
      );
      response.status(201).json({ product });
    }),

    list: asyncHandler(async (request, response) => {
      const query = parseOrThrow(querySchema, request.query);
      const shop = await getShop(request);
      response.json(await listProducts(database, shop, query));
    }),

    get: asyncHandler(async (request, response) => {
      const shop = await getShop(request);
      const product = await findOwnedProduct(database, shop, request.params.productId);
      response.json({ product });
    }),

    update: asyncHandler(async (request, response) => {
      const values = parseOrThrow(productPatchSchema, request.body);
      if (Object.keys(values).length === 0) {
        throw new HttpError(400, "Provide at least one product field to update.");
      }

      const shop = await getShop(request);
      const current = await findOwnedProduct(database, shop, request.params.productId);
      if (values.stockQuantity !== undefined && values.availability === undefined) {
        values.availability = values.stockQuantity > 0 ? "available" : "unavailable";
      }
      const product = await updateProduct(database, shop, current, request.authUser.id, values);
      let cleanupWarning;

      if (values.images) {
        const retained = new Set(values.images.map(({ publicId }) => publicId));
        const removed = current.images.filter(({ publicId }) => !retained.has(publicId));
        const errors = await deleteImages(database, removed);
        if (errors.length) {
          cleanupWarning = "Product was updated, but some replaced images could not be deleted.";
          console.error("ImgBB image cleanup failed:", errors);
        }
      }

      response.json({ product, ...(cleanupWarning ? { warning: cleanupWarning } : {}) });
    }),

    remove: asyncHandler(async (request, response) => {
      const shop = await getShop(request);
      const product = await findOwnedProduct(database, shop, request.params.productId);
      await database.collection("products").deleteOne({ _id: product._id, shopId: shop._id });
      const errors = await deleteImages(database, product.images);
      let warning;
      if (errors.length) {
        warning = "Product was deleted, but some ImgBB images could not be removed.";
        console.error("ImgBB image cleanup failed:", errors);
      }
      response.json({ deleted: true, ...(warning ? { warning } : {}) });
    }),
  };
}
