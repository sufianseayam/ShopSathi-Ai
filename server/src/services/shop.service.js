import { HttpError } from "../utils/http-error.js";
import { parseObjectId } from "../utils/validation.js";

function slugBase(name) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "shop";
}

async function createUniqueSlug(collection, name, excludeId) {
  const base = slugBase(name);
  let slug = base;
  let suffix = 2;

  while (await collection.findOne({
    slug,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  }, { projection: { _id: 1 } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function findOwnedShop(database, shopId, ownerId, { activeOnly = true } = {}) {
  const filter = {
    _id: parseObjectId(shopId, "Shop ID"),
    ownerId,
    ...(activeOnly ? { deleting: { $ne: true } } : {}),
  };
  const shop = await database.collection("shops").findOne(filter);

  if (!shop) {
    throw new HttpError(404, "Shop not found.");
  }

  return shop;
}

export async function createShop(database, ownerId, values) {
  const collection = database.collection("shops");
  const now = new Date();
  const shop = {
    ...values,
    slug: await createUniqueSlug(collection, values.name),
    ownerId,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(shop);
  return { ...shop, _id: result.insertedId };
}

export async function listShops(database, ownerId) {
  const shops = await database.collection("shops")
    .find({ ownerId, deleting: { $ne: true } })
    .sort({ createdAt: -1 })
    .toArray();
  const counts = await database.collection("products").aggregate([
    { $match: { shopId: { $in: shops.map(({ _id }) => _id) } } },
    { $group: { _id: "$shopId", count: { $sum: 1 } } },
  ]).toArray();
  const countByShop = new Map(counts.map(({ _id, count }) => [_id.toString(), count]));

  return shops.map((shop) => ({
    ...shop,
    productCount: countByShop.get(shop._id.toString()) || 0,
  }));
}

export async function getShop(database, shopId, ownerId) {
  const shop = await findOwnedShop(database, shopId, ownerId);
  const productCount = await database.collection("products").countDocuments({ shopId: shop._id });
  return { ...shop, productCount };
}

export async function updateShop(database, shopId, ownerId, values) {
  const shops = database.collection("shops");
  const id = parseObjectId(shopId, "Shop ID");
  const current = await findOwnedShop(database, shopId, ownerId);

  if (values.name && values.name !== current.name) {
    values.slug = await createUniqueSlug(shops, values.name, id);
  }

  const result = await shops.findOneAndUpdate(
    { _id: id, ownerId, deleting: { $ne: true } },
    { $set: { ...values, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!result) {
    throw new HttpError(404, "Shop not found.");
  }

  return result;
}

function isTransactionUnsupported(error) {
  return [20, 263].includes(error?.code) ||
    /transaction numbers are only allowed|does not support transactions|transactions are not supported/i.test(error?.message || "");
}

async function deleteShopWithoutTransaction(database, shop, ownerId) {
  const shops = database.collection("shops");
  const locked = await shops.updateOne(
    { _id: shop._id, ownerId, deleting: { $ne: true } },
    { $set: { deleting: true, updatedAt: new Date() } },
  );
  if (locked.matchedCount !== 1) {
    throw new HttpError(404, "Shop not found.");
  }

  await database.collection("products").deleteMany({ shopId: shop._id });
  await shops.deleteOne({ _id: shop._id, ownerId, deleting: true });
}

export async function deleteShop(database, client, shopId, ownerId) {
  const shop = await findOwnedShop(database, shopId, ownerId);
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      const result = await database.collection("shops").deleteOne(
        { _id: shop._id, ownerId },
        { session },
      );
      if (result.deletedCount !== 1) {
        throw new HttpError(404, "Shop not found.");
      }
      await database.collection("products").deleteMany({ shopId: shop._id }, { session });
    });
  } catch (error) {
    if (!isTransactionUnsupported(error)) {
      throw error;
    }
    await deleteShopWithoutTransaction(database, shop, ownerId);
  } finally {
    await session.endSession();
  }

  return shop;
}
