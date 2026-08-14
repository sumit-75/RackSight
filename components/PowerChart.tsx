'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface ChartPoint {
  timestamp: number;
  timeLabel: string;
  watts: number;
}

interface PowerChartProps {
  data: ChartPoint[];
  limit: number;
  title?: string;
  subtitle?: string;
}

export default function PowerChart({ data, limit, title, subtitle }: PowerChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-64 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 text-xs">
        Loading chart metrics...
      </div>
    );
  }

  const displayTitle = title || "Power Consumption History";
  const displaySubtitle = subtitle || "Sum of server draw over recent updates";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-md space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-sm text-slate-900">{displayTitle}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{displaySubtitle}</p>
        </div>
        <span className="text-[0.65rem] uppercase font-mono font-bold tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          Limit: {limit}W
        </span>
      </div>

      <div className="h-64 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
            No readings recorded yet. Wait for simulation ticks.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} style={{ fontFamily: 'var(--font-sans)' }}>
              <defs>
                <linearGradient id="colorWatts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#24231f" opacity={0.6} />
              <XAxis
                dataKey="timeLabel"
                stroke="#a3a39e"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#a3a39e"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}W`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161512',
                  borderColor: '#24231f',
                  borderRadius: '8px',
                  color: '#f5f5f4',
                  fontSize: '11px',
                  fontFamily: 'var(--font-sans)',
                }}
                labelStyle={{ fontWeight: 'bold', color: '#a3a39e' }}
              />
              <Area
                type="monotone"
                dataKey="watts"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorWatts)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
