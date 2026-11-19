import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

const imageDeletionCollection = "image_deletions";

export function requireImageStorage() {
  if (!env.imgbbApiKey) {
    throw new HttpError(503, "Image uploads are not configured. Set IMGBB_API_KEY on the server.");
  }
}

function isImgBbUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "ibb.co" || url.hostname.endsWith(".ibb.co"));
  } catch {
    return false;
  }
}

async function uploadImage(file, folder) {
  const form = new FormData();
  form.append("key", env.imgbbApiKey);
  form.append("image", file.buffer.toString("base64"));
  let response;
  try {
    response = await fetch("https://api.imgbb.com/1/upload", { method: "POST", body: form });
  } catch {
    throw new HttpError(502, "Could not reach ImgBB image storage.");
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new HttpError(502, "ImgBB returned an invalid upload response.");
  }

  const data = result?.data;
  if (
    !response.ok
    || typeof data?.id !== "string"
    || !/^[A-Za-z0-9_-]+$/.test(data.id)
    || !isImgBbUrl(data.url)
    || !isImgBbUrl(data.delete_url)
  ) {
    throw new HttpError(502, "ImgBB image upload failed or returned incomplete image details.");
  }

  return {
    url: data.url,
    publicId: `${folder}/${data.id}`,
    deleteUrl: data.delete_url,
  };
}

async function deleteFromImgBb(deleteUrl) {
  let response;
  try {
    response = await fetch(deleteUrl);
  } catch {
    throw new HttpError(502, "Could not reach ImgBB to delete an image.");
  }
  if (!response.ok) {
    throw new HttpError(502, "ImgBB could not delete the image.");
  }
}

export async function uploadImages(database, files, folder) {
  requireImageStorage();
  const uploaded = [];
  try {
    for (const file of files) {
      const image = await uploadImage(file, folder);
      uploaded.push(image);
      await database.collection(imageDeletionCollection).insertOne({
        _id: image.publicId,
        deleteUrl: image.deleteUrl,
        createdAt: new Date(),
      });
    }
    return uploaded.map(({ url, publicId }) => ({ url, publicId }));
  } catch (error) {
    const cleanupResults = await Promise.allSettled(uploaded.map(async ({ publicId, deleteUrl }) => {
      await deleteFromImgBb(deleteUrl);
      await database.collection(imageDeletionCollection).deleteOne({ _id: publicId });
    }));
    const cleanupErrors = cleanupResults.flatMap((result, index) =>
      result.status === "rejected"
        ? [{ publicId: uploaded[index].publicId, message: result.reason.message }]
        : [],
    );
    if (cleanupErrors.length) {
      console.error("ImgBB upload rollback cleanup failed:", cleanupErrors);
    }
    throw error;
  }
}

export async function deleteImage(database, publicId) {
  requireImageStorage();
  const deletion = await database.collection(imageDeletionCollection).findOne({ _id: publicId });
  if (!deletion) {
    throw new HttpError(502, "Image deletion details are unavailable.");
  }
  await deleteFromImgBb(deletion.deleteUrl);
  await database.collection(imageDeletionCollection).deleteOne({ _id: publicId });
}

export async function deleteImages(database, images) {
  const publicIds = [...new Set(images.map((image) => image?.publicId).filter(Boolean))];
  if (publicIds.length === 0) return [];

  const results = await Promise.allSettled(publicIds.map((publicId) => deleteImage(database, publicId)));
  return results.flatMap((result, index) =>
    result.status === "rejected" ? [{ publicId: publicIds[index], message: result.reason.message }] : [],
  );
}
