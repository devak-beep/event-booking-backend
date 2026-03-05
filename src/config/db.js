const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error('MONGO_URI is missing');

let cached = global.__mongooseCache;
if (!cached) cached = global.__mongooseCache = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    console.log('[DB] Connecting to MongoDB...');
    cached.promise = mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 20000,
      maxPoolSize: 1,
      retryWrites: true,
      w: 'majority'
    }).then((conn) => {
      console.log('[DB] Connected successfully');
      return conn;
    }).catch((err) => {
      console.error('[DB] Connection failed:', err.message);
      cached.promise = null;
      throw err;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
