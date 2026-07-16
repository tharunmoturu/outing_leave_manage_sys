import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Outing from '../models/Outing.js';
import Leave from '../models/Leave.js';

export const seedData = async () => {
  try {
    // Check if database is empty
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('[Seeder] Database already populated, skipping seeding.');
      return;
    }

    console.log('[Seeder] Database is empty. Seeding initial demo data...');

    // Clear any dangling documents
    await Student.deleteMany({});
    await Outing.deleteMany({});
    await Leave.deleteMany({});

    // Create students
    const studentsData = [
      {
        student_id: 'S101',
        name: 'Rahul Sharma',
        year: '3rd',
        branch: 'CSE',
        section: 'A',
        room: '102',
        phone: '9876543210',
        parent_phone: '9876543211',
        email: 'rahul.sharma@example.com',
        hostel: 'Ramanujan Hall',
        status: 'Inside',
        remaining_outings: 2,
        used_outings: 1,
      },
      {
        student_id: 'S102',
        name: 'Aishwarya Rao',
        year: '4th',
        branch: 'ECE',
        section: 'B',
        room: '304',
        phone: '9876543220',
        parent_phone: '9876543221',
        email: 'aishwarya.rao@example.com',
        hostel: 'Kalpana Chawla Hall',
        status: 'Inside',
        remaining_outings: 3,
        used_outings: 0,
      },
      {
        student_id: 'S103',
        name: 'Vikram Singh',
        year: '2nd',
        branch: 'ME',
        section: 'A',
        room: '110',
        phone: '9876543230',
        parent_phone: '9876543231',
        email: 'vikram.singh@example.com',
        hostel: 'Ramanujan Hall',
        status: 'Outside',
        remaining_outings: 1,
        used_outings: 2,
      },
      {
        student_id: 'S104',
        name: 'Sneha Patel',
        year: '1st',
        branch: 'CSE',
        section: 'C',
        room: '108',
        phone: '9876543240',
        parent_phone: '9876543241',
        email: 'sneha.patel@example.com',
        hostel: 'Kalpana Chawla Hall',
        status: 'Leave',
        remaining_outings: 3,
        used_outings: 0,
      },
      {
        student_id: 'S105',
        name: 'Amit Verma',
        year: '3rd',
        branch: 'CE',
        section: 'A',
        room: '215',
        phone: '9876543250',
        parent_phone: '9876543251',
        email: 'amit.verma@example.com',
        hostel: 'Ramanujan Hall',
        status: 'Inside',
        remaining_outings: 2,
        used_outings: 1,
      },
    ];

    const seededStudents = await Student.insertMany(studentsData);
    console.log(`[Seeder] Seeded ${seededStudents.length} students.`);

    // Helper map
    const studentMap = seededStudents.reduce((acc, current) => {
      acc[current.student_id] = current;
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
      { username: 's101', password: studentPassword, role: 'student', studentProfile: studentMap['S101']._id },
      { username: 's102', password: studentPassword, role: 'student', studentProfile: studentMap['S102']._id },
      { username: 's103', password: studentPassword, role: 'student', studentProfile: studentMap['S103']._id },
      { username: 's104', password: studentPassword, role: 'student', studentProfile: studentMap['S104']._id },
      { username: 's105', password: studentPassword, role: 'student', studentProfile: studentMap['S105']._id },
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
      // Vikram S103 - active outing (Exited)
      {
        outing_id: 'OUT-20260715-9988',
        student: studentMap['S103']._id,
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
      // Amit S105 - active outing (Approved but not exited yet)
      {
        outing_id: 'OUT-20260716-1234',
        student: studentMap['S105']._id,
        purpose: 'Dental consultation',
        destination: 'Dental Clinic, Sector 5',
        out_time: new Date(new Date().getTime() + 1 * 60 * 60 * 1000), // 1 hour from now
        expected_return: new Date(new Date().getTime() + 4 * 60 * 60 * 1000),
        status: 'Approved',
        approved_by: caretakerUser._id,
        approved_by_name: caretakerUser.username,
      },
      // Rahul S101 - completed outing last week
      {
        outing_id: 'OUT-20260709-3321',
        student: studentMap['S101']._id,
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
      // Vikram S103 - completed outing last week
      {
        outing_id: 'OUT-20260708-4491',
        student: studentMap['S103']._id,
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
        student: studentMap['S101']._id,
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
        student: studentMap['S102']._id,
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
      // Two months ago
      {
        outing_id: 'OUT-20260515-5511',
        student: studentMap['S103']._id,
        purpose: 'Buy medicine',
        destination: 'Local Pharmacy',
        out_time: new Date(twoMonthsAgo.getTime()),
        expected_return: new Date(twoMonthsAgo.getTime() + 1 * 60 * 60 * 1000),
        actual_exit_time: new Date(twoMonthsAgo.getTime()),
        actual_return_time: new Date(twoMonthsAgo.getTime() + 45 * 60 * 1000),
        status: 'Returned',
        approved_by: caretakerUser._id,
        approved_by_name: caretakerUser.username,
        createdAt: twoMonthsAgo,
      },
    ];

    await Outing.insertMany(outingsData);
    console.log('[Seeder] Seeded outings records.');

    // Create leaves records
    const leavesData = [
      // Sneha S104 - active leave (Approved & started)
      {
        leave_id: 'LV-20260716-4432',
        student: studentMap['S104']._id,
        reason: 'Sisters wedding ceremony',
        start_date: new Date(),
        end_date: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days
        applied_date: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000), // applied 2 days ago
        status: 'Approved',
        approved_by: caretakerUser._id,
        approved_by_name: caretakerUser.username,
        remarks: 'Approved after verification with parents.',
      },
      // Rahul S101 - pending leave request
      {
        leave_id: 'LV-20260716-9900',
        student: studentMap['S101']._id,
        reason: 'Severe fever, visiting hometown doctor',
        start_date: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000), // starts tomorrow
        end_date: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
        applied_date: new Date(),
        status: 'Pending',
      },
      // Aishwarya S102 - completed historical leave
      {
        leave_id: 'LV-20260601-3311',
        student: studentMap['S102']._id,
        reason: 'Summer vacation early leave permission',
        start_date: new Date(lastMonth.getTime() - 15 * 24 * 60 * 60 * 1000),
        end_date: new Date(lastMonth.getTime() - 10 * 24 * 60 * 60 * 1000),
        applied_date: new Date(lastMonth.getTime() - 18 * 24 * 60 * 60 * 1000),
        status: 'Approved',
        approved_by: adminUser._id,
        approved_by_name: adminUser.username,
        remarks: 'Allowed for academic vacation.',
      },
    ];

    await Leave.insertMany(leavesData);
    console.log('[Seeder] Seeded leaves records.');
    console.log('[Seeder] Database seeding completed successfully.');
  } catch (error) {
    console.error(`[Seeder] Error seeding database: ${error.message}`);
  }
};
