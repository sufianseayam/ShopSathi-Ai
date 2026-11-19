import { createApp } from "./app.js";
import { createAuth } from "./config/auth.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { ensureIndexes } from "./services/database.service.js";

async function startServer() {
  const { client, database } = await connectDatabase(env.mongodbUri);
  await ensureIndexes(database);
  const auth = createAuth(database, client);
  const app = createApp(auth, database, client);

  app.listen(env.port, () => {
    console.log(`ShopSathi AI API listening on http://localhost:${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start ShopSathi AI API:", error);
  process.exitCode = 1;
});
