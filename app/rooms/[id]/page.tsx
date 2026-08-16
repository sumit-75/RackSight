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
    <div className="space-y-8 font-sans max-w-7xl mx-auto pt-6 sm:pt-8 pb-2">
      {/* Back navigation & Header */}
      <div className="space-y-4">
        <Link
          href="/rooms"
          className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#d4d4d0] hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Rooms
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#f5f5f4]">
              {room.name}
            </h1>
            <p className="text-[#d4d4d0] text-sm sm:text-base font-medium mt-1">
              Configuration and rack breakdown.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-[#161512] border border-[#24231f] rounded-2xl px-5 py-3 w-fit shadow-md">
            <div className="flex items-center gap-2">
              <Thermometer className="text-amber-400" size={18} />
              <div>
                <div className="text-xs text-[#d4d4d0] uppercase tracking-wider font-extrabold">Temp Limit</div>
                <div className="text-sm font-bold text-[#f5f5f4]">{room.tempThresholdC}°C</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Racks List (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-extrabold text-[#f5f5f4]">Racks in this Room</h2>
          {room.racks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#24231f] bg-[#161512] p-8 text-center text-[#d4d4d0] text-sm font-medium">
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
                    className={`group relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 shadow-md ${
                      isOverLimit
                        ? 'border-rose-500/40 bg-rose-500/10 shadow-rose-950/20'
                        : 'border-[#24231f] bg-[#161512] hover:bg-[#191814] hover:border-[#383630]'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base sm:text-lg font-extrabold text-[#f5f5f4] group-hover:text-emerald-400 transition-colors">
                            {rack.name}
                          </h3>
                          {isOverLimit && (
                            <span className="inline-block mt-1 text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
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
                            className="text-[#a3a39e] hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
                            iconSize={16}
                          />
                        </Tooltip>
                      </div>

                      <div className="mt-4 space-y-2.5">
                        <div className="flex items-center justify-between text-sm text-[#d4d4d0] font-medium">
                          <span className="flex items-center gap-1.5">
                            <Server size={15} className="text-[#d4d4d0]" />
                            Servers:
                          </span>
                          <strong className="text-[#f5f5f4] font-bold">{rack.servers.length}</strong>
                        </div>
                        <div className="flex items-center justify-between text-sm text-[#d4d4d0] font-medium">
                          <span className="flex items-center gap-1.5">
                            <Zap size={15} className="text-amber-400" />
                            Power Limit:
                          </span>
                          <strong className="text-[#f5f5f4] font-bold">{rack.powerLimitWatts} W</strong>
                        </div>
                        <div className="flex items-center justify-between text-sm text-[#d4d4d0] font-medium">
                          <span className="flex items-center gap-1.5">
                            <Zap size={15} className="text-emerald-400" />
                            Current Draw:
                          </span>
                          <strong className={isOverLimit ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                            {currentPower.toFixed(1)} W
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#24231f] flex justify-end">
                      <Link
                        href={`/racks/${rack.id}`}
                        className="flex items-center gap-1.5 text-sm font-extrabold text-emerald-400 hover:text-emerald-300 group/link transition-colors"
                      >
                        Inspect Rack Layout
                        <ArrowRight size={15} className="group-hover/link:translate-x-0.5 transition-transform" />
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
          <div className="rounded-2xl border border-[#24231f] bg-[#161512] p-6 shadow-md sticky top-24">
            <h2 className="text-lg font-extrabold text-[#f5f5f4] mb-4 flex items-center gap-2">
              <Plus size={18} className="text-emerald-400" />
              Add New Rack
            </h2>
            <form action={createRack} className="space-y-4">
              <input type="hidden" name="roomId" value={roomId} />

              <div>
                <label className="block text-xs sm:text-sm font-extrabold text-[#d4d4d0] uppercase tracking-wider mb-1.5">
                  Rack Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Rack A-10"
                  className="w-full bg-[#1b1915] border border-[#282620] text-[#f5f5f4] rounded-xl px-3.5 py-2.5 text-sm placeholder-[#888680] focus:outline-none focus:border-emerald-500 transition-colors font-medium"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-extrabold text-[#d4d4d0] uppercase tracking-wider mb-1.5">
                  Total Units (U capacity)
                </label>
                <input
                  type="number"
                  name="totalUnits"
                  required
                  defaultValue="42"
                  placeholder="e.g., 42"
                  className="w-full bg-[#1b1915] border border-[#282620] text-[#f5f5f4] rounded-xl px-3.5 py-2.5 text-sm placeholder-[#888680] focus:outline-none focus:border-emerald-500 transition-colors font-medium"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-extrabold text-[#d4d4d0] uppercase tracking-wider mb-1.5">
                  Power Limit (Watts)
                </label>
                <input
                  type="number"
                  name="powerLimitWatts"
                  required
                  placeholder="e.g., 3000"
                  className="w-full bg-[#1b1915] border border-[#282620] text-[#f5f5f4] rounded-xl px-3.5 py-2.5 text-sm placeholder-[#888680] focus:outline-none focus:border-emerald-500 transition-colors font-medium"
                />
              </div>

              <SubmitButton
                className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm shadow-md transition-all cursor-pointer"
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
