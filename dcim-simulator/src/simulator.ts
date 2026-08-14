import { SimulatedRack, SimulatedServer, ServerStatus, FaultType } from './types';

// In-memory simulator state
export class BehaviorEngine {
  public racks: SimulatedRack[] = [];
  private ambientTemp = 21.0; // Baseline ambient temperature in Celsius
  private thermalLag = 0.08;   // Heat transfer/inertia coefficient (1.0 = instant, 0.0 = no change)
  private thermalScale = 0.05; // Watt-to-Celsius scaling factor for target heat

  constructor() {
    this.initializeState();
  }

  /**
   * Initializes 5 racks, each with 6 servers mounted in non-overlapping positions
   */
  private initializeState() {
    for (let r = 1; r <= 5; r++) {
      const servers: SimulatedServer[] = [
        {
          id: 1,
          name: `Server-${r}-1`,
          startUnit: 1,
          sizeUnits: 2, // U1-U2
          status: 'active',
          currentPower: 180.0,
          currentTemp: 30.0,
          fault: 'none',
        },
        {
          id: 2,
          name: `Server-${r}-2`,
          startUnit: 4,
          sizeUnits: 1, // U4
          status: 'active',
          currentPower: 180.0,
          currentTemp: 30.0,
          fault: 'none',
        },
        {
          id: 3,
          name: `Server-${r}-3`,
          startUnit: 6,
          sizeUnits: 2, // U6-U7
          status: 'idle',
          currentPower: 25.0,
          currentTemp: 22.0,
          fault: 'none',
        },
        {
          id: 4,
          name: `Server-${r}-4`,
          startUnit: 10,
          sizeUnits: 4, // U10-U13
          status: 'active',
          currentPower: 180.0,
          currentTemp: 30.0,
          fault: 'none',
        },
        {
          id: 5,
          name: `Server-${r}-5`,
          startUnit: 16,
          sizeUnits: 2, // U16-U17
          status: 'decommissioned',
          currentPower: 0.0,
          currentTemp: 21.0,
          fault: 'none',
        },
        {
          id: 6,
          name: `Server-${r}-6`,
          startUnit: 20,
          sizeUnits: 1, // U20
          status: 'active',
          currentPower: 180.0,
          currentTemp: 30.0,
          fault: 'none',
        },
      ];

      this.racks.push({
        id: r,
        name: `Rack-${r}`,
        totalUnits: 42,
        powerLimitWatts: r === 1 ? 1200 : 1500, // Rack 1 has a lower limit to easily test threshold alerts
        servers,
        isStopped: false,
      });
    }
  }

  /**
   * Updates power draw and temperature for all servers based on state/faults
   */
  public tick() {
    for (const rack of this.racks) {
      if (rack.isStopped) {
        // If rack is powered down, all servers drop to 0W and cool down to ambient temp
        for (const server of rack.servers) {
          server.currentPower = 0.0;
          server.currentTemp = parseFloat(
            (server.currentTemp + this.thermalLag * (this.ambientTemp - server.currentTemp)).toFixed(1)
          );
        }
        continue;
      }

      for (const server of rack.servers) {
        let targetPower = 0;
        let changePercent = 0;
        let minPower = 0;
        let maxPower = 0;

        // Apply fault conditions first
        if (server.fault === 'power-spike') {
          // Exceeds normal power limits
          server.currentPower = parseFloat((550.0 + (Math.random() - 0.5) * 20).toFixed(1));
        } else if (server.fault === 'power-drop') {
          server.currentPower = 0.0;
        } else if (server.fault === 'unresponsive') {
          // Maintain current power/temp but the service itself won't respond to HTTP
          // We still calculate telemetry for it, but queries to REST API will drop
        }

        // Normal state machine behavior if no power anomalies are active
        if (server.fault !== 'power-spike' && server.fault !== 'power-drop') {
          if (server.status === 'active') {
            const baseline = 180.0;
            // Fluctuates +/- 2%
            changePercent = (Math.random() - 0.5) * 0.04; // -2% to +2%
            let nextPower = server.currentPower === 0 ? baseline : server.currentPower * (1 + changePercent);
            
            // Clamp between 100W and 350W
            if (nextPower < 100) nextPower = 100;
            if (nextPower > 350) nextPower = 350;
            server.currentPower = parseFloat(nextPower.toFixed(1));
          } else if (server.status === 'idle') {
            const baseline = 25.0;
            // Fluctuates +/- 1.5%
            changePercent = (Math.random() - 0.5) * 0.03; // -1.5% to +1.5%
            let nextPower = server.currentPower === 0 ? baseline : server.currentPower * (1 + changePercent);
            
            // Clamp between 15W and 45W
            if (nextPower < 15) nextPower = 15;
            if (nextPower > 45) nextPower = 45;
            server.currentPower = parseFloat(nextPower.toFixed(1));
          } else if (server.status === 'decommissioned') {
            server.currentPower = 0.0;
          }
        }

        // Calculate target temperature based on power draw
        // Target temp is proportional to power draw (e.g. 21°C ambient + 0.05°C per Watt)
        const targetTemp = this.ambientTemp + server.currentPower * this.thermalScale;

        // Apply thermal inertia: Temp lags behind power changes
        const nextTemp = server.currentTemp + this.thermalLag * (targetTemp - server.currentTemp);
        server.currentTemp = parseFloat(nextTemp.toFixed(1));
      }
    }
  }

  /**
   * Sets the status of a specific server
   */
  public setServerStatus(rackId: number, serverId: number, status: ServerStatus) {
    const rack = this.racks.find((r) => r.id === rackId);
    if (!rack) throw new Error(`Rack ${rackId} not found`);

    const server = rack.servers.find((s) => s.id === serverId);
    if (!server) throw new Error(`Server ${serverId} not found on Rack ${rackId}`);

    server.status = status;
    if (status === 'decommissioned') {
      server.currentPower = 0.0;
    }
  }

  /**
   * Injects a fault on a specific server
   */
  public injectFault(rackId: number, serverId: number, fault: FaultType) {
    const rack = this.racks.find((r) => r.id === rackId);
    if (!rack) throw new Error(`Rack ${rackId} not found`);

    const server = rack.servers.find((s) => s.id === serverId);
    if (!server) throw new Error(`Server ${serverId} not found on Rack ${rackId}`);

    server.fault = fault;
  }
}

// Export singleton instance
export const behaviorEngine = new BehaviorEngine();
