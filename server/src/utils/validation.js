import { ObjectId } from "mongodb";
import { HttpError } from "./http-error.js";

export function parseObjectId(value, label) {
  if (typeof value !== "string" || !ObjectId.isValid(value)) {
    throw new HttpError(400, `${label} must be a valid ID.`);
  }

  return new ObjectId(value);
}

export function parseOrThrow(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}

export function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
