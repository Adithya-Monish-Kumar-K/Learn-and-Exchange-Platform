import mongoose from 'mongoose';

let db: mongoose.Connection;

export const connectToDb = async () => {
  const uri = process.env.MONGODB_URI;
  try {
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    const conn = await mongoose.connect(uri);
    db = conn.connection;
    console.log(`Connected to ${db.host}`);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
};

export const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};
