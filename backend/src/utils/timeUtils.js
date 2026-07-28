import Outing from '../models/Outing.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * Helper to convert time strings (e.g. "19:00", "07:30") to 12-hour AM/PM format
 */
export const formatTo12Hour = (timeStr) => {
  if (!timeStr || timeStr === 'N/A') return 'N/A';
  if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
    return timeStr;
  }
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1].padStart(2, '0');
    if (isNaN(hours)) return timeStr;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = hours < 10 ? `0${hours}` : `${hours}`;
    return `${strHours}:${minutes} ${ampm}`;
  }
  return timeStr;
};

/**
 * Parses a time string (e.g. "12:30 PM") and returns { hours, minutes }
 */
export const parseTime = (timeStr) => {
  let hours = 0;
  let minutes = 0;
  if (!timeStr) return { hours, minutes };

  const [timePart, modifier] = timeStr.trim().split(/\s+/);
  if (timePart) {
    const parts = timePart.split(':');
    hours = parseInt(parts[0] || '0', 10);
    minutes = parseInt(parts[1] || '0', 10);
    if (modifier && modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (modifier && modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
  }
  return { hours, minutes };
};

/**
 * Checks if a student is currently outside based on their approved outing.
 * An outing is "outside" if:
 * 1. Status is Approved or Exited
 * 2. Current Time >= Leaving DateTime
 * 3. Current Time < Reporting DateTime
 * @param {Object} outing The outing object
 * @param {Date} now The current date to compare against (defaults to new Date())
 * @returns {boolean} true if student is currently outside
 */
export const isStudentOutside = (outing, now = new Date()) => {
  if (!outing || !['Approved', 'Exited'].includes(outing.status)) return false;
  if (!outing.submitted_date || !outing.leaving_time || !outing.reporting_time) return false;

  try {
    // Parse date string manually to avoid UTC-midnight timezone offset issues
    const dateParts = outing.submitted_date.split('-');
    const baseDate = new Date(
      parseInt(dateParts[0], 10),
      parseInt(dateParts[1], 10) - 1,
      parseInt(dateParts[2], 10)
    );

    const leavingDate = new Date(baseDate);
    const { hours: lHours, minutes: lMinutes } = parseTime(outing.leaving_time);
    leavingDate.setHours(lHours, lMinutes, 0, 0);

    const reportingDate = new Date(baseDate);
    const { hours: rHours, minutes: rMinutes } = parseTime(outing.reporting_time);
    reportingDate.setHours(rHours, rMinutes, 0, 0);

    // Some outings might span overnight, so if reporting time is before leaving time,
    // add 1 day to the reporting date. (Although the rules typically require same day returns, this makes it robust)
    if (reportingDate < leavingDate) {
      reportingDate.setDate(reportingDate.getDate() + 1);
    }

    return now >= leavingDate && now < reportingDate;
  } catch (error) {
    console.error('Error calculating student outside status:', error);
    return false;
  }
};

/**
 * Checks if a student is overdue (Current Time > Reporting Time)
 * but still marked as Approved/Exited.
 */
export const isStudentOverdue = (outing, now = new Date()) => {
  if (!outing || !['Approved', 'Exited'].includes(outing.status)) return false;
  if (!outing.submitted_date || !outing.reporting_time) return false;

  try {
    // Parse date string manually to avoid UTC-midnight timezone offset issues
    // e.g. "2026-07-27" via new Date() gives UTC midnight, but setHours() applies local time
    const dateParts = outing.submitted_date.split('-');
    const reportingDate = new Date(
      parseInt(dateParts[0], 10),
      parseInt(dateParts[1], 10) - 1,
      parseInt(dateParts[2], 10)
    );
    const { hours: rHours, minutes: rMinutes } = parseTime(outing.reporting_time);
    reportingDate.setHours(rHours, rMinutes, 0, 0);

    return now > reportingDate;
  } catch (error) {
    console.error('Error calculating student overdue status:', error);
    return false;
  }
};

/**
 * Checks if a student's outing is completed (Current Time >= Reporting Time)
 * and they were Approved/Exited.
 * Note: If they are overdue, they are technically "completed" in terms of history logic.
 */
export const isOutingCompleted = (outing, now = new Date()) => {
  if (!outing || !['Approved', 'Exited', 'Returned'].includes(outing.status)) return false;
  
  if (outing.status === 'Returned') return true;

  if (!outing.submitted_date || !outing.reporting_time) return false;

  try {
    // Parse date string manually to avoid UTC-midnight timezone offset issues
    const dateParts = outing.submitted_date.split('-');
    const reportingDate = new Date(
      parseInt(dateParts[0], 10),
      parseInt(dateParts[1], 10) - 1,
      parseInt(dateParts[2], 10)
    );
    const { hours: rHours, minutes: rMinutes } = parseTime(outing.reporting_time);
    reportingDate.setHours(rHours, rMinutes, 0, 0);

    return now >= reportingDate;
  } catch (error) {
    console.error('Error calculating outing completed status:', error);
    return false;
  }
};

const SystemConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
});
const SystemConfig = mongoose.models.SystemConfig || mongoose.model('SystemConfig', SystemConfigSchema);

