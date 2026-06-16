import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const cached = global.mongooseConnection ?? {
  conn: null,
  promise: null
};

global.mongooseConnection = cached;

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }

  cached.promise ??= mongoose.connect(MONGODB_URI, {
    bufferCommands: false
  });

  cached.conn = await cached.promise;
  return cached.conn;
}
