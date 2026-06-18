import "@testing-library/jest-dom/vitest";

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
});

afterEach(async () => {
  for (const collection of Object.values(mongoose.connection.collections)) {
    await collection.deleteMany({});
  }

  vi.restoreAllMocks();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();

  const globalForMongoose = globalThis as typeof globalThis & {
    mongooseConnection?: {
      conn: typeof mongoose | null;
      promise: Promise<typeof mongoose> | null;
    };
  };

  globalForMongoose.mongooseConnection = undefined;
});
