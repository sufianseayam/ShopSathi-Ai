import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { z } from "zod";
import { env } from "./env.js";

export function createAuth(database, client) {
  return betterAuth({
    baseURL: env.betterAuthUrl,
    secret: env.betterAuthSecret,
    database: mongodbAdapter(database, { client }),
    trustedOrigins: [env.clientUrl],
    emailAndPassword: {
      enabled: true,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: true,
          defaultValue: "customer",
          validator: {
            input: z.enum(["shop_owner", "customer"]),
          },
        },
      },
    },
    databaseHooks: {
      user: {
        update: {
          before: async (user) => {
            if (Object.hasOwn(user, "role")) {
              return false;
            }
          },
        },
      },
    },
  });
}
