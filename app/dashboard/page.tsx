import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Server, Zap, AlertTriangle, Layers, Thermometer, ArrowRight, Activity } from 'lucide-react';
import { getCurrentUser } from '@/app/actions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const rooms = await prisma.room.findMany({
    where: { userId: user.id },
    include: {
      racks: {
        include: {
          servers: {
            include: {
              readings: {
                orderBy: { timestamp: 'desc' },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  // Calculate high-level stats
  const totalRooms = rooms.length;
  let totalRacks = 0;
  let totalServers = 0;
  let activeServers = 0;
  let totalPowerDraw = 0;
  let activeAlerts = 0;

  const roomSummaries = rooms.map((room) => {
    let roomPower = 0;
    let roomAlerts = 0;
    const rackCount = room.racks.length;

    room.racks.forEach((rack) => {
      totalRacks++;
      let rackPower = 0;

      rack.servers.forEach((server) => {
        totalServers++;
        if (server.status === 'active') activeServers++;

        const latestReading = server.readings[0];
        if (latestReading) {
          rackPower += latestReading.watts;
        }
      });

      totalPowerDraw += rackPower;
      roomPower += rackPower;

      if (rackPower > rack.powerLimitWatts) {
        activeAlerts++;
        roomAlerts++;
      }
    });

    return {
      id: room.id,
      name: room.name,
      tempThreshold: room.tempThresholdC,
      racksCount: rackCount,
      powerDraw: roomPower,
      alertsCount: roomAlerts,
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans max-w-7xl mx-auto pt-2 sm:pt-4 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#f5f5f4] flex items-center gap-3 font-sans">
          <Activity className="text-emerald-400" size={30} />
          RackSight Overview
        </h1>
        <p className="text-[#a3a39e] text-xs sm:text-sm mt-1 font-sans">
          Infrastructure health, power utilization, and active threshold monitoring.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Rooms */}
        <div className="rounded-2xl border border-[#24231f] bg-[#161512] p-5 flex items-center justify-between shadow-md hover:border-[#383630] transition-colors">
          <div>
            <span className="text-[0.65rem] uppercase text-[#a3a39e] font-extrabold tracking-wider">Total Rooms</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#f5f5f4] mt-1">{totalRooms}</div>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.15)] flex items-center justify-center">
            <Layers size={20} className="text-purple-400" />
          </div>
        </div>

        {/* Total Racks */}
        <div className="rounded-2xl border border-[#24231f] bg-[#161512] p-5 flex items-center justify-between shadow-md hover:border-[#383630] transition-colors">
          <div>
            <span className="text-[0.65rem] uppercase text-[#a3a39e] font-extrabold tracking-wider">Active Racks</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#f5f5f4] mt-1">{totalRacks}</div>
          </div>
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)] flex items-center justify-center">
            <Server size={20} className="text-cyan-400" />
          </div>
        </div>

        {/* Total Power Draw */}
        <div className="rounded-2xl border border-[#24231f] bg-[#161512] p-5 flex items-center justify-between shadow-md hover:border-[#383630] transition-colors">
          <div>
            <span className="text-[0.65rem] uppercase text-[#a3a39e] font-extrabold tracking-wider">Total Power Draw</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">{totalPowerDraw.toFixed(0)} W</div>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)] flex items-center justify-center">
            <Zap size={20} className="text-emerald-400" />
          </div>
        </div>

        {/* Active Threshold Alerts */}
        <div className={`rounded-2xl border p-5 flex items-center justify-between shadow-md transition-colors ${
          activeAlerts > 0
            ? 'border-rose-500/40 bg-rose-500/10 shadow-rose-950/20'
            : 'border-[#24231f] bg-[#161512] hover:border-[#383630]'
        }`}>
          <div>
            <span className="text-[0.65rem] uppercase text-[#a3a39e] font-extrabold tracking-wider">Active Alerts</span>
            <div className={`text-2xl sm:text-3xl font-extrabold mt-1 ${activeAlerts > 0 ? 'text-rose-400' : 'text-[#f5f5f4]'}`}>
              {activeAlerts}
            </div>
          </div>
          <div className={`p-3 rounded-xl border flex items-center justify-center ${
            activeAlerts > 0
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
              : 'bg-[#1b1915] border-[#282620] text-[#a3a39e]'
          }`}>
            <AlertTriangle size={20} className={activeAlerts > 0 ? 'text-rose-400' : 'text-[#a3a39e]'} />
          </div>
        </div>
      </div>

      {/* Threshold alerts block */}
      {activeAlerts > 0 && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 px-6 py-4 flex items-start gap-3 shadow-md">
          <AlertTriangle className="text-rose-400 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-sm text-rose-200">Critical Threshold Exceeded!</h4>
            <p className="text-xs text-rose-300/90 mt-0.5">
              There are currently {activeAlerts} cabinet(s) exceeding their configured power limits. Verify server workloads and layouts.
            </p>
          </div>
        </div>
      )}

      {/* Room summary breakdown */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-extrabold text-[#f5f5f4]">Room Status Matrix</h2>
          <Link
            href="/rooms"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
          >
            Manage Rooms <ArrowRight size={14} />
          </Link>
        </div>

        {roomSummaries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#24231f] bg-[#161512] p-8 text-center text-[#a3a39e] text-sm">
            No rooms created yet. Click "Manage Rooms" to add one.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#24231f] bg-[#161512] shadow-md">
            <table className="min-w-full divide-y divide-[#24231f] text-left text-sm">
              <thead className="bg-[#1b1915] text-[#a3a39e] text-xs font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Room Name</th>
                  <th className="px-6 py-4">Cabinet Count</th>
                  <th className="px-6 py-4">Power Draw</th>
                  <th className="px-6 py-4">Temp Limit</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24231f]/60">
                {roomSummaries.map((room) => {
                  const hasAlert = room.alertsCount > 0;
                  return (
                    <tr
                      key={room.id}
                      className="hover:bg-[#1b1915]/60 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 font-bold text-[#f5f5f4]">{room.name}</td>
                      <td className="px-6 py-4 text-[#a3a39e]">{room.racksCount} racks</td>
                      <td className="px-6 py-4 text-[#e5e5e0] font-mono">{room.powerDraw.toFixed(0)} W</td>
                      <td className="px-6 py-4 text-[#a3a39e] flex items-center gap-1">
                        <Thermometer size={14} className="text-amber-400" />
                        {room.tempThreshold}°C
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[0.65rem] font-mono font-extrabold uppercase border ${
                          hasAlert
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}>
                          <span className="relative flex h-2 w-2 shrink-0">
                            <span className={`radar-ring absolute inline-flex h-full w-full rounded-full opacity-75 ${hasAlert ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${hasAlert ? 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,1)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]'}`} />
                          </span>
                          {hasAlert ? `${room.alertsCount} Alert` : 'Optimal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/rooms/${room.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          View <ArrowRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
