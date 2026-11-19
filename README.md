# ShopSathi AI

ShopSathi AI is an AI-powered, multilingual customer support platform for e-commerce businesses. This repository starts with separate Next.js and Express applications. AI features, chatbot workflows, and dashboards are intentionally out of scope for this initialization.

## Requirements

- Node.js 20.9 or later
- npm
- MongoDB (local or hosted)

## Configure environment variables

From the project root:

```bash
cp client/.env.local.example client/.env.local
cp server/.env.example server/.env
```

Set `MONGODB_URI` in `server/.env` to a reachable MongoDB database. Replace `BETTER_AUTH_SECRET` with a unique secret of at least 32 characters. For example, generate one with `openssl rand -base64 32`.

The other example values use the local development URLs. Keep secrets in the ignored `.env` files; do not commit them.

`MONGODB_URI` must start with `mongodb://` or `mongodb+srv://`. If MongoDB credentials contain reserved URL characters, URL-encode them in the connection string.

## Install dependencies

Install client and server dependencies separately:

```bash
cd client && npm install
cd ../server && npm install
```

## Run the applications

Run each app in its own terminal from the project root.

Frontend:

```bash
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Backend:

```bash
cd server
npm run dev
```

The API listens at [http://localhost:5001](http://localhost:5001). Check `GET http://localhost:5001/api/health` for the health response.

The server connects to MongoDB before it starts listening. If the database is unavailable or the environment is incomplete, startup reports the error instead of serving a misleading healthy response.

### Local MongoDB on macOS

The Better Auth MongoDB adapter is configured with the MongoDB client to enable transactions. A standalone MongoDB server does not support transactions, so the local development database must run as a single-node replica set:

```bash
brew tap mongodb/brew
brew install mongodb-community@8.0
```

In `/opt/homebrew/etc/mongod.conf`, add:

```yaml
replication:
  replSetName: rs0
```

Then start or restart MongoDB and initialize the replica set once:

```bash
brew services restart mongodb-community@8.0
mongosh --eval 'rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "127.0.0.1:27017" }] })'
```

The local `MONGODB_URI` in `server/.env` must include `?replicaSet=rs0`.

## Authentication

Better Auth runs in the Express backend using the official MongoDB adapter and email/password authentication. The backend uses one native `MongoClient` connection for the adapter. Auth endpoints are mounted at `/api/auth/*` before JSON parsing, and the React client uses Better Auth's official methods and cookie-based sessions.

The client includes `/login` and `/signup` pages. New users can select either `Shop Owner` or `Customer`; customers are the users who place orders. The selected role is stored on the Better Auth user record, validated by the server, and sent to a role-specific placeholder (`/owner` or `/customer`) after signup and login. Role-specific product dashboards and APIs are not implemented yet. Google sign-in is not enabled yet and can be added later with server-side OAuth credentials. This separate Express backend is the authentication server; do not add a second Better Auth handler to Next.js.

Shop Owners can continue from `/owner` into the protected `/dashboard` shop and product management area. Shop CRUD is available under `/api/shops`; product CRUD is nested under `/api/shops/:shopId/products`. Both APIs require a Better Auth Shop Owner session and scope every operation to the session user.

For ImgBB image uploads, set `IMGBB_API_KEY` in `server/.env`. Product images are uploaded to ImgBB and associated with the owner and shop in the application. The ImgBB deletion URLs are stored privately in MongoDB and are not returned to the client. Upload requests accept up to five JPG, PNG, or WebP files, maximum 5 MB each.

Self-selected owner registration is enabled: anyone can choose Shop Owner during public signup. The role is immutable through Better Auth's user-update endpoint after account creation. Any future owner-only API or data access must also enforce the role on the server; a frontend route is not an authorization boundary.

Keep the backend `PORT` and `BETTER_AUTH_URL` on the same port, and set the frontend `NEXT_PUBLIC_API_URL` to that backend URL. The provided local defaults use port `5001` because port `5000` may be occupied by macOS services.

## Available scripts

In `client/`: `npm run dev`, `npm run build`, `npm run start`.

In `server/`: `npm run dev`, `npm start`.

## Project structure

```text
client/  Next.js App Router application
server/  Express API, MongoDB connection, and Better Auth configuration
```
