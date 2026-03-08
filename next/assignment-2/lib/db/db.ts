import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };
global.mongoose = cached;

export async function dbConnect(): Promise<typeof mongoose> {
  
  try {
      if (cached.conn) return cached.conn;

     if (!cached.promise) {
      console.log('Connecting to MongoDB...');
      cached.promise = mongoose
        .connect(process.env.MONGODB_URI as string, { bufferCommands: false })
        .then((m) => {
          console.log('✅ MongoDB connected');
          return m;
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        cached.promise = null; // reset so next request retries
        throw err;
      });
  }

      cached.conn = await cached.promise;
      console.log("mongodb connected");
      return cached.conn;
  } catch (error) {
      console.error("mongodb connection failed");
      throw new Error(" connection with db failed");
  }
}
