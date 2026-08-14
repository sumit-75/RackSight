"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.servers = void 0;
const simulator_1 = require("./simulator");
const restApi_1 = require("./restApi");
const topology_1 = require("./topology");
const controlApi_1 = require("./controlApi");
const START_PORT = 10081;
const NUM_RACKS = 5;
const CONTROL_PORT = 9000;
const servers = [];
exports.servers = servers;
let controlServer = null;
let tickIntervalId = null;
async function startSimulator() {
    console.log('==================================================');
    console.log('       DCIM STANDALONE HARDWARE SIMULATOR         ');
    console.log('==================================================');
    console.log(`[Simulator] Starting mock telemetry loops (15s tick)...`);
    // Start the tick interval immediately
    tickIntervalId = setInterval(() => {
        console.log(`[Simulator] Running telemetry simulation tick...`);
        simulator_1.behaviorEngine.tick();
    }, 15000);
    // Run the first tick immediately to initialize data values
    simulator_1.behaviorEngine.tick();
    // Instantiate and start REST API servers for the 5 racks
    for (let r = 1; r <= NUM_RACKS; r++) {
        const port = START_PORT + r - 1;
        const server = new restApi_1.RackRestServer(r, port);
        servers.push(server);
        await server.start();
    }
    // Instantiate and start the central control server
    controlServer = new controlApi_1.ControlServer(CONTROL_PORT, servers);
    await controlServer.start();
    // Start the inter-rack mesh network topology generator
    topology_1.meshTopology.start();
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
    topology_1.meshTopology.stop();
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
