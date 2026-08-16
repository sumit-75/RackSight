'use client';

import React, { useState } from 'react';
import {
  Zap,
  Server as ServerIcon,
  AlertTriangle,
  RefreshCw,
  Lock,
  Terminal,
  Activity,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface SimulatedSlot {
  u: number;
  name: string;
  shelf: 'Upper' | 'Middle' | 'Lower';
  status: 'active' | 'spike' | 'idle' | 'empty';
  watts: number;
}

const initialSlots: SimulatedSlot[] = [
  { u: 42, name: 'Core Router A1', shelf: 'Upper', status: 'active', watts: 180 },
  { u: 40, name: 'Spine Switch 01', shelf: 'Upper', status: 'active', watts: 140 },
  { u: 38, name: 'Storage Array X', shelf: 'Upper', status: 'idle', watts: 65 },
  { u: 30, name: 'Web Node 01', shelf: 'Middle', status: 'active', watts: 210 },
  { u: 28, name: 'Web Node 02', shelf: 'Middle', status: 'active', watts: 215 },
  { u: 24, name: 'AI Compute GPU 1', shelf: 'Middle', status: 'spike', watts: 410 },
  { u: 20, name: 'Cache Cluster 01', shelf: 'Middle', status: 'empty', watts: 0 },
  { u: 14, name: 'Database Primary', shelf: 'Lower', status: 'active', watts: 290 },
  { u: 12, name: 'Database Replica', shelf: 'Lower', status: 'active', watts: 275 },
  { u: 8, name: 'Telemetry Proxy', shelf: 'Lower', status: 'idle', watts: 45 },
  { u: 4, name: 'Backup Power Unit', shelf: 'Lower', status: 'empty', watts: 0 },
];

export default function InteractiveRackDemo() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'analytics' | 'logs'>('matrix');
  const [slots, setSlots] = useState<SimulatedSlot[]>(initialSlots);
  const [selectedSlot, setSelectedSlot] = useState<SimulatedSlot | null>(initialSlots[3]);

  // Calculate live total power
  const totalWatts = slots.reduce((acc, s) => acc + s.watts, 0);
  const powerLimit = 1500;
  const isOverLimit = totalWatts > powerLimit;
  const hasSpike = slots.some((s) => s.status === 'spike');

  const toggleSlotStatus = (u: number) => {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.u === u) {
          let nextStatus: SimulatedSlot['status'] = 'active';
          let nextWatts = 220;
          if (s.status === 'active') {
            nextStatus = 'spike';
            nextWatts = 420;
          } else if (s.status === 'spike') {
            nextStatus = 'idle';
            nextWatts = 50;
          } else if (s.status === 'idle') {
            nextStatus = 'empty';
            nextWatts = 0;
          } else {
            nextStatus = 'active';
            nextWatts = 190;
          }
          const updated = { ...s, status: nextStatus, watts: nextWatts };
          if (selectedSlot?.u === u) setSelectedSlot(updated);
          return updated;
        }
        return s;
      })
    );
  };

  const triggerGlobalSpike = () => {
    setSlots((prev) =>
      prev.map((s) =>
        s.status !== 'empty'
          ? { ...s, status: 'spike', watts: Math.floor(380 + Math.random() * 80) }
          : s
      )
    );
  };

  const resetNormalLoad = () => {
    setSlots(initialSlots);
    setSelectedSlot(initialSlots[3]);
  };

  return (
    <div className="rounded-3xl border border-[#282620]/80 bg-[#141310]/75 backdrop-blur-2xl shadow-2xl shadow-black/90 font-sans overflow-hidden transition-all duration-300">
      {/* macOS Window Top TitleBar */}
      <div className="bg-[#1b1915]/70 backdrop-blur-xl border-b border-[#282620]/80 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* macOS Traffic Lights (Top Left) */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] block shadow-sm hover:opacity-80 transition-opacity cursor-pointer"></span>
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] block shadow-sm hover:opacity-80 transition-opacity cursor-pointer"></span>
          <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] block shadow-sm hover:opacity-80 transition-opacity cursor-pointer"></span>
        </div>

        {/* macOS URL Address Bar (Center) */}
        <div className="flex items-center gap-2 bg-[#12110e]/80 border border-[#282620] px-4 py-1 rounded-full text-xs text-[#a3a39e] font-sans font-bold shadow-inner">
          <Lock size={12} className="text-emerald-400 shrink-0" />
          <span>racksight://cabinet-matrix-sandbox</span>
        </div>

        {/* Action Controls (Top Right) */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerGlobalSpike}
            className="text-rose-400 hover:text-rose-300 text-xs py-1 h-7 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20"
          >
            <AlertTriangle size={13} className="mr-1" />
            Spike Load
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetNormalLoad}
            className="text-[#a3a39e] hover:text-white text-xs py-1 h-7 hover:bg-white/5"
          >
            <RefreshCw size={13} className="mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* macOS Window Tab Bar */}
      <div className="bg-[#181714]/60 backdrop-blur-lg border-b border-[#282620]/80 px-4 sm:px-6 pt-2.5 flex items-center gap-2 overflow-x-auto select-none">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-extrabold transition-all cursor-pointer border-t border-x ${
            activeTab === 'matrix'
              ? 'bg-[#161512]/90 backdrop-blur-md text-white border-[#2e2d27] border-t-emerald-400 shadow-lg'
              : 'bg-[#1b1915]/40 backdrop-blur-sm text-[#a3a39e] border-transparent hover:text-white hover:bg-[#1b1915]/70'
          }`}
        >
          <ServerIcon size={14} className={activeTab === 'matrix' ? 'text-emerald-400' : ''} />
          <span>Cabinet Matrix (U42)</span>
          <Badge variant="emerald" className="ml-1 text-[0.6rem] px-1.5 py-0">Live</Badge>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-extrabold transition-all cursor-pointer border-t border-x ${
            activeTab === 'analytics'
              ? 'bg-[#161512]/90 backdrop-blur-md text-emerald-400 border-[#2e2d27] border-t-emerald-400 shadow-lg'
              : 'bg-[#1b1915]/40 backdrop-blur-sm text-[#a3a39e] border-transparent hover:text-white hover:bg-[#1b1915]/70'
          }`}
        >
          <Zap size={14} />
          <span>Power Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-extrabold transition-all cursor-pointer border-t border-x ${
            activeTab === 'logs'
              ? 'bg-[#161512]/90 backdrop-blur-md text-[#e5e5e0] border-[#2e2d27] border-t-emerald-400 shadow-lg'
              : 'bg-[#1b1915]/40 backdrop-blur-sm text-[#a3a39e] border-transparent hover:text-white hover:bg-[#1b1915]/70'
          }`}
        >
          <Terminal size={14} />
          <span>Telemetry Stream</span>
        </button>
      </div>

      {/* Main Tab Content Area */}
      <div className="p-6 sm:p-8 bg-[#12110e]/65 backdrop-blur-xl">
        {activeTab === 'matrix' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Grid: Left Cabinet Layout, Right Live Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Cabinet Slot View (7 cols) */}
              <div className="lg:col-span-7 space-y-4 bg-[#161512] border border-[#24231f] rounded-2xl p-5">
                <div className="flex justify-between items-center text-xs font-extrabold text-[#a3a39e]">
                  <span>42U Cabinet Physical Slots</span>
                  <span className="flex items-center gap-2 text-emerald-400">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="radar-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
                    </span>
                    Polling Active
                  </span>
                </div>

                <div className="space-y-2">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot?.u === slot.u;
                    let statusBg = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 hover:text-white';
                    let dotColor = 'bg-emerald-400';

                    if (slot.status === 'spike') {
                      statusBg = 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse hover:bg-rose-500/30 hover:text-white';
                      dotColor = 'bg-rose-500';
                    } else if (slot.status === 'idle') {
                      statusBg = 'bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20 hover:text-white';
                      dotColor = 'bg-amber-400';
                    } else if (slot.status === 'empty') {
                      statusBg = 'bg-[#1b1915] border-[#24231f] text-[#73726c] hover:bg-[#201e19] hover:text-[#a3a39e]';
                      dotColor = 'bg-[#73726c]';
                    }

                    return (
                      <button
                        key={slot.u}
                        onClick={() => {
                          toggleSlotStatus(slot.u);
                          setSelectedSlot(slot);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-xs cursor-pointer ${statusBg} ${
                          isSelected ? 'ring-1 ring-emerald-500/50 scale-[1.01]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-[#73726c] w-8">U{slot.u}</span>
                          <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                          <span className="font-extrabold text-[#f5f5f4] text-left">{slot.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[#e5e5e0] font-extrabold">{slot.watts} W</span>
                          <span className="uppercase text-[0.6rem] font-extrabold px-2 py-0.5 rounded bg-[#0e0d09] border border-[#24231f]">
                            {slot.status}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Live Meter & Inspector (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                {/* Power Draw Meter */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  isOverLimit || hasSpike
                    ? 'border-rose-500/40 bg-rose-500/5'
                    : 'border-[#24231f] bg-[#161512]'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[0.65rem] uppercase font-bold text-[#a3a39e] tracking-wider">Cabinet Power Draw</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className={`text-3xl font-black ${isOverLimit || hasSpike ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {totalWatts} W
                        </span>
                        <span className="text-xs text-[#a3a39e]">/ {powerLimit} W Limit</span>
                      </div>
                    </div>
                    <div className={`p-2.5 rounded-xl border ${
                      isOverLimit || hasSpike ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                      <Zap size={20} />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="w-full h-2.5 bg-[#201e19] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isOverLimit || hasSpike ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-emerald-400 to-teal-400'
                        }`}
                        style={{ width: `${Math.min(100, (totalWatts / powerLimit) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[0.65rem] font-extrabold text-[#a3a39e]">
                      <span>0 W</span>
                      <span>{(totalWatts / powerLimit * 100).toFixed(0)}% Utilized</span>
                      <span>{powerLimit} W</span>
                    </div>
                  </div>
                </div>

                {/* Selected Slot Details */}
                {selectedSlot && (
                  <div className="p-5 rounded-2xl border border-[#24231f] bg-[#161512] space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={selectedSlot.status === 'spike' ? 'rose' : selectedSlot.status === 'active' ? 'emerald' : 'secondary'}>
                        U{selectedSlot.u} Inspection
                      </Badge>
                      <span className="text-xs font-bold text-[#a3a39e]">{selectedSlot.shelf} Shelf</span>
                    </div>
                    <h4 className="font-extrabold text-base text-[#f5f5f4]">{selectedSlot.name}</h4>

                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-3 rounded-xl bg-[#1b1915] border border-[#24231f]">
                        <div className="text-[0.65rem] text-[#a3a39e] font-semibold">Live Power</div>
                        <div className="font-extrabold text-[#f5f5f4] mt-0.5">{selectedSlot.watts} Watts</div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#1b1915] border border-[#24231f]">
                        <div className="text-[0.65rem] text-[#a3a39e] font-semibold">Status</div>
                        <div className="font-extrabold uppercase text-[#f5f5f4] mt-0.5">{selectedSlot.status}</div>
                      </div>
                    </div>
                    <p className="text-[0.7rem] text-[#a3a39e] italic">
                      * Click any slot on the matrix to toggle status & simulate real-time telemetry updates.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-[#24231f] bg-[#161512]">
                <span className="text-xs text-[#a3a39e] font-bold uppercase tracking-wider">Active Nodes</span>
                <div className="text-3xl font-black text-emerald-400 mt-1">
                  {slots.filter((s) => s.status === 'active').length}
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-[#24231f] bg-[#161512]">
                <span className="text-xs text-[#a3a39e] font-bold uppercase tracking-wider">Spike Alerts</span>
                <div className="text-3xl font-black text-rose-400 mt-1">
                  {slots.filter((s) => s.status === 'spike').length}
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-[#24231f] bg-[#161512]">
                <span className="text-xs text-[#a3a39e] font-bold uppercase tracking-wider">Available U-Slots</span>
                <div className="text-3xl font-black text-emerald-400 mt-1">
                  {slots.filter((s) => s.status === 'empty').length}
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-[#24231f] bg-[#161512] space-y-4">
              <h4 className="font-extrabold text-base text-[#f5f5f4] flex items-center gap-2">
                <Activity size={18} className="text-emerald-400" />
                Live Power Breakdown by Shelf
              </h4>
              <div className="space-y-3">
                {['Upper', 'Middle', 'Lower'].map((shelf) => {
                  const shelfSlots = slots.filter((s) => s.shelf === shelf);
                  const shelfWatts = shelfSlots.reduce((acc, s) => acc + s.watts, 0);
                  return (
                    <div key={shelf} className="p-4 rounded-xl bg-[#1b1915] border border-[#24231f] flex justify-between items-center">
                      <div>
                        <div className="font-extrabold text-sm text-[#f5f5f4]">{shelf} Shelf Array</div>
                        <div className="text-xs text-[#a3a39e]">{shelfSlots.length} Monitored Slots</div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-extrabold text-emerald-400">{shelfWatts} W</div>
                        <div className="text-[0.65rem] text-[#a3a39e]">{(shelfWatts / (totalWatts || 1) * 100).toFixed(0)}% of Total Load</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="p-6 rounded-2xl border border-[#24231f] bg-[#161512] space-y-4 font-mono text-xs animate-in fade-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-[#24231f] text-[#a3a39e]">
              <span className="flex items-center gap-2 font-bold">
                <Terminal size={15} className="text-[#a3a39e]" />
                telemetry-stream.log
              </span>
              <Badge variant="emerald">Streaming Live</Badge>
            </div>
            <div className="space-y-2 text-[#a3a39e] leading-relaxed">
              <div className="text-emerald-400">[INFO] Telemetry engine initialized at ws://127.0.0.1:8080/stream</div>
              <div>[TICK] Cabinet R-01 Total Draw: <span className="text-[#f5f5f4] font-bold">{totalWatts}W</span> / {powerLimit}W Limit</div>
              {hasSpike ? (
                <div className="text-rose-400 font-bold animate-pulse">
                  [WARN] Critical Power Spike detected on U24 (AI Compute GPU 1) — Load 410W
                </div>
              ) : (
                <div className="text-emerald-400">[OK] All slot workloads operating within nominal thresholds.</div>
              )}
              {slots.map((s) => (
                <div key={`log-${s.u}`}>
                  [SLOT U{s.u}] {s.name} — Status: <span className="font-bold text-[#f5f5f4]">{s.status.toUpperCase()}</span> ({s.watts}W)
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
