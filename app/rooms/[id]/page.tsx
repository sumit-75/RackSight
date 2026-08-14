import { prisma } from '@/lib/prisma';
import { createRack, deleteRack, getCurrentUser } from '@/app/actions';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Thermometer, Zap, Server, Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import SubmitButton from '@/components/SubmitButton';
import Tooltip from '@/components/Tooltip';
import DeleteConfirmButton from '@/components/DeleteConfirmButton';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoomDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const roomId = parseInt(id);

  if (isNaN(roomId)) {
    notFound();
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const room = await prisma.room.findFirst({
    where: { 
      id: roomId,
      userId: user.id
    },
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
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!room) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Back navigation & Header */}
      <div className="space-y-4">
        <Link
          href="/rooms"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Rooms
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 to-slate-950 bg-clip-text text-transparent">
              {room.name}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Configuration and rack breakdown.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-5 py-3 w-fit shadow-sm">
            <div className="flex items-center gap-2">
              <Thermometer className="text-amber-600" size={18} />
              <div>
                <div className="text-[0.65rem] text-slate-500 uppercase tracking-wider font-semibold">Temp Limit</div>
                <div className="text-sm font-bold text-slate-800">{room.tempThresholdC}°C</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Racks List (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Racks in this Room</h2>
          {room.racks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              No racks created in this room yet. Use the form to add one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {room.racks.map((rack) => {
                // Calculate current power draw as sum of latest readings of its servers
                const currentPower = rack.servers.reduce((sum, server) => {
                  const latestReading = server.readings[0];
                  return sum + (latestReading ? latestReading.watts : 0);
                }, 0);

                const isOverLimit = currentPower > rack.powerLimitWatts;

                return (
                  <div
                    key={rack.id}
                    className={`group relative rounded-xl border p-5 flex flex-col justify-between transition-all duration-300 shadow-sm ${
                      isOverLimit
                        ? 'border-rose-200 bg-rose-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50/50 hover:border-slate-350 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                            {rack.name}
                          </h3>
                          {isOverLimit && (
                            <span className="inline-block mt-1 text-[0.6rem] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                              Power Exceeded
                            </span>
                          )}
                        </div>
                        <Tooltip content="Delete Rack">
                          <DeleteConfirmButton
                            action={deleteRack.bind(null, rack.id)}
                            title="Delete Rack"
                            message={`Are you sure you want to delete the rack cabinet "${rack.name}"? This will permanently remove the rack, all of its server slots, and all historical data for it.`}
                            tooltipText="Delete Rack"
                            className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-all cursor-pointer"
                            iconSize={16}
                          />
                        </Tooltip>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Server size={14} className="text-slate-400" />
                            Servers:
                          </span>
                          <strong className="text-slate-700">{rack.servers.length}</strong>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Zap size={14} className="text-amber-600" />
                            Power Limit:
                          </span>
                          <strong className="text-slate-700">{rack.powerLimitWatts} W</strong>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Zap size={14} className="text-emerald-600" />
                            Current Draw:
                          </span>
                          <strong className={isOverLimit ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                            {currentPower.toFixed(1)} W
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                      <Link
                        href={`/racks/${rack.id}`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-cyan-600 hover:text-cyan-700 group/link transition-colors"
                      >
                        Inspect Rack Layout
                        <ArrowRight size={14} className="group-hover/link:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Rack Form */}
        <div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md sticky top-24">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-emerald-600" />
              Add New Rack
            </h2>
            <form action={createRack} className="space-y-4">
              <input type="hidden" name="roomId" value={roomId} />

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Rack Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Rack A-10"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Total Units (U capacity)
                </label>
                <input
                  type="number"
                  name="totalUnits"
                  required
                  defaultValue="42"
                  placeholder="e.g., 42"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Power Limit (Watts)
                </label>
                <input
                  type="number"
                  name="powerLimitWatts"
                  required
                  placeholder="e.g., 3000"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 transition-colors"
                />
              </div>

              <SubmitButton
                className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold py-2 rounded-lg text-sm shadow-lg hover:shadow-emerald-950/20 transition-all cursor-pointer"
              >
                Create Rack
              </SubmitButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
