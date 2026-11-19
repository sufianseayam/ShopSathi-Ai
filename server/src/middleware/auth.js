import { fromNodeHeaders } from "better-auth/node";
import { HttpError } from "../utils/http-error.js";

export function createAuthMiddleware(auth) {
  return async function requireAuth(request, response, next) {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session?.user?.id) {
        return next(new HttpError(401, "Authentication is required."));
      }

      request.authUser = session.user;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

export function requireShopOwner(request, response, next) {
  if (request.authUser?.role !== "shop_owner") {
    return next(new HttpError(403, "Shop Owner access is required."));
  }

  return next();
}
