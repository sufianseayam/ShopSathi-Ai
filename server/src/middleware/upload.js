import multer from "multer";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export function createUploadMiddleware(maxCount = 5) {
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      files: maxCount,
      fileSize: 5 * 1024 * 1024,
      fields: 0,
    },
    fileFilter(request, file, callback) {
      if (!allowedTypes.has(file.mimetype)) {
        const error = new Error("Images must be JPG, PNG, or WebP files.");
        error.statusCode = 400;
        return callback(error);
      }
      return callback(null, true);
    },
  }).array("images", maxCount);
}
