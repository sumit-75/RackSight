import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Server, Zap, AlertTriangle, Layers, Thermometer, ArrowRight, Activity } from 'lucide-react';
import { getCurrentUser } from '@/app/actions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 to-slate-950 bg-clip-text text-transparent flex items-center gap-3">
          <Activity className="text-cyan-600" size={32} />
          RackSight Overview
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Infrastructure health, power utilization, and active threshold monitoring.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Rooms */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[0.65rem] uppercase text-slate-500 font-semibold tracking-wider">Total Rooms</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalRooms}</div>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.15)] flex items-center justify-center">
            <Layers size={20} className="text-purple-400" />
          </div>
        </div>

        {/* Total Racks */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[0.65rem] uppercase text-slate-500 font-semibold tracking-wider">Active Racks</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalRacks}</div>
          </div>
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)] flex items-center justify-center">
            <Server size={20} className="text-cyan-400" />
          </div>
        </div>

        {/* Total Power Draw */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[0.65rem] uppercase text-slate-500 font-semibold tracking-wider">Total Power Draw</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{totalPowerDraw.toFixed(0)} W</div>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)] flex items-center justify-center">
            <Zap size={20} className="text-emerald-400" />
          </div>
        </div>

        {/* Active Threshold Alerts */}
        <div className={`rounded-xl border p-5 flex items-center justify-between shadow-sm ${
          activeAlerts > 0
            ? 'border-rose-500/30 bg-white shadow-sm'
            : 'border-slate-200 bg-white'
        }`}>
          <div>
            <span className="text-[0.65rem] uppercase text-slate-500 font-semibold tracking-wider">Active Alerts</span>
            <div className={`text-2xl font-black mt-1 ${activeAlerts > 0 ? 'text-rose-400' : 'text-slate-900'}`}>
              {activeAlerts}
            </div>
          </div>
          <div className={`p-3 rounded-xl border flex items-center justify-center ${
            activeAlerts > 0
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
              : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
          }`}>
            <AlertTriangle size={20} className={activeAlerts > 0 ? 'text-rose-400' : 'text-slate-400'} />
          </div>
        </div>
      </div>

      {/* Threshold alerts block */}
      {activeAlerts > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-800 px-5 py-4 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-sm">Critical Threshold Exceeded!</h4>
            <p className="text-xs text-rose-700 mt-0.5">
              There are currently {activeAlerts} cabinet(s) exceeding their configured power limits. Verify server workloads and layouts.
            </p>
          </div>
        </div>
      )}

      {/* Room summary breakdown */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Room Status Matrix</h2>
          <Link
            href="/rooms"
            className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition-colors flex items-center gap-1"
          >
            Manage Rooms <ArrowRight size={14} />
          </Link>
        </div>

        {roomSummaries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
            No rooms created yet. Click "Manage Rooms" to add one.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Room Name</th>
                  <th className="px-6 py-4">Cabinet Count</th>
                  <th className="px-6 py-4">Power Draw</th>
                  <th className="px-6 py-4">Temp Limit</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {roomSummaries.map((room) => {
                  const hasAlert = room.alertsCount > 0;
                  return (
                    <tr
                      key={room.id}
                      className="hover:bg-slate-50/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 font-bold text-slate-900">{room.name}</td>
                      <td className="px-6 py-4 text-slate-650">{room.racksCount} racks</td>
                      <td className="px-6 py-4 text-slate-700 font-mono">{room.powerDraw.toFixed(0)} W</td>
                      <td className="px-6 py-4 text-slate-600 flex items-center gap-1">
                        <Thermometer size={14} className="text-amber-600" />
                        {room.tempThreshold}°C
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[0.65rem] font-extrabold uppercase border ${
                          hasAlert
                            ? 'bg-rose-50 text-rose-600 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${hasAlert ? 'bg-rose-600' : 'bg-emerald-600'}`}></span>
                          {hasAlert ? `${room.alertsCount} Alert` : 'Optimal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/rooms/${room.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition-colors"
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