/**
 * Checks if a new month has started and resets student outing counts to 3.
 */
export const checkAndResetMonthlyOutings = async () => {
  try {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let lastResetDoc = await SystemConfig.findOne({ key: 'last_monthly_reset_month' });

    if (!lastResetDoc) {
      lastResetDoc = new SystemConfig({ key: 'last_monthly_reset_month', value: currentMonthStr });
      await lastResetDoc.save();
      
      const updateResult = await User.updateMany(
        { role: { $in: ['Student', 'student'] } },
        { remaining_outings: 3, used_outings: 0 }
      );
      console.log(`[Monthly Reset] Initialized monthly outing counts to 3 for all active students.`);
      return;
    }

    if (lastResetDoc.value !== currentMonthStr) {
      const updateResult = await User.updateMany(
        { role: { $in: ['Student', 'student'] } },
        { remaining_outings: 3, used_outings: 0 }
      );

      lastResetDoc.value = currentMonthStr;
      await lastResetDoc.save();

      console.log(`[Monthly Reset] New month detected (${currentMonthStr}). Reset student outing counts to 3.`);
    }
  } catch (error) {
    console.error('Error during monthly outings reset check:', error);
  }
};

/**
 * Automatically completes outings that are past their expected reporting time.
 */
export const autoCompleteExpiredOutings = async () => {
  try {
    // Check and trigger monthly reset if it's a new month
    await checkAndResetMonthlyOutings();

    const now = new Date();
    const activeOutings = await Outing.find({ status: { $in: ['Approved', 'Exited'] } }).populate('student');
    
    let updatedCount = 0;
    for (const outing of activeOutings) {
      if (isStudentOverdue(outing, now)) {
        outing.status = 'Returned';
        
        // Calculate expected return time to set as actual return time
        if (outing.submitted_date && outing.reporting_time) {
          // Parse date string manually to avoid UTC-midnight timezone offset issues
          const dateParts = outing.submitted_date.split('-');
          const reportingDate = new Date(
            parseInt(dateParts[0], 10),
            parseInt(dateParts[1], 10) - 1,
            parseInt(dateParts[2], 10)
          );
          const { hours, minutes } = parseTime(outing.reporting_time);
          reportingDate.setHours(hours, minutes, 0, 0);
          outing.actual_return_time = reportingDate;
          outing.actual_exit_time = outing.actual_exit_time || now; // Backfill if empty
        } else {
          outing.actual_return_time = now;
        }
        
        await outing.save();

        // *** FIX: Update the student's status back to 'Inside' ***
        if (outing.student) {
          await User.findByIdAndUpdate(outing.student._id || outing.student, { status: 'Inside' });
        }

        updatedCount++;
      }
    }
    if (updatedCount > 0) {
      console.log(`[Auto-Complete] Completed ${updatedCount} expired outings and set students back to Inside.`);
    }
  } catch (error) {
    console.error('Error auto-completing expired outings:', error);
  }
};
