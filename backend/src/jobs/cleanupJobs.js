import cron from 'node-cron';
import Outing from '../models/Outing.js';
import Notification from '../models/Notification.js';

export const startCleanupJobs = () => {
  // Schedule a task to run every night at 3:00 AM
  // 0 3 * * * means: 0th minute, 3rd hour, every day of month, every month, every day of week.
  cron.schedule('0 3 * * *', async () => {
    console.log('[Cron Job] Starting 3-month cleanup job for historical outings...');
    
    try {
      // Calculate the date exactly 3 months (approx 90 days) ago
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      // Find outings created before this date
      const oldOutings = await Outing.find({ createdAt: { $lt: threeMonthsAgo } }).select('_id');
      const outingIds = oldOutings.map(o => o._id);

      if (outingIds.length > 0) {
        // Delete the outings
        const outingResult = await Outing.deleteMany({ _id: { $in: outingIds } });
        console.log(`[Cron Job] Successfully deleted ${outingResult.deletedCount} old outings.`);

        // Delete any notifications linked to these deleted outings
        const notifResult = await Notification.deleteMany({ outingId: { $in: outingIds } });
        console.log(`[Cron Job] Successfully deleted ${notifResult.deletedCount} associated notifications.`);
      } else {
        console.log('[Cron Job] No outings older than 3 months were found. Nothing to delete.');
      }
    } catch (error) {
      console.error('[Cron Job] Error running the cleanup job:', error);
    }
  });

  console.log('[Jobs] Cleanup jobs registered successfully.');
};
