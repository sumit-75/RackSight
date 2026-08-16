import { prisma } from '@/lib/prisma';
import { createRoom, deleteRoom, getCurrentUser } from '@/app/actions';
import Link from 'next/link';
import { Server, Thermometer, Plus, Trash2, ArrowRight } from 'lucide-react';
import SubmitButton from '@/components/SubmitButton';
import Tooltip from '@/components/Tooltip';
import DeleteConfirmButton from '@/components/DeleteConfirmButton';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RoomsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const rooms = await prisma.room.findMany({
    where: { userId: user.id },
    include: {
      racks: {
        include: {
          servers: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pt-6 sm:pt-8 pb-2">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#f5f5f4]">
            Rooms Management
          </h1>
          <p className="text-[#d4d4d0] text-sm sm:text-base font-medium mt-1">
            Monitor and configure your data center rooms.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rooms List Section Panel */}
        <div className="lg:col-span-2 rounded-3xl border border-[#24231f] bg-[#141310]/90 p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-[#24231f]">
            <h2 className="text-lg font-extrabold text-[#f5f5f4] flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Active Rooms Categorized
            </h2>
            <span className="text-xs font-bold text-[#a3a39e] bg-[#1c1a16] border border-[#2e2c26] px-2.5 py-1 rounded-full">
              {rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'}
            </span>
          </div>

          {rooms.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#282620] bg-[#1c1a16] p-8 text-center text-[#d4d4d0] text-sm font-medium">
              No rooms created yet. Use the form to add one.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
              {rooms.map((room) => {
                const totalServers = room.racks.reduce((acc, r) => acc + r.servers.length, 0);
                return (
                  <div
                    key={room.id}
                    className="group relative rounded-2xl border border-[#2e2c26] bg-[#1a1915] hover:border-emerald-500/40 hover:bg-[#1e1c18] p-5.5 flex flex-col justify-between transition-all duration-300 shadow-md"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-base sm:text-lg font-extrabold text-[#f5f5f4] group-hover:text-emerald-400 transition-colors">
                          {room.name}
                        </h3>
                        <Tooltip content="Delete Room">
                          <DeleteConfirmButton
                            action={deleteRoom.bind(null, room.id)}
                            title="Delete Room"
                            message={`Are you sure you want to delete the room "${room.name}"? This will permanently remove the room, all of its rack cabinets, and all servers contained within.`}
                            tooltipText="Delete Room"
                            className="text-[#a3a39e] hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
                            iconSize={16}
                          />
                        </Tooltip>
                      </div>

                      <div className="mt-4 space-y-2.5">
                        <div className="flex items-center gap-2.5 text-sm text-[#d4d4d0] font-medium">
                          <Thermometer size={18} className="text-amber-400 shrink-0" />
                          <span>Threshold: <strong className="text-[#f5f5f4] font-bold">{room.tempThresholdC}°C</strong></span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-[#d4d4d0] font-medium">
                          <Server size={18} className="text-emerald-400 shrink-0" />
                          <span>
                            Racks: <strong className="text-[#f5f5f4] font-bold">{room.racks.length}</strong> | Servers:{' '}
                            <strong className="text-[#f5f5f4] font-bold">{totalServers}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#2e2c26] flex justify-end">
                      <Link
                        href={`/rooms/${room.id}`}
                        className="flex items-center gap-1.5 text-sm font-extrabold text-emerald-400 hover:text-emerald-300 group/link transition-colors"
                      >
                        Manage Room
                        <ArrowRight size={15} className="group-hover/link:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Room Form Section Panel */}
        <div>
          <div className="rounded-3xl border border-[#24231f] bg-[#141310]/90 p-6 sm:p-7 shadow-xl sticky top-24 space-y-5">
            <h2 className="text-lg font-extrabold text-[#f5f5f4] flex items-center gap-2 pb-2 border-b border-[#24231f]">
              <Plus size={18} className="text-emerald-400" />
              Add New Room
            </h2>
            <form action={createRoom} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-extrabold text-[#d4d4d0] uppercase tracking-wider mb-1.5">
                  Room Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Server Room Alpha"
                  className="w-full bg-[#1b1915] border border-[#282620] text-[#f5f5f4] rounded-xl px-3.5 py-2.5 text-sm placeholder-[#888680] focus:outline-none focus:border-emerald-500 transition-colors font-medium"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-extrabold text-[#d4d4d0] uppercase tracking-wider mb-1.5">
                  Temp Threshold (°C)
                </label>
                <input
                  type="number"
                  name="tempThresholdC"
                  required
                  step="0.1"
                  defaultValue="25.0"
                  placeholder="e.g., 24.5"
                  className="w-full bg-[#1b1915] border border-[#282620] text-[#f5f5f4] rounded-xl px-3.5 py-2.5 text-sm placeholder-[#888680] focus:outline-none focus:border-emerald-500 transition-colors font-medium"
                />
              </div>

              <SubmitButton
                className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm shadow-md transition-all cursor-pointer"
              >
                Create Room
              </SubmitButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
