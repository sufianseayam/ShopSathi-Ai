export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    return next(error);
  }

  if (error?.name === "ZodError") {
    return response.status(400).json({
      error: "Invalid request",
      details: error.issues.map(({ path, message }) => ({
        field: path.join("."),
        message,
      })),
    });
  }

  if (error?.name === "MulterError") {
    return response.status(400).json({ error: error.message });
  }

  if (error?.code === 11000) {
    return response.status(409).json({ error: "A record with that value already exists." });
  }

  if (Number.isInteger(error?.statusCode) && error.statusCode >= 400 && error.statusCode < 600) {
    return response.status(error.statusCode).json({
      error: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
  }

  console.error("Unhandled API error:", error);
  return response.status(500).json({ error: "Internal server error" });
}
