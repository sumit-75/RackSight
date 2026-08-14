import express, { Express, Request, Response, NextFunction } from 'express';
import { Server as HttpServer } from 'http';
import { behaviorEngine } from './simulator';
import { ServerStatus, FaultType } from './types';
import { meshTopology } from './topology';

export class RackRestServer {
  private app: Express;
  private server: HttpServer | null = null;
  private rackId: number;
  private port: number;

  constructor(rackId: number, port: number) {
    this.rackId = rackId;
    this.port = port;
    this.app = express();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.app.use(express.json());

    // Middleware to check if the rack is stopped or unresponsive
    const networkGuard = (req: Request, res: Response, next: NextFunction) => {
      const rack = behaviorEngine.racks.find((r) => r.id === this.rackId);
      if (!rack || rack.isStopped) {
        // Return 503 Service Unavailable (simulate hardware outage)
        return res.status(503).json({ error: 'Rack Controller Unreachable' });
      }
      next();
    };

    this.app.use(networkGuard);

    // Get rack metadata
    this.app.get('/api/info', (req: Request, res: Response) => {
      const rack = behaviorEngine.racks.find((r) => r.id === this.rackId);
      if (!rack) return res.status(404).json({ error: 'Rack not found' });
      res.json({
        id: rack.id,
        name: rack.name,
        totalUnits: rack.totalUnits,
        powerLimitWatts: rack.powerLimitWatts,
      });
    });

    // Get rack servers
    this.app.get('/api/servers', (req: Request, res: Response) => {
      const rack = behaviorEngine.racks.find((r) => r.id === this.rackId);
      if (!rack) return res.status(404).json({ error: 'Rack not found' });
      res.json(
        rack.servers.map((s) => ({
          id: s.id,
          name: s.name,
          startUnit: s.startUnit,
          sizeUnits: s.sizeUnits,
          status: s.status,
        }))
      );
    });

    // Get single server details (mimicking BMC)
    this.app.get('/api/servers/:serverId', (req: Request, res: Response) => {
      const rack = behaviorEngine.racks.find((r) => r.id === this.rackId);
      const serverId = parseInt(req.params.serverId);
      const server = rack?.servers.find((s) => s.id === serverId);

      if (!server) return res.status(404).json({ error: 'Server not found' });

      // If server is marked as unresponsive, hang the connection or fail it
      if (server.fault === 'unresponsive') {
        // Simulate a socket timeout by not responding (or dropping the response)
        return; 
      }

      res.json({
        id: server.id,
        name: server.name,
        startUnit: server.startUnit,
        sizeUnits: server.sizeUnits,
        status: server.status,
        power: server.currentPower,
        temperature: server.currentTemp,
        fault: server.fault,
      });
    });

    // Get live telemetry for all servers in the rack
    this.app.get('/api/telemetry', (req: Request, res: Response) => {
      const rack = behaviorEngine.racks.find((r) => r.id === this.rackId);
      if (!rack) return res.status(404).json({ error: 'Rack not found' });

      // Build telemetry payload, filtering out unresponsive servers or modifying their data
      const telemetry = rack.servers.map((s) => {
        if (s.fault === 'unresponsive') {
          // Unresponsive servers don't report telemetry (or result in missing readings)
          return {
            id: s.id,
            name: s.name,
            status: s.status,
            power: null,
            temperature: null,
            fault: s.fault,
          };
        }
        return {
          id: s.id,
          name: s.name,
          status: s.status,
          power: s.currentPower,
          temperature: s.currentTemp,
          fault: s.fault,
        };
      });

      res.json({
        rackId: this.rackId,
        timestamp: new Date().toISOString(),
        telemetry,
      });
    });

    // GET /api/topology: Expose the active mesh network connections
    this.app.get('/api/topology', (req: Request, res: Response) => {
      res.json({
        timestamp: new Date().toISOString(),
        edges: meshTopology.activeEdges,
      });
    });

    // POST /api/simulate: Trigger simulation tick
    this.app.post('/api/simulate', (req: Request, res: Response) => {
      behaviorEngine.tick();
      res.json({ success: true, message: 'Simulation tick executed.' });
    });

    // POST /api/fault: Inject fault on a server in this rack
    this.app.post('/api/fault', (req: Request, res: Response) => {
      const { serverId, fault } = req.body;
      if (typeof serverId !== 'number' || !fault) {
        return res.status(400).json({ error: 'Invalid payload. Expects serverId and fault.' });
      }

      try {
        behaviorEngine.injectFault(this.rackId, serverId, fault as FaultType);
        res.json({ success: true, message: `Fault ${fault} injected on Server ${this.rackId}-${serverId}` });
      } catch (err: any) {
        res.status(404).json({ error: err.message });
      }
    });

    // POST /api/status: Change status of a server in this rack
    this.app.post('/api/status', (req: Request, res: Response) => {
      const { serverId, status } = req.body;
      if (typeof serverId !== 'number' || !status) {
        return res.status(400).json({ error: 'Invalid payload. Expects serverId and status.' });
      }

      try {
        behaviorEngine.setServerStatus(this.rackId, serverId, status as ServerStatus);
        res.json({ success: true, message: `Status updated to ${status} on Server ${this.rackId}-${serverId}` });
      } catch (err: any) {
        res.status(404).json({ error: err.message });
      }
    });

    // GET /redfish/v1: Redfish service root
    this.app.get('/redfish/v1', (req: Request, res: Response) => {
      res.json({
        "@odata.context": "/redfish/v1/$metadata#ServiceRoot.ServiceRoot",
        "@odata.id": "/redfish/v1",
        "@odata.type": "#ServiceRoot.v1_15_0.ServiceRoot",
        "Id": "RootService",
        "Name": "Root Service",
        "RedfishVersion": "1.15.0",
        "UUID": `sim-uuid-${this.rackId}`,
        "Chassis": {
          "@odata.id": "/redfish/v1/Chassis"
        }
      });
    });

    // GET /redfish/v1/Chassis: Collection of chassis
    this.app.get('/redfish/v1/Chassis', (req: Request, res: Response) => {
      const rack = behaviorEngine.racks.find((r) => r.id === this.rackId);
      if (!rack) return res.status(404).json({ error: 'Rack not found' });
      
      const members = [
        { "@odata.id": `/redfish/v1/Chassis/Rack-${this.rackId}` }
      ];
      
      // Add server blades to the chassis collection
      rack.servers.forEach(server => {
        members.push({ "@odata.id": `/redfish/v1/Chassis/Server-${this.rackId}-${server.id}` });
      });

      res.json({
        "@odata.context": "/redfish/v1/$metadata#ChassisCollection.ChassisCollection",
        "@odata.id": "/redfish/v1/Chassis",
        "@odata.type": "#ChassisCollection.ChassisCollection",
        "Name": "Chassis Collection",
        "Members@odata.count": members.length,
        "Members": members
      });
    });

    // GET /redfish/v1/Chassis/:chassisId: Detailed chassis/server blade information
    this.app.get('/redfish/v1/Chassis/:chassisId', (req: Request, res: Response) => {
      const rack = behaviorEngine.racks.find((r) => r.id === this.rackId);
      if (!rack) return res.status(404).json({ error: 'Rack not found' });

      const { chassisId } = req.params;

      if (chassisId === `Rack-${this.rackId}`) {
        // Return rack-level chassis details
        return res.json({
          "@odata.context": "/redfish/v1/$metadata#Chassis.Chassis",
          "@odata.id": `/redfish/v1/Chassis/Rack-${this.rackId}`,
          "@odata.type": "#Chassis.v1_16_0.Chassis",
          "Id": `Rack-${this.rackId}`,
          "Name": `Rack ${this.rackId} Enclosure`,
          "ChassisType": "RackMount",
          "Manufacturer": "Contoso Hardware",
          "Model": "SuperRack-V1",
          "SerialNumber": `SN-RACK-${this.rackId}-98765`,
          "PowerState": "On",
          "Status": {
            "State": "Enabled",
            "Health": "OK"
          }
        });
      } else if (chassisId.startsWith(`Server-${this.rackId}-`)) {
        // Return server-level blade details
        const serverId = parseInt(chassisId.split('-')[2]);
        const server = rack.servers.find((s) => s.id === serverId);
        if (!server) return res.status(404).json({ error: `Chassis member ${chassisId} not found` });

        if (server.fault === 'unresponsive') {
          // Simulate connection timeout by dropping the request
          return;
        }

        const isFault = server.fault !== 'none';

        return res.json({
          "@odata.context": "/redfish/v1/$metadata#Chassis.Chassis",
          "@odata.id": `/redfish/v1/Chassis/${chassisId}`,
          "@odata.type": "#Chassis.v1_16_0.Chassis",
          "Id": chassisId,
          "Name": server.name,
          "ChassisType": "Blade",
          "Manufacturer": "Generic Node Corp",
          "Model": `SimServer-${server.sizeUnits}U`,
          "SerialNumber": `SN-SRV-${this.rackId}-${server.id}-54321`,
          "PowerState": server.status === 'decommissioned' ? 'Off' : 'On',
          "Status": {
            "State": server.status === 'decommissioned' ? 'Disabled' : 'Enabled',
            "Health": isFault ? 'Critical' : 'OK'
          },
          "PowerWatts": server.currentPower,
          "TemperatureCelsius": server.currentTemp
        });
      }

      res.status(404).json({ error: `Chassis ${chassisId} not found on this controller` });
    });
  }

  /**
   * Starts the Express REST server
   */
  public start(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        resolve();
        return;
      }
      this.server = this.app.listen(this.port, () => {
        console.log(`[Rack ${this.rackId} REST API] Online on http://localhost:${this.port}`);
        resolve();
      });
    });
  }

  /**
   * Stops the Express REST server listener (network disconnect simulation)
   */
  public stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.server) {
        resolve();
        return;
      }
      this.server.close(() => {
        console.log(`[Rack ${this.rackId} REST API] Listener offline`);
        this.server = null;
        resolve();
      });
    });
  }
}
