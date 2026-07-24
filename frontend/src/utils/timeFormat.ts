/**
 * Converts a 24-hour time string (e.g., "19:00", "07:30") or any arbitrary time string
 * to a standard 12-hour AM/PM format (e.g., "07:00 PM", "07:30 AM").
 */
export const formatTo12Hour = (timeStr?: string | null): string => {
  if (!timeStr || timeStr === 'N/A') return 'N/A';
  
  // If it already contains AM/PM, return as is
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
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    const strHours = hours < 10 ? `0${hours}` : `${hours}`;
    return `${strHours}:${minutes} ${ampm}`;
  }
  
  return timeStr;
};
