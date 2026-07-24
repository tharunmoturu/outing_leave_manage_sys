import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const runMigration = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // 1. Rename fullName to name for ALL users if they have fullName
    const renameResult = await mongoose.connection.collection('users').updateMany(
      { fullName: { $exists: true } },
      { $rename: { "fullName": "name" } }
    );
    console.log(`[Migration] Renamed 'fullName' to 'name' for ${renameResult.modifiedCount} users.`);

    // 2. Initialize student-specific fields and remove legacy studentProfile
    const studentUpdateResult = await mongoose.connection.collection('users').updateMany(
      { role: { $in: ['student', 'Student'] } },
      { 
        $unset: { studentProfile: "", username: "", password: "" },
        $set: { 
          remaining_outings: 3, 
          used_outings: 0, 
          status: 'Inside',
          profileCompleted: false
        } 
      }
    );
    console.log(`[Migration] Initialized metrics and removed legacy fields for ${studentUpdateResult.modifiedCount} students.`);
    
    // 3. Ensure isActive defaults to true for everyone
    const activeResult = await mongoose.connection.collection('users').updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    console.log(`[Migration] Set isActive: true for ${activeResult.modifiedCount} users.`);

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
