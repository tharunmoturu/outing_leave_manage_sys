import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Force Node.js to use Google DNS (8.8.8.8) to resolve MongoDB Atlas SRV records
// This fixes ECONNREFUSED errors caused by local network DNS not supporting SRV lookups
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (error) {
  console.warn('[Database] Failed to set custom DNS servers:', error.message);
}

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/outing_leave_system';
  
  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`\x1b[32m[Database] MongoDB Connected: ${conn.connection.host}\x1b[0m`);
    return true;
  } catch (error) {
    console.error(`\x1b[31m[Database] Error: ${error.message}\x1b[0m`);
    console.log('\x1b[33m[Database] Make sure MongoDB is running or configure MONGODB_URI in your .env file.\x1b[0m');
    return false;
  }
};

export default connectDB;
