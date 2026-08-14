import 'dotenv/config';
import cron from 'node-cron';
import { runSimulation } from '../lib/simulator';

console.log('[Simulator Service] Starting power draw simulation schedule...');

// Run every 15 seconds to create live activity for charts in dev
cron.schedule('*/15 * * * * *', async () => {
  console.log('[Simulator Service] Running simulation tick...');
  try {
    const result = await runSimulation();
    console.log(`[Simulator Service] Completed successfully: ${result.count} servers updated.`);
  } catch (error) {
    console.error('[Simulator Service] Tick error:', error);
  }
});
