import "dotenv/config";

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const port = Number(process.env.PORT || 5001);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

const betterAuthSecret = required("BETTER_AUTH_SECRET");
if (betterAuthSecret.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must be at least 32 characters long.");
}

const mongodbUri = required("MONGODB_URI");
if (!mongodbUri.startsWith("mongodb://") && !mongodbUri.startsWith("mongodb+srv://")) {
  throw new Error("MONGODB_URI must start with mongodb:// or mongodb+srv://.");
}

const betterAuthUrl = required("BETTER_AUTH_URL");
let authUrl;
try {
  authUrl = new URL(betterAuthUrl);
} catch {
  throw new Error("BETTER_AUTH_URL must be a valid absolute URL.");
}

const authPort = Number(authUrl.port || (authUrl.protocol === "https:" ? 443 : 80));
if (authPort !== port) {
  throw new Error(`BETTER_AUTH_URL port (${authPort}) must match PORT (${port}).`);
}

export const env = {
  port,
  mongodbUri,
  betterAuthSecret,
  betterAuthUrl,
  clientUrl: required("CLIENT_URL"),
  imgbbApiKey: process.env.IMGBB_API_KEY?.trim() || "",
};
