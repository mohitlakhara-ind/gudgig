import cron from 'node-cron';
import NotificationService from '../services/notificationService.js';

let scheduled = null;

export function startNotificationCron() {
  if (scheduled) return scheduled;

  // Run every minute to process queued notifications
  scheduled = cron.schedule('* * * * *', async () => {
    try {
      const processed = await NotificationService.processPendingQueue(100);
      if (processed) {
        console.log(`[notificationCron] processed ${processed} queued notifications`);
      }
    } catch (err) {
      console.error('[notificationCron] error processing queue', err?.message || err);
    }
  });

  scheduled.start();
  return scheduled;
}

export function stopNotificationCron() {
  if (scheduled) {
    scheduled.stop();
    scheduled = null;
  }
}
