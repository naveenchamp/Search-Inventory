'use strict';

const mongoose = require('mongoose');
let connectionPromise;

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.warn('⚠️ MONGO_URI is not defined in .env! Skipping DB connection.');
      return null;
    }

    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    if (!connectionPromise) {
      connectionPromise = mongoose.connect(uri);
    }

    const conn = await connectionPromise;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    connectionPromise = null;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
