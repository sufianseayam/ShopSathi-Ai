import { HttpError } from "../utils/http-error.js";
import { escapeRegex, parseObjectId } from "../utils/validation.js";
import { findOwnedShop } from "./shop.service.js";

const imageHost = /^https:\/\/(?:[a-z0-9-]+\.)*ibb\.co\//i;

async function validateImages(database, images, ownerId, shopId) {
  const prefix = `shopshathi/${ownerId}/shops/${shopId}/products/`;
  for (const image of images) {
    if (!imageHost.test(image.url) || !image.publicId.startsWith(prefix)) {
      throw new HttpError(400, "Product images must be uploaded for this shop.");
    }
  }
  const publicIds = [...new Set(images.map(({ publicId }) => publicId))];
  if (publicIds.length > 0) {
    const storedCount = await database.collection("image_deletions").countDocuments({
      _id: { $in: publicIds },
    });
    if (storedCount !== publicIds.length) {
      throw new HttpError(400, "Product images must be uploaded for this shop.");
    }
  }
}

function productFilter(query, shopId) {
  const filter = { shopId };
  const term = query.search?.trim();
  const category = query.category?.trim();

  if (term) {
    const pattern = new RegExp(escapeRegex(term), "i");
    filter.$or = [
      { name: pattern },
      { description: pattern },
      { category: pattern },
      { brand: pattern },
      { sku: pattern },
    ];
  }
  if (category) filter.category = category;

  if (query.stockStatus === "in_stock") filter.stockQuantity = { $gt: 5 };
  if (query.stockStatus === "low_stock") filter.stockQuantity = { $gt: 0, $lte: 5 };
  if (query.stockStatus === "out_of_stock") filter.stockQuantity = 0;

  return filter;
}

export async function listProducts(database, shop, query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 12);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new HttpError(400, "Page must be positive and limit must be between 1 and 100.");
  }

  const filter = productFilter(query, shop._id);
  const collection = database.collection("products");
  const [products, total, categories] = await Promise.all([
    collection.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
    collection.countDocuments(filter),
    collection.distinct("category", { shopId: shop._id }),
  ]);

  return {
    products,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    categories: categories.filter(Boolean).sort(),
  };
}

export async function findOwnedProduct(database, shop, productId) {
  const product = await database.collection("products").findOne({
    _id: parseObjectId(productId, "Product ID"),
    shopId: shop._id,
  });
  if (!product) {
    throw new HttpError(404, "Product not found.");
  }
  return product;
}

export async function createProduct(database, shopId, ownerId, values) {
  const shop = await findOwnedShop(database, shopId, ownerId);
  await validateImages(database, values.images, ownerId, shop._id.toString());
  const now = new Date();
  const product = {
    ...values,
    shopId: shop._id,
    availability: values.availability || (values.stockQuantity > 0 ? "available" : "unavailable"),
    createdAt: now,
    updatedAt: now,
  };
  const result = await database.collection("products").insertOne(product);

  const stillActive = await database.collection("shops").findOne({
    _id: shop._id,
    ownerId,
    deleting: { $ne: true },
  }, { projection: { _id: 1 } });
  if (!stillActive) {
    await database.collection("products").deleteOne({ _id: result.insertedId, shopId: shop._id });
    throw new HttpError(409, "Shop is being deleted. Please retry with an active shop.");
  }

  return { ...product, _id: result.insertedId };
}

export async function updateProduct(database, shop, product, ownerId, values) {
  if (values.images) await validateImages(database, values.images, ownerId, shop._id.toString());

  const result = await database.collection("products").findOneAndUpdate(
    { _id: product._id, shopId: shop._id },
    { $set: { ...values, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!result) {
    throw new HttpError(404, "Product not found.");
  }

  const stillActive = await database.collection("shops").findOne({
    _id: shop._id,
    ownerId,
    deleting: { $ne: true },
  }, { projection: { _id: 1 } });
  if (!stillActive) {
    await database.collection("products").deleteOne({ _id: product._id, shopId: shop._id });
    throw new HttpError(409, "Shop is being deleted. Please retry with an active shop.");
  }

  return result;
}

export function productShopId(shopId) {
  return parseObjectId(shopId, "Shop ID");
}
