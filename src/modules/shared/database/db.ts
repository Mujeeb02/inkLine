import mongoose from "mongoose";

import { getEnv } from "@/modules/shared/utils/env";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseConnection?: MongooseCache;
};

const globalMongoose = globalForMongoose.mongooseConnection ?? {
  conn: null,
  promise: null,
};

export async function dbConnect() {
  if (globalMongoose.conn) {
    return globalMongoose.conn;
  }

  if (!globalMongoose.promise) {
    const { MONGODB_URI } = getEnv();
    globalMongoose.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  globalMongoose.conn = await globalMongoose.promise;
  globalForMongoose.mongooseConnection = globalMongoose;
  return globalMongoose.conn;
}
