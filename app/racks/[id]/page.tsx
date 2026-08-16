import { prisma } from '@/lib/prisma';
import RackLayout from '@/components/RackLayout';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { getCurrentUser } from '@/app/actions';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RackDetailPage({ params }: PageProps) {
  const { id } = await params;
  const rackId = parseInt(id);

  if (isNaN(rackId)) {
    notFound();
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // Restrict historical query to the last 10 minutes to prevent massive table scans
  const limitDate = new Date(Date.now() - 10 * 60 * 1000);

  const [rack, readings] = await Promise.all([
    prisma.rack.findUnique({
      where: { id: rackId },
      include: {
        room: true,
        servers: {
          include: {
            readings: {
              orderBy: { timestamp: 'desc' },
              take: 20,
            },
          },
          orderBy: { startUnit: 'asc' },
        },
      },
    }),
    prisma.powerReading.findMany({
      where: {
        server: {
          rackId: rackId,
          rack: {
            room: {
              userId: user.id
            }
          }
        },
        timestamp: {
          gte: limitDate,
        },
      },
      orderBy: { timestamp: 'asc' },
    }),
  ]);

  if (!rack || rack.room.userId !== user.id) {
    notFound();
  }

  // Calculate current power draw
  const currentPower = rack.servers.reduce((sum, server) => {
    const latestReading = server.readings[0];
    return sum + (latestReading ? latestReading.watts : 0);
  }, 0);

  const isOverLimit = currentPower > rack.powerLimitWatts;

  // Group readings by timestamp to sum total rack draw at each tick
  const readingsByTime: { [time: number]: number } = {};
  readings.forEach((r) => {
    const t = r.timestamp.getTime();
    readingsByTime[t] = (readingsByTime[t] || 0) + r.watts;
  });

  const chartData = Object.keys(readingsByTime)
    .map((timeStr) => {
      const time = parseInt(timeStr);
      return {
        timestamp: time,
        timeLabel: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        watts: parseFloat(readingsByTime[time].toFixed(1)),
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-20); // Keep last 20 readings

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pt-6 sm:pt-8 pb-2">
      {/* Back button and page header */}
      <div className="space-y-4">
        <Link
          href={`/rooms/${rack.roomId}`}
          className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#d4d4d0] hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Room: {rack.room.name}
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#f5f5f4]">
            {rack.name} Layout
          </h1>
          <p className="text-[#d4d4d0] text-sm sm:text-base font-medium mt-1">
            Visual cabinet mapping, power details, and server management.
          </p>
        </div>
      </div>

      {/* Critical Threshold Warning Banner */}
      {isOverLimit && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 px-6 py-4 flex items-start gap-3 shadow-md animate-pulse">
          <AlertTriangle className="text-rose-400 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-sm text-rose-200">Critical Power Threshold Exceeded!</h4>
            <p className="text-xs sm:text-sm text-rose-200 mt-0.5">
              The combined power draw of servers in this cabinet ({currentPower.toFixed(1)} W) is currently exceeding the configured power threshold of {rack.powerLimitWatts} W.
            </p>
          </div>
        </div>
      )}

      {/* Main rack view with client component interaction */}
      <RackLayout
        rackId={rack.id}
        totalUnits={rack.totalUnits}
        servers={rack.servers}
        powerLimitWatts={rack.powerLimitWatts}
        chartData={chartData}
      />
    </div>
  );
}
