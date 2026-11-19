export async function ensureIndexes(database) {
  await Promise.all([
    database.collection("shops").createIndex({ slug: 1 }, { unique: true }),
    database.collection("shops").createIndex({ ownerId: 1, createdAt: -1 }),
    database.collection("products").createIndex({ shopId: 1, createdAt: -1 }),
    database.collection("products").createIndex({ shopId: 1, category: 1 }),
    database.collection("products").createIndex(
      { shopId: 1, sku: 1 },
      { unique: true, partialFilterExpression: { sku: { $type: "string" } } },
    ),
  ]);
}
