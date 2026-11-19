import { asyncHandler } from "../utils/async-handler.js";

export function createDashboardController(database) {
  return {
    summary: asyncHandler(async (request, response) => {
      const shops = await database.collection("shops")
        .find({ ownerId: request.authUser.id, deleting: { $ne: true } })
        .project({ name: 1 })
        .toArray();
      const shopIds = shops.map(({ _id }) => _id);
      const shopNames = new Map(shops.map(({ _id, name }) => [_id.toString(), name]));

      if (shopIds.length === 0) {
        return response.json({ totalShops: 0, totalProducts: 0, totalStock: 0, recentProducts: [] });
      }

      const products = database.collection("products");
      const [totals, recentProducts] = await Promise.all([
        products.aggregate([
          { $match: { shopId: { $in: shopIds } } },
          { $group: { _id: null, totalProducts: { $sum: 1 }, totalStock: { $sum: "$stockQuantity" } } },
        ]).next(),
        products.find({ shopId: { $in: shopIds } })
          .sort({ createdAt: -1 })
          .limit(5)
          .project({ name: 1, category: 1, price: 1, stockQuantity: 1, images: 1, shopId: 1 })
          .toArray(),
      ]);

      response.json({
        totalShops: shops.length,
        totalProducts: totals?.totalProducts || 0,
        totalStock: totals?.totalStock || 0,
        recentProducts: recentProducts.map((product) => ({
          ...product,
          shopName: shopNames.get(product.shopId.toString()) || "",
        })),
      });
    }),
  };
}
