export type ServerStatus = 'active' | 'idle' | 'decommissioned';

export type FaultType = 'none' | 'power-spike' | 'power-drop' | 'unresponsive';

export interface SimulatedServer {
  id: number;
  name: string;
  startUnit: number;
  sizeUnits: number;
  status: ServerStatus;
  currentPower: number;      // in Watts
  currentTemp: number;       // in Celsius
  fault: FaultType;
}

export interface SimulatedRack {
  id: number;
  name: string;
  totalUnits: number;
  powerLimitWatts: number;
  servers: SimulatedServer[];
  isStopped: boolean;        // Track if this rack's services are offline
}
