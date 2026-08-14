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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 to-slate-950 bg-clip-text text-transparent">
            Rooms Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor and configure your data center rooms.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rooms List (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Active Rooms</h2>
          {rooms.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              No rooms created yet. Use the form to add one.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rooms.map((room) => {
                const totalServers = room.racks.reduce((acc, r) => acc + r.servers.length, 0);
                return (
                  <div
                    key={room.id}
                    className="group relative rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 hover:border-slate-350 p-5 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                          {room.name}
                        </h3>
                        <Tooltip content="Delete Room">
                          <DeleteConfirmButton
                            action={deleteRoom.bind(null, room.id)}
                            title="Delete Room"
                            message={`Are you sure you want to delete the room "${room.name}"? This will permanently remove the room, all of its rack cabinets, and all servers contained within.`}
                            tooltipText="Delete Room"
                            className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-all cursor-pointer"
                            iconSize={16}
                          />
                        </Tooltip>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Thermometer size={14} className="text-amber-600" />
                          <span>Threshold: <strong className="text-slate-700">{room.tempThresholdC}°C</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Server size={14} className="text-cyan-600" />
                          <span>
                            Racks: <strong className="text-slate-700">{room.racks.length}</strong> | Servers:{' '}
                            <strong className="text-slate-700">{totalServers}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                      <Link
                        href={`/rooms/${room.id}`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-cyan-600 hover:text-cyan-700 group/link transition-colors"
                      >
                        Manage Room
                        <ArrowRight size={14} className="group-hover/link:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Room Form (Right 1 col) */}
        <div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md sticky top-24">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-emerald-600" />
              Add New Room
            </h2>
            <form action={createRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Room Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Server Room Alpha"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Temp Threshold (°C)
                </label>
                <input
                  type="number"
                  name="tempThresholdC"
                  required
                  step="0.1"
                  defaultValue="25.0"
                  placeholder="e.g., 24.5"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 transition-colors"
                />
              </div>

              <SubmitButton
                className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold py-2 rounded-lg text-sm shadow-lg hover:shadow-emerald-950/20 transition-all cursor-pointer"
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
