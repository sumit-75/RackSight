import { behaviorEngine } from './simulator';
import { RackRestServer } from './restApi';
import { meshTopology } from './topology';
import { ControlServer } from './controlApi';

const START_PORT = 10081;
const NUM_RACKS = 5;
const CONTROL_PORT = 9000;

const servers: RackRestServer[] = [];
let controlServer: ControlServer | null = null;
let tickIntervalId: NodeJS.Timeout | null = null;

async function startSimulator() {
  console.log('==================================================');
  console.log('       DCIM STANDALONE HARDWARE SIMULATOR         ');
  console.log('==================================================');
  console.log(`[Simulator] Starting mock telemetry loops (15s tick)...`);

  // Start the tick interval immediately
  tickIntervalId = setInterval(() => {
    console.log(`[Simulator] Running telemetry simulation tick...`);
    behaviorEngine.tick();
  }, 15000);

  // Run the first tick immediately to initialize data values
  behaviorEngine.tick();

  // Instantiate and start REST API servers for the 5 racks
  for (let r = 1; r <= NUM_RACKS; r++) {
    const port = START_PORT + r - 1;
    const server = new RackRestServer(r, port);
    servers.push(server);
    await server.start();
  }

  // Instantiate and start the central control server
  controlServer = new ControlServer(CONTROL_PORT, servers);
  await controlServer.start();

  // Start the inter-rack mesh network topology generator
  meshTopology.start();

  console.log('\n[Simulator] All services online and ready.');
  console.log('==================================================');
}

async function stopSimulator() {
  console.log('\n[Simulator] Shutting down services...');
  
  if (tickIntervalId) {
    clearInterval(tickIntervalId);
    tickIntervalId = null;
  }

  // Stop topology loop
  meshTopology.stop();

  // Stop control API server
  if (controlServer) {
    await controlServer.stop();
  }

  // Shut down all rack servers to release ports
  for (const server of servers) {
    await server.stop();
  }

  console.log('[Simulator] Shutdown complete. Goodbye.');
  process.exit(0);
}

// Intercept termination signals for graceful release of ports
process.on('SIGINT', stopSimulator);
process.on('SIGTERM', stopSimulator);

// Launch the system
startSimulator().catch((err) => {
  console.error('[Simulator Startup Error] Failed:', err);
  process.exit(1);
});

export { servers };
