"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlServer = void 0;
const express_1 = __importDefault(require("express"));
const simulator_1 = require("./simulator");
const topology_1 = require("./topology");
class ControlServer {
    app;
    server = null;
    port;
    rackServers;
    constructor(port, rackServers) {
        this.port = port;
        this.rackServers = rackServers;
        this.app = (0, express_1.default)();
        this.setupRoutes();
    }
    setupRoutes() {
        this.app.use(express_1.default.json());
        // List all simulated racks, ports, and server states
        this.app.get('/api/control/racks', (req, res) => {
            const summary = simulator_1.behaviorEngine.racks.map((r, index) => ({
                id: r.id,
                name: r.name,
                port: 10081 + index,
                isStopped: r.isStopped,
                serversCount: r.servers.length,
                servers: r.servers.map((s) => ({
                    id: s.id,
                    name: s.name,
                    startUnit: s.startUnit,
                    sizeUnits: s.sizeUnits,
                    status: s.status,
                    power: s.currentPower,
                    temperature: s.currentTemp,
                    fault: s.fault,
                })),
            }));
            res.json({
                timestamp: new Date().toISOString(),
                racks: summary,
            });
        });
        // Stop a rack's REST API listener (simulating connection failure)
        this.app.post('/api/control/stop/:rackId', async (req, res) => {
            const rackId = parseInt(req.params.rackId);
            const rack = simulator_1.behaviorEngine.racks.find((r) => r.id === rackId);
            if (!rack)
                return res.status(404).json({ error: `Rack ${rackId} not found` });
            rack.isStopped = true;
            const rackServer = this.rackServers[rackId - 1];
            if (rackServer) {
                await rackServer.stop();
            }
            console.log(`[Control] Stopped Rack-${rackId} services`);
            res.json({ success: true, message: `Rack-${rackId} services stopped.` });
        });
        // Start/Restart a rack's REST API listener
        this.app.post('/api/control/start/:rackId', async (req, res) => {
            const rackId = parseInt(req.params.rackId);
            const rack = simulator_1.behaviorEngine.racks.find((r) => r.id === rackId);
            if (!rack)
                return res.status(404).json({ error: `Rack ${rackId} not found` });
            rack.isStopped = false;
            const rackServer = this.rackServers[rackId - 1];
            if (rackServer) {
                await rackServer.start();
            }
            console.log(`[Control] Started Rack-${rackId} services`);
            res.json({ success: true, message: `Rack-${rackId} services started.` });
        });
        // Inject fault on a server (global entry)
        this.app.post('/api/control/fault', (req, res) => {
            const { rackId, serverId, fault } = req.body;
            if (typeof rackId !== 'number' || typeof serverId !== 'number' || !fault) {
                return res.status(400).json({ error: 'Payload must contain rackId, serverId, and fault.' });
            }
            try {
                simulator_1.behaviorEngine.injectFault(rackId, serverId, fault);
                console.log(`[Control] Injected ${fault} fault to Server-${rackId}-${serverId}`);
                res.json({ success: true, message: `Fault ${fault} injected on Server-${rackId}-${serverId}` });
            }
            catch (err) {
                res.status(404).json({ error: err.message });
            }
        });
        // Change server status (global entry)
        this.app.post('/api/control/status', (req, res) => {
            const { rackId, serverId, status } = req.body;
            if (typeof rackId !== 'number' || typeof serverId !== 'number' || !status) {
                return res.status(400).json({ error: 'Payload must contain rackId, serverId, and status.' });
            }
            try {
                simulator_1.behaviorEngine.setServerStatus(rackId, serverId, status);
                console.log(`[Control] Set status of Server-${rackId}-${serverId} to ${status}`);
                res.json({ success: true, message: `Server-${rackId}-${serverId} status set to ${status}` });
            }
            catch (err) {
                res.status(404).json({ error: err.message });
            }
        });
        // Trigger simulation tick
        this.app.post('/api/control/tick', (req, res) => {
            simulator_1.behaviorEngine.tick();
            console.log('[Control] Manual simulation tick triggered.');
            res.json({ success: true, message: 'Simulation tick completed.' });
        });
        // Expose active topology connections
        this.app.get('/api/control/topology', (req, res) => {
            res.json({
                edges: topology_1.meshTopology.activeEdges,
            });
        });
    }
    start() {
        return new Promise((resolve) => {
            this.server = this.app.listen(this.port, () => {
                console.log(`[Control API Server] Listening on http://localhost:${this.port}`);
                resolve();
            });
        });
    }
    stop() {
        return new Promise((resolve) => {
            if (!this.server) {
                resolve();
                return;
            }
            this.server.close(() => {
                console.log(`[Control API Server] Offline`);
                this.server = null;
                resolve();
            });
        });
    }
}
exports.ControlServer = ControlServer;
