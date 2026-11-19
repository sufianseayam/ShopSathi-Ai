import { asyncHandler } from "../utils/async-handler.js";
import { findOwnedShop } from "../services/shop.service.js";
import { uploadImages } from "../services/image.service.js";
import { HttpError } from "../utils/http-error.js";

function uploadedFiles(request) {
  if (!request.files?.length) {
    throw new HttpError(400, "Select at least one image.");
  }
  return request.files;
}

export function createImageUploadController() {
  return {
    shopLogo: (database) => asyncHandler(async (request, response) => {
      const shop = await findOwnedShop(database, request.params.shopId, request.authUser.id);
      const [image] = await uploadImages(
        database,
        uploadedFiles(request),
        `shopshathi/${request.authUser.id}/shops/${shop._id}/logo`,
      );
      response.status(201).json({ image });
    }),

    productImages: (database) => asyncHandler(async (request, response) => {
      const shop = await findOwnedShop(database, request.params.shopId, request.authUser.id);
      const images = await uploadImages(
        database,
        uploadedFiles(request),
        `shopshathi/${request.authUser.id}/shops/${shop._id}/products`,
      );
      response.status(201).json({ images });
    }),
  };
}
