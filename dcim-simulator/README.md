# DCIM Test Simulator Environment (`dcim-simulator`)

This is a standalone mock hardware telemetry and rack control simulation environment designed to verify the discovery, polling, and ingestion logic of the **Mini DCIM** monitoring system.

Every simulated rack and server is exposed as a real running Express API on the loopback address (`127.0.0.1`) with a unique port, generating genuine network traffic (HTTP/TCP socket traffic) that can be monitored over loopback.

---

## 🔌 Port & Endpoint Configuration

The simulator runs a supervisor control port and five independent rack ports:

* **Control Supervisor Server**: Port `9000`
* **Rack-1**: Port `10081`
* **Rack-2**: Port `10082`
* **Rack-3**: Port `10083`
* **Rack-4**: Port `10084`
* **Rack-5**: Port `10085`

---

## 📡 REST API & Redfish Endpoint Reference

Each rack Express server exposes the following HTTP endpoints:

### 1. Hardware Metadata
* **`GET /api/info`**: Returns the rack's metadata parameters.
  * *Response Example*: `{"id": 1, "name": "Rack-1", "totalUnits": 42, "powerLimitWatts": 1200}`

### 2. Inventory list
* **`GET /api/servers`**: Returns a list of servers mounted inside the rack.
  * *Response Example*: `[{"id": 1, "name": "Server-1-1", "startUnit": 1, "sizeUnits": 2, "status": "active"}]`

### 3. Live Telemetry
* **`GET /api/telemetry`**: Returns live power draw (Watts) and temperature (°C) telemetry.
  * *Response Example*:
    ```json
    {
      "rackId": 1,
      "timestamp": "2026-08-11T12:00:00.000Z",
      "telemetry": [
        { "id": 1, "name": "Server-1-1", "status": "active", "power": 182.4, "temperature": 30.2, "fault": "none" }
      ]
    }
    ```

### 4. Zero-Touch Redfish API
* **`GET /redfish/v1`**: Redfish service root details.
* **`GET /redfish/v1/Chassis`**: Collection showing member links for the rack enclosure and server blade slots.
* **`GET /redfish/v1/Chassis/Rack-{id}`**: Detailed DMTF Redfish schema payload for the rack cabinet.
* **`GET /redfish/v1/Chassis/Server-{rackId}-{serverId}`**: Redfish schema payload for a specific server slot.

---

## 🛠️ CLI Management Console

You can interact with the running simulator using the built-in control CLI script:

### 1. List Statuses & Ports
Print a discovery matrix of all simulated racks, ports, server configurations, power, temperature, and injected faults:
```bash
npm run control list
```

### 2. Shut Down Rack Ports (Simulate Hardware Disconnect)
Closes the Express server port listener of a specific rack to simulate complete network/hardware disconnects:
```bash
# Disconnect Rack 2
npm run control stop 2

# Bring Rack 2 back online
npm run control start 2

# Disconnect all racks
npm run control stop all
```

### 3. Change Server Workload States
Instructs the server to apply the corresponding baseline power parameters (active baseline `180W` +/-2%, idle baseline `25W` +/-1.5%, decommissioned `0W`):
```bash
# Set Server 4 on Rack 1 to idle status
npm run control status 1 4 idle
```

### 4. Inject Telemetry & Connection Anomalies
Simulates hardware anomalies to test rule triggers and threshold alerts:
* **`power-spike`**: Watts exceed Normal limits (shoots to ~`550W`).
* **`power-drop`**: Power crashes to `0W`.
* **`unresponsive`**: Drops REST connection requests (queries timeout).
```bash
# Trigger a power spike on Server 1 of Rack 3
npm run control fault 3 1 power-spike

# Restore Normal behavior
npm run control fault 3 1 none
```

### 5. Trigger a Manual Step
Forces a telemetry update tick instantly without waiting for the 15-second simulation timer:
```bash
npm run control tick
```

---

## 📊 Pointing Next.js to this Simulator

The in-process telemetry engine in the Next.js app has been modified to run as a network poller:
1. When you trigger GET `/api/simulate` on the Next.js app, it makes a POST request to `http://127.0.0.1:9000/api/control/tick` to step the simulator.
2. It then scans ports `10081`-`10085`.
3. For each active port, it syncs the racks, servers, and telemetry data inside the PostgreSQL database.
4. The dashboard charts update in real time.
