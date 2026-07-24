import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Outing from '../models/Outing.js';

export const seedData = async () => {
  try {
    // Check if database already has the new students and they are properly linked
    const userCount = await User.countDocuments();
    const hasTharun = await Student.findOne({ Id: 'N220533' });
    // Also verify student users are linked (not null profile)
    const studentUsersLinked = await User.countDocuments({ role: 'student', studentProfile: { $ne: null } });
    
    if (userCount > 0 && hasTharun && studentUsersLinked > 0) {
      console.log('[Seeder] Database already seeded with Tharun, skipping seeding.');
      return;
    }

    console.log('[Seeder] Seeding database with user requested students and demo data...');

    // Clear existing records to start clean and drop index constraints
    try {
      await Student.collection.drop();
    } catch (err) {
      // Collection might not exist yet
    }
    await User.deleteMany({});
    await Outing.deleteMany({});

    // Create new students as specified by the user
    const studentsData = [
      {
        Id: 'N220533',
        Name: 'Moturu Tharun',
        Year: 'E3',
        Branch: 'CSE',
        Mail_Id: 'n220533@rguktn.ac.in',
        Photo: '',
        Hostel: 'I1',
        Room_No: 'SF-62',
        section: 'A',
        phone: '9876543210',
        parent_phone: '9876543211',
        status: 'Inside',
        remaining_outings: 2,
        used_outings: 1,
      },
      {
        Id: 'N220343',
        Name: 'Guntreddi Nagaraju',
        Year: 'E3',
        Branch: 'CSE',
        Mail_Id: 'n220343@rguktn.ac.in',
        Photo: '',
        Hostel: 'I1',
        Room_No: 'SF-51',
        section: 'B',
        phone: '9876543220',
        parent_phone: '9876543221',
        status: 'Inside',
        remaining_outings: 3,
        used_outings: 0,
      },
      {
        Id: 'N220396',
        Name: 'Potupureddi Bhargav',
        Year: 'E3',
        Branch: 'CSE',
        Mail_Id: 'n220396@rguktn.ac.in',
        Photo: '',
        Hostel: 'I1',
        Room_No: 'SF-61',
        section: 'C',
        phone: '9876543230',
        parent_phone: '9876543231',
        status: 'Outside',
        remaining_outings: 1,
        used_outings: 2,
      },
    ];

    const seededStudents = await Student.insertMany(studentsData);
    console.log(`[Seeder] Seeded ${seededStudents.length} students.`);

    // Helper map
    const studentMap = seededStudents.reduce((acc, current) => {
      acc[current.Id] = current;
      return acc;
    }, {});

    // Create system users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const caretakerPassword = await bcrypt.hash('caretaker123', salt);
    const securityPassword = await bcrypt.hash('security123', salt);
    const studentPassword = await bcrypt.hash('student123', salt);

    const usersData = [
      { username: 'admin', password: adminPassword, role: 'admin' },
      { username: 'caretaker1', password: caretakerPassword, role: 'caretaker' },
      { username: 'caretaker2', password: caretakerPassword, role: 'caretaker' },
      { username: 'security', password: securityPassword, role: 'security' },
      { username: 'n220533', password: studentPassword, role: 'student', studentProfile: studentMap['N220533']._id },
      { username: 'n220343', password: studentPassword, role: 'student', studentProfile: studentMap['N220343']._id },
      { username: 'n220396', password: studentPassword, role: 'student', studentProfile: studentMap['N220396']._id },
    ];

    const seededUsers = await User.insertMany(usersData);
    console.log(`[Seeder] Seeded ${seededUsers.length} system users.`);

    const caretakerUser = seededUsers.find((u) => u.username === 'caretaker1');
    const adminUser = seededUsers.find((u) => u.username === 'admin');

    // Create historic outings
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const outingsData = [
      // Bhargav N220396 - active outing (Exited)
      {
        outing_id: 'OUT-20260715-9988',
        student: studentMap['N220396']._id,
        purpose: 'Buy study books',
        destination: 'Main Market Book Centre',
        out_time: new Date(new Date().getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
        expected_return: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
        actual_exit_time: new Date(new Date().getTime() - 3.8 * 60 * 60 * 1000),
        status: 'Exited',
        approved_by: caretakerUser._id,
        approved_by_name: caretakerUser.username,
        createdAt: new Date(new Date().getTime() - 4 * 60 * 60 * 1000),
      },
      // Tharun N220533 - completed outing last week
      {
        outing_id: 'OUT-20260709-3321',
        student: studentMap['N220533']._id,
        purpose: 'Meeting parents',
        destination: 'Railway Station',
        out_time: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
        expected_return: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        actual_exit_time: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
        actual_return_time: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000 + 3.5 * 60 * 60 * 1000),
        status: 'Returned',
        approved_by: caretakerUser._id,
        approved_by_name: caretakerUser.username,
        createdAt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
      },
      // Bhargav N220396 - completed outing last week
      {
        outing_id: 'OUT-20260708-4491',
        student: studentMap['N220396']._id,
        purpose: 'Group study project',
        destination: 'Campus Library Annex',
        out_time: new Date(new Date().getTime() - 8 * 24 * 60 * 60 * 1000),
        expected_return: new Date(new Date().getTime() - 8 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        actual_exit_time: new Date(new Date().getTime() - 8 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
        actual_return_time: new Date(new Date().getTime() - 8 * 24 * 60 * 60 * 1000 + 2.8 * 60 * 60 * 1000),
        status: 'Returned',
        approved_by: caretakerUser._id,
        approved_by_name: caretakerUser.username,
        createdAt: new Date(new Date().getTime() - 8 * 24 * 60 * 60 * 1000),
      },
      // Historical outings for statistics (last month)
      {
        outing_id: 'OUT-20260610-8800',
        student: studentMap['N220533']._id,
        purpose: 'Personal shopping',
        destination: 'Central Mall',
        out_time: new Date(lastMonth.getTime() - 5 * 24 * 60 * 60 * 1000),
        expected_return: new Date(lastMonth.getTime() - 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        actual_exit_time: new Date(lastMonth.getTime() - 5 * 24 * 60 * 60 * 1000),
        actual_return_time: new Date(lastMonth.getTime() - 5 * 24 * 60 * 60 * 1000 + 3.8 * 60 * 60 * 1000),
        status: 'Returned',
        approved_by: adminUser._id,
        approved_by_name: adminUser.username,
        createdAt: new Date(lastMonth.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        outing_id: 'OUT-20260615-8811',
        student: studentMap['N220343']._id,
        purpose: 'Coaching classes',
        destination: 'Institute hub',
        out_time: new Date(lastMonth.getTime() - 2 * 24 * 60 * 60 * 1000),
        expected_return: new Date(lastMonth.getTime() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        actual_exit_time: new Date(lastMonth.getTime() - 2 * 24 * 60 * 60 * 1000),
        actual_return_time: new Date(lastMonth.getTime() - 2 * 24 * 60 * 60 * 1000 + 1.9 * 60 * 60 * 1000),
        status: 'Returned',
        approved_by: caretakerUser._id,
        approved_by_name: caretakerUser.username,
        createdAt: new Date(lastMonth.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    await Outing.insertMany(outingsData);
    console.log('[Seeder] Seeded outings records.');

    console.log('[Seeder] Database seeding completed successfully.');
  } catch (error) {
    console.error(`[Seeder] Error seeding database: ${error.message}`);
  }
};
