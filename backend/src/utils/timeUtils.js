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
    const leavingDate = new Date(outing.submitted_date);
    const { hours: lHours, minutes: lMinutes } = parseTime(outing.leaving_time);
    leavingDate.setHours(lHours, lMinutes, 0, 0);

    const reportingDate = new Date(outing.submitted_date);
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
    const reportingDate = new Date(outing.submitted_date);
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
    const reportingDate = new Date(outing.submitted_date);
    const { hours: rHours, minutes: rMinutes } = parseTime(outing.reporting_time);
    reportingDate.setHours(rHours, rMinutes, 0, 0);

    return now >= reportingDate;
  } catch (error) {
    console.error('Error calculating outing completed status:', error);
    return false;
  }
};
