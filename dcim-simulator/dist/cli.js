"use strict";
const CONTROL_URL = 'http://127.0.0.1:9000/api/control';
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    if (!command) {
        printHelp();
        return;
    }
    try {
        switch (command.toLowerCase()) {
            case 'list':
                await handleList();
                break;
            case 'stop':
                await handleStop(args[1]);
                break;
            case 'start':
                await handleStart(args[1]);
                break;
            case 'status':
                await handleStatus(args[1], args[2], args[3]);
                break;
            case 'fault':
                await handleFault(args[1], args[2], args[3]);
                break;
            case 'tick':
                await handleTick();
                break;
            default:
                console.error(`Unknown command: "${command}"`);
                printHelp();
        }
    }
    catch (error) {
        console.error(`[CLI Error] Request failed:`, error.message);
    }
}
function printHelp() {
    console.log('==================================================');
    console.log('         DCIM SIMULATOR CONTROL CLI HELP          ');
    console.log('==================================================');
    console.log('Usage:');
    console.log('  npm run control list');
    console.log('    List all racks, running ports, servers, and telemetry.');
    console.log();
    console.log('  npm run control stop <rackId | all>');
    console.log('    Stop a specific rack\'s Express server or all racks.');
    console.log();
    console.log('  npm run control start <rackId | all>');
    console.log('    Start/restart a specific rack\'s Express server or all racks.');
    console.log();
    console.log('  npm run control status <rackId> <serverId> <active | idle | decommissioned>');
    console.log('    Modify the runtime status of a specific server.');
    console.log();
    console.log('  npm run control fault <rackId> <serverId> <none | power-spike | power-drop | unresponsive>');
    console.log('    Inject a telemetry anomaly or network fault onto a server.');
    console.log();
    console.log('  npm run control tick');
    console.log('    Manually trigger a simulation tick (forces telemetry calculation update).');
    console.log('==================================================');
}
async function handleList() {
    const res = await fetch(`${CONTROL_URL}/racks`);
    if (!res.ok)
        throw new Error(`Server returned ${res.status}`);
    const data = await res.json();
    console.log('\n========================================================================');
    console.log(`SIMULATOR DISCOVERY MAP (${new Date(data.timestamp).toLocaleTimeString()})`);
    console.log('========================================================================');
    for (const rack of data.racks) {
        const statusText = rack.isStopped ? '🔴 STOPPED (Offline)' : '🟢 ONLINE';
        console.log(`\nRack: ${rack.name} | Port: ${rack.port} | Status: ${statusText}`);
        console.log('------------------------------------------------------------------------');
        console.log('  ID\tName\t\tUnits\tStatus\t\tPower\tTemp\tFault');
        console.log('  --\t----\t\t-----\t------\t\t-----\t----\t-----');
        for (const s of rack.servers) {
            const uRange = `U${s.startUnit}-${s.startUnit + s.sizeUnits - 1}`;
            const namePad = s.name.padEnd(12, ' ');
            const statusPad = s.status.padEnd(14, ' ');
            const powerStr = s.power !== null ? `${s.power.toFixed(1)}W` : 'N/A';
            const tempStr = s.temperature !== null ? `${s.temperature.toFixed(1)}°C` : 'N/A';
            const faultStr = s.fault !== 'none' ? `⚠️  ${s.fault.toUpperCase()}` : 'None';
            console.log(`  ${s.id}\t${namePad}\t${uRange}\t${statusPad}\t${powerStr}\t${tempStr}\t${faultStr}`);
        }
    }
    console.log('========================================================================\n');
}
async function handleStop(rackIdStr) {
    if (!rackIdStr) {
        console.error('Error: Please specify a rack ID (1-5) or "all".');
        return;
    }
    if (rackIdStr.toLowerCase() === 'all') {
        for (let r = 1; r <= 5; r++) {
            await stopRack(r);
        }
        console.log('All racks stopped.');
    }
    else {
        const rackId = parseInt(rackIdStr);
        if (isNaN(rackId))
            throw new Error('Invalid rack ID');
        await stopRack(rackId);
    }
}
async function stopRack(id) {
    const res = await fetch(`${CONTROL_URL}/stop/${id}`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
        console.log(`[Success] ${data.message}`);
    }
    else {
        console.error(`[Error] ${data.error}`);
    }
}
async function handleStart(rackIdStr) {
    if (!rackIdStr) {
        console.error('Error: Please specify a rack ID (1-5) or "all".');
        return;
    }
    if (rackIdStr.toLowerCase() === 'all') {
        for (let r = 1; r <= 5; r++) {
            await startRack(r);
        }
        console.log('All racks started.');
    }
    else {
        const rackId = parseInt(rackIdStr);
        if (isNaN(rackId))
            throw new Error('Invalid rack ID');
        await startRack(rackId);
    }
}
async function startRack(id) {
    const res = await fetch(`${CONTROL_URL}/start/${id}`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
        console.log(`[Success] ${data.message}`);
    }
    else {
        console.error(`[Error] ${data.error}`);
    }
}
async function handleStatus(rackIdStr, serverIdStr, status) {
    if (!rackIdStr || !serverIdStr || !status) {
        console.error('Usage: npm run control status <rackId> <serverId> <active|idle|decommissioned>');
        return;
    }
    const rackId = parseInt(rackIdStr);
    const serverId = parseInt(serverIdStr);
    if (isNaN(rackId) || isNaN(serverId))
        throw new Error('Rack ID and Server ID must be integers');
    const res = await fetch(`${CONTROL_URL}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rackId, serverId, status }),
    });
    const data = await res.json();
    if (res.ok) {
        console.log(`[Success] ${data.message}`);
    }
    else {
        console.error(`[Error] ${data.error}`);
    }
}
async function handleFault(rackIdStr, serverIdStr, fault) {
    if (!rackIdStr || !serverIdStr || !fault) {
        console.log('Usage: npm run control fault <rackId> <serverId> <none|power-spike|power-drop|unresponsive>');
        return;
    }
    const rackId = parseInt(rackIdStr);
    const serverId = parseInt(serverIdStr);
    if (isNaN(rackId) || isNaN(serverId))
        throw new Error('Rack ID and Server ID must be integers');
    const res = await fetch(`${CONTROL_URL}/fault`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rackId, serverId, fault }),
    });
    const data = await res.json();
    if (res.ok) {
        console.log(`[Success] ${data.message}`);
    }
    else {
        console.error(`[Error] ${data.error}`);
    }
}
async function handleTick() {
    const res = await fetch(`${CONTROL_URL}/tick`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
        console.log('[Success] Manual simulation tick executed.');
    }
    else {
        console.error(`[Error] ${data.error}`);
    }
}
main();
