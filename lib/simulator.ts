import { prisma } from './prisma';

const START_PORT = 10081;
const NUM_RACKS = 5;
const CONTROL_URL = 'http://127.0.0.1:9000/api/control';

export async function runSimulation() {
  try {
    // 1. Trigger simulation tick in the standalone simulator service
    try {
      await fetch(`${CONTROL_URL}/tick`, { method: 'POST' });
    } catch (err: any) {
      console.warn('[Discovery/Poller] Could not trigger tick on Control API server:', err.message);
    }

    // Find or create default Room to link discovered racks to
    let defaultRoom = await prisma.room.findFirst();
    if (!defaultRoom) {
      // Find the first user in the database
      let firstUser = await prisma.user.findFirst();
      if (!firstUser) {
        firstUser = await prisma.user.create({
          data: {
            username: 'admin',
            password: '64ec88ca00b268e5ba1a35678a1b5316d212f4f366b2477232534a8aeca37f3c', // Hashed 'adminpassword'
          }
        });
      }
      defaultRoom = await prisma.room.create({
        data: {
          name: 'Primary Server Room',
          tempThresholdC: 25.0,
          userId: firstUser.id,
        },
      });
    }

    let syncedServersCount = 0;
    let newReadingsCount = 0;

    // 2. Scan ports 10081 to 10085 to discover online racks
    for (let r = 1; r <= NUM_RACKS; r++) {
      const port = START_PORT + r - 1;
      const rackUrl = `http://127.0.0.1:${port}`;

      try {
        // Query Rack Info
        const infoRes = await fetch(`${rackUrl}/api/info`);
        if (!infoRes.ok) {
          console.log(`[Discovery/Poller] Rack ${r} at port ${port} is offline (Status ${infoRes.status}).`);
          continue;
        }
        const rackInfo = await infoRes.json();

        // Upsert Rack in DB
        const dbRack = await prisma.rack.upsert({
          where: { id: rackInfo.id },
          update: {
            name: rackInfo.name,
            totalUnits: rackInfo.totalUnits,
            powerLimitWatts: rackInfo.powerLimitWatts,
          },
          create: {
            id: rackInfo.id,
            name: rackInfo.name,
            totalUnits: rackInfo.totalUnits,
            powerLimitWatts: rackInfo.powerLimitWatts,
            roomId: defaultRoom.id,
          },
        });

        // Query Rack Servers
        const serversRes = await fetch(`${rackUrl}/api/servers`);
        if (!serversRes.ok) continue;
        const serversList: any[] = await serversRes.json();

        // Sync Servers in DB
        const serverMap: { [startUnit: number]: any } = {};
        for (const s of serversList) {
          let dbServer = await prisma.server.findFirst({
            where: {
              rackId: dbRack.id,
              startUnit: s.startUnit,
            },
          });

          if (dbServer) {
            dbServer = await prisma.server.update({
              where: { id: dbServer.id },
              data: {
                name: s.name,
                sizeUnits: s.sizeUnits,
                status: s.status,
              },
            });
          } else {
            dbServer = await prisma.server.create({
              data: {
                rackId: dbRack.id,
                name: s.name,
                startUnit: s.startUnit,
                sizeUnits: s.sizeUnits,
                status: s.status,
              },
            });
          }
          serverMap[s.startUnit] = dbServer;
          syncedServersCount++;
        }

        // Query Rack Telemetry and write readings
        const telemetryRes = await fetch(`${rackUrl}/api/telemetry`);
        if (!telemetryRes.ok) continue;
        const telemetryData = await telemetryRes.json();

        for (const t of telemetryData.telemetry) {
          // Find matching server by checking unit mappings
          const serverListObj = serversList.find(s => s.id === t.id);
          if (!serverListObj) continue;

          const dbServer = serverMap[serverListObj.startUnit];
          if (!dbServer) continue;

          // If the server is offline or unresponsive, power is null
          if (t.power !== null) {
            await prisma.powerReading.create({
              data: {
                serverId: dbServer.id,
                watts: t.power,
                timestamp: new Date(telemetryData.timestamp),
              },
            });
            newReadingsCount++;
          }
        }
      } catch (err: any) {
        // Fetch failed (network connection refused) - Rack is offline
        console.log(`[Discovery/Poller] Could not connect to Rack ${r} on port ${port}:`, err.message);
      }
    }

    console.log(`[Discovery/Poller] Sync complete. Processed ${syncedServersCount} servers, added ${newReadingsCount} new power readings.`);
    return { success: true, count: newReadingsCount, syncedServers: syncedServersCount };
  } catch (error: any) {
    console.error('[Discovery/Poller Error] Ingestion failed:', error);
    throw error;
  }
}
