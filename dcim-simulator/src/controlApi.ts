import express, { Express, Request, Response } from 'express';
import { Server as HttpServer } from 'http';
import { behaviorEngine } from './simulator';
import { meshTopology } from './topology';
import { RackRestServer } from './restApi';
import { ServerStatus, FaultType } from './types';

export class ControlServer {
  private app: Express;
  private server: HttpServer | null = null;
  private port: number;
  private rackServers: RackRestServer[];

  constructor(port: number, rackServers: RackRestServer[]) {
    this.port = port;
    this.rackServers = rackServers;
    this.app = express();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.app.use(express.json());

    // List all simulated racks, ports, and server states
    this.app.get('/api/control/racks', (req: Request, res: Response) => {
      const summary = behaviorEngine.racks.map((r, index) => ({
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
    this.app.post('/api/control/stop/:rackId', async (req: Request, res: Response) => {
      const rackId = parseInt(req.params.rackId);
      const rack = behaviorEngine.racks.find((r) => r.id === rackId);
      if (!rack) return res.status(404).json({ error: `Rack ${rackId} not found` });

      rack.isStopped = true;
      const rackServer = this.rackServers[rackId - 1];
      if (rackServer) {
        await rackServer.stop();
      }

      console.log(`[Control] Stopped Rack-${rackId} services`);
      res.json({ success: true, message: `Rack-${rackId} services stopped.` });
    });

    // Start/Restart a rack's REST API listener
    this.app.post('/api/control/start/:rackId', async (req: Request, res: Response) => {
      const rackId = parseInt(req.params.rackId);
      const rack = behaviorEngine.racks.find((r) => r.id === rackId);
      if (!rack) return res.status(404).json({ error: `Rack ${rackId} not found` });

      rack.isStopped = false;
      const rackServer = this.rackServers[rackId - 1];
      if (rackServer) {
        await rackServer.start();
      }

      console.log(`[Control] Started Rack-${rackId} services`);
      res.json({ success: true, message: `Rack-${rackId} services started.` });
    });

    // Inject fault on a server (global entry)
    this.app.post('/api/control/fault', (req: Request, res: Response) => {
      const { rackId, serverId, fault } = req.body;
      if (typeof rackId !== 'number' || typeof serverId !== 'number' || !fault) {
        return res.status(400).json({ error: 'Payload must contain rackId, serverId, and fault.' });
      }

      try {
        behaviorEngine.injectFault(rackId, serverId, fault as FaultType);
        console.log(`[Control] Injected ${fault} fault to Server-${rackId}-${serverId}`);
        res.json({ success: true, message: `Fault ${fault} injected on Server-${rackId}-${serverId}` });
      } catch (err: any) {
        res.status(404).json({ error: err.message });
      }
    });

    // Change server status (global entry)
    this.app.post('/api/control/status', (req: Request, res: Response) => {
      const { rackId, serverId, status } = req.body;
      if (typeof rackId !== 'number' || typeof serverId !== 'number' || !status) {
        return res.status(400).json({ error: 'Payload must contain rackId, serverId, and status.' });
      }

      try {
        behaviorEngine.setServerStatus(rackId, serverId, status as ServerStatus);
        console.log(`[Control] Set status of Server-${rackId}-${serverId} to ${status}`);
        res.json({ success: true, message: `Server-${rackId}-${serverId} status set to ${status}` });
      } catch (err: any) {
        res.status(404).json({ error: err.message });
      }
    });

    // Trigger simulation tick
    this.app.post('/api/control/tick', (req: Request, res: Response) => {
      behaviorEngine.tick();
      console.log('[Control] Manual simulation tick triggered.');
      res.json({ success: true, message: 'Simulation tick completed.' });
    });

    // Expose active topology connections
    this.app.get('/api/control/topology', (req: Request, res: Response) => {
      res.json({
        edges: meshTopology.activeEdges,
      });
    });
  }

  public start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`[Control API Server] Listening on http://localhost:${this.port}`);
        resolve();
      });
    });
  }

  public stop(): Promise<void> {
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
