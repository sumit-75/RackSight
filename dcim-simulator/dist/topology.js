"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meshTopology = exports.MeshTopologyGenerator = void 0;
const simulator_1 = require("./simulator");
class MeshTopologyGenerator {
    intervalId = null;
    ports;
    activeEdges = [];
    constructor(ports) {
        this.ports = ports;
    }
    /**
     * Starts the inter-rack background communication ping loop
     */
    start() {
        console.log('[Topology Generator] Starting inter-rack mesh pings...');
        // Trigger every 20 seconds
        this.intervalId = setInterval(() => this.runMeshPings(), 20000);
        // Run once immediately
        this.runMeshPings();
    }
    /**
     * Stops the inter-rack ping loop
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('[Topology Generator] Stopped inter-rack mesh pings');
        }
    }
    /**
     * Queries neighboring rack controllers to simulate cluster traffic
     */
    async runMeshPings() {
        const newEdges = [];
        // Each rack queries its neighboring rack (Rack N -> Rack N+1, Rack 5 -> Rack 1)
        for (let i = 0; i < this.ports.length; i++) {
            const sourceRackId = i + 1;
            const targetRackId = ((i + 1) % this.ports.length) + 1;
            const sourcePort = this.ports[i];
            const targetPort = this.ports[targetRackId - 1];
            // Check if source rack is active before sending traffic
            const sourceRackObj = simulator_1.behaviorEngine.racks.find((r) => r.id === sourceRackId);
            if (sourceRackObj?.isStopped) {
                continue; // Stopped racks cannot send queries
            }
            const url = `http://127.0.0.1:${targetPort}/api/info`;
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second timeout
                const response = await fetch(url, { signal: controller.signal });
                clearTimeout(timeoutId);
                if (response.ok) {
                    newEdges.push({
                        source: `Rack-${sourceRackId}`,
                        target: `Rack-${targetRackId}`,
                        status: 'connected',
                        timestamp: new Date().toISOString(),
                    });
                }
                else {
                    newEdges.push({
                        source: `Rack-${sourceRackId}`,
                        target: `Rack-${targetRackId}`,
                        status: 'error',
                        timestamp: new Date().toISOString(),
                    });
                }
            }
            catch (error) {
                newEdges.push({
                    source: `Rack-${sourceRackId}`,
                    target: `Rack-${targetRackId}`,
                    status: 'error',
                    timestamp: new Date().toISOString(),
                });
            }
        }
        this.activeEdges = newEdges;
    }
}
exports.MeshTopologyGenerator = MeshTopologyGenerator;
exports.meshTopology = new MeshTopologyGenerator([10081, 10082, 10083, 10084, 10085]);
