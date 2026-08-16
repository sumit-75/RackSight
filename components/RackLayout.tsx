'use client';

import React, { useState, useEffect } from 'react';
import { Server, ServerStatus, PowerReading } from '@prisma/client';
import { createServer, updateServer, deleteServer } from '@/app/actions';
import { Trash2, Edit, Plus, X, Zap, Cpu, Server as ServerIcon, AlertTriangle, Layers, Database, XCircle, CheckCircle2, ShieldCheck, Activity, HardDrive } from 'lucide-react';
import PowerChart from './PowerChart';
import LineLoader from './LineLoader';
import Tooltip from './Tooltip';
import ConfirmDialog from './ConfirmDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/Select';

interface ServerWithReadings extends Server {
  readings: PowerReading[];
}

interface ChartPoint {
  timestamp: number;
  timeLabel: string;
  watts: number;
}

interface RackLayoutProps {
  rackId: number;
  totalUnits: number;
  servers: ServerWithReadings[];
  powerLimitWatts: number;
  chartData: ChartPoint[];
}

export default function RackLayout({
  rackId,
  totalUnits,
  servers,
  powerLimitWatts,
  chartData,
}: RackLayoutProps) {
  const [selectedServer, setSelectedServer] = useState<ServerWithReadings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localServers, setLocalServers] = useState(servers);
  const [deleteServerId, setDeleteServerId] = useState<number | null>(null);

  useEffect(() => {
    setLocalServers(servers);
  }, [servers]);

  // Form values
  const [formName, setFormName] = useState('');
  const [formStartUnit, setFormStartUnit] = useState<number>(1);
  const [formSizeUnits, setFormSizeUnits] = useState<number>(1);
  const [formStatus, setFormStatus] = useState<ServerStatus>('active');

  // Calculate current power draw
  const totalPower = localServers.reduce((sum, s) => {
    const latest = s.readings[0];
    return sum + (latest ? latest.watts : 0);
  }, 0);

  const isOverLimit = totalPower > powerLimitWatts;

  // Build occupancy map to trace which server sits in which U-slot
  const occupancyMap: { [uSlot: number]: ServerWithReadings } = {};
  localServers.forEach((server) => {
    for (let i = 0; i < server.sizeUnits; i++) {
      occupancyMap[server.startUnit + i] = server;
    }
  });

  // Handle clicking empty slot to auto-fill "Add Server" form
  const handleEmptySlotClick = (u: number) => {
    setSelectedServer(null);
    setIsEditing(false);
    setFormName('');
    setFormStartUnit(u);
    setFormSizeUnits(1);
    setFormStatus('active');
    setErrorMsg(null);
  };

  // Handle clicking server to inspect
  const handleServerClick = (server: ServerWithReadings) => {
    setSelectedServer(server);
    setIsEditing(false);
    setFormName(server.name);
    setFormStartUnit(server.startUnit);
    setFormSizeUnits(server.sizeUnits);
    setFormStatus(server.status);
    setErrorMsg(null);
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const newServer = await createServer(formData);
      const newServerWithReadings: ServerWithReadings = {
        ...newServer,
        readings: [],
      };
      setLocalServers((prev) => [...prev, newServerWithReadings]);
      // Reset form
      setFormName('');
      setFormStartUnit(1);
      setFormSizeUnits(1);
      setFormStatus('active');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedServer) return;
    setErrorMsg(null);
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await updateServer(selectedServer.id, formData);
      const name = formData.get('name') as string;
      const startUnit = parseInt(formData.get('startUnit') as string);
      const sizeUnits = parseInt(formData.get('sizeUnits') as string);
      const status = formData.get('status') as ServerStatus;

      const updatedServer: ServerWithReadings = {
        ...selectedServer,
        name,
        startUnit,
        sizeUnits,
        status,
      };

      setLocalServers((prev) =>
        prev.map((s) => (s.id === selectedServer.id ? updatedServer : s))
      );
      setSelectedServer(updatedServer);
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update server');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerDeleteConfirm = (serverId: number) => {
    setDeleteServerId(serverId);
  };

  const handleConfirmDelete = async () => {
    if (deleteServerId === null) return;
    const serverId = deleteServerId;
    setDeleteServerId(null);
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await deleteServer(serverId);
      setLocalServers((prev) => prev.filter((s) => s.id !== serverId));
      setSelectedServer(null);
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete server');
    } finally {
      setIsLoading(false);
    }
  };

  // Render slots from top (totalUnits) down to 1
  const renderedSlots = [];
  let skipCount = 0;
  
  for (let u = totalUnits; u >= 1; u--) {
    const server = occupancyMap[u];
    
    if (server) {
      // Since we go from top to bottom, we only render the server block at its top-most slot (startUnit + sizeUnits - 1)
      const topSlotOfServer = server.startUnit + server.sizeUnits - 1;
      if (u === topSlotOfServer) {
        renderedSlots.push({
          type: 'server',
          u,
          server,
          size: server.sizeUnits,
        });
      }
    } else {
      renderedSlots.push({
        type: 'empty',
        u,
      });
    }
  }

  // Stats calculations
  const totalServers = localServers.length;
  const onlineServers = localServers.filter(s => s.status === 'active' && s.readings[0]?.watts <= 350 && s.readings[0]?.watts > 0).length;
  const warningServers = localServers.filter(s => s.status === 'idle' || (s.status === 'active' && s.readings[0]?.watts === 0)).length;
  const offlineServers = localServers.filter(s => s.status === 'decommissioned' || (s.status === 'active' && s.readings[0]?.watts > 350) || !s.readings[0]).length;

  const shelves = [
    {
      name: 'Upper Shelf',
      range: 'U29 - U42',
      startU: 29,
      endU: 42,
      color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.15)]',
      icon: <Layers size={18} className="text-cyan-400" />,
    },
    {
      name: 'Middle Shelf',
      range: 'U15 - U28',
      startU: 15,
      endU: 28,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_8px_rgba(168,85,247,0.15)]',
      icon: <Database size={18} className="text-purple-400" />,
    },
    {
      name: 'Lower Shelf',
      range: 'U1 - U14',
      startU: 1,
      endU: 14,
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
      icon: <Cpu size={18} className="text-amber-400" />,
    },
  ];

  const renderShelfBlocks = (startU: number, endU: number) => {
    const blocks = [];
    // We render slots from top of the shelf down to bottom for physical cabinet accuracy
    for (let u = endU; u >= startU; u--) {
      const server = occupancyMap[u];
      blocks.push({ u, server });
    }

    return (
      <div className="flex flex-wrap gap-1.5 justify-end">
        {blocks.map(({ u, server }) => {
          if (server) {
            const status = server.status;
            const latestReading = server.readings[0];
            const watts = latestReading ? latestReading.watts : 0;
            
            const isPowerSpike = status === 'active' && watts > 350.0;
            const isPowerDrop = status === 'active' && watts === 0.0;

            let colorClass = 'bg-emerald-500 border-emerald-400/50 hover:bg-emerald-400 text-white';
            if (isPowerSpike) {
              colorClass = 'bg-rose-500 border-rose-455/55 hover:bg-rose-450 text-white animate-pulse ring-2 ring-rose-500/30';
            } else if (isPowerDrop || status === 'idle') {
              colorClass = 'bg-amber-500 border-amber-400/50 hover:bg-amber-400 text-white';
            } else if (status === 'decommissioned') {
              colorClass = 'bg-slate-400 border-slate-350 hover:bg-slate-350 text-slate-200';
            }

            const isSelected = selectedServer?.id === server.id;

            return (
              <Tooltip
                key={`block-${u}`}
                content={
                  <div className="space-y-0.5 text-left">
                    <div className="font-bold text-slate-900">{server.name}</div>
                    <div className="text-[0.65rem] text-slate-500">
                      Slot: U{server.startUnit} - U{server.startUnit + server.sizeUnits - 1} ({server.sizeUnits}U)
                    </div>
                    <div className="text-[0.65rem] text-slate-500">
                      Status: <span className="font-bold">{status}</span>
                    </div>
                    <div className="text-[0.65rem] text-slate-500">
                      Power: <span className="font-mono font-bold">{watts.toFixed(0)}W</span>
                    </div>
                    {isPowerSpike && <span className="block text-rose-500 font-bold">⚠️ CRITICAL POWER SPIKE</span>}
                    {isPowerDrop && <span className="block text-amber-550 font-bold">⚠️ CRITICAL POWER DROP</span>}
                  </div>
                }
              >
                <button
                  onClick={() => handleServerClick(server)}
                  className={`w-6 h-6 rounded-[4px] border transition-all cursor-pointer ${colorClass} ${
                    isSelected ? 'ring-2 ring-cyan-500 scale-110 shadow-md' : ''
                  }`}
                  aria-label={`Server ${server.name} at slot U${u}`}
                />
              </Tooltip>
            );
          } else {
            // Empty slot (grey block)
            return (
              <Tooltip
                key={`block-empty-${u}`}
                content={
                  <div className="text-left text-xs">
                    <div className="font-bold text-slate-900">Empty Slot U{u}</div>
                    <div className="text-slate-500">Click to mount server here</div>
                  </div>
                }
              >
                <button
                  onClick={() => handleEmptySlotClick(u)}
                  className="w-6 h-6 rounded-[4px] bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
                  aria-label={`Empty slot U${u}`}
                />
              </Tooltip>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {isLoading && <LineLoader />}

      {/* Stats Cards Section */}
      <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Servers */}
        <div className="rounded-2xl border border-[#24231f] bg-[#161512] p-4 flex items-center justify-between shadow-md">
          <div>
            <span className="text-[0.65rem] uppercase text-[#a3a39e] font-extrabold tracking-wider">Total Servers</span>
            <div className="text-2xl font-extrabold text-[#f5f5f4] mt-1">{totalServers}</div>
          </div>
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)] flex items-center justify-center">
            <ServerIcon size={20} className="text-cyan-400" />
          </div>
        </div>

        {/* Online Servers */}
        <div className="rounded-2xl border border-[#24231f] bg-[#161512] p-4 flex items-center justify-between shadow-md">
          <div>
            <span className="text-[0.65rem] uppercase text-[#a3a39e] font-extrabold tracking-wider">Online</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{onlineServers}</div>
          </div>
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)] flex items-center justify-center">
            <CheckCircle2 size={20} className="text-emerald-400" />
          </div>
        </div>

        {/* Warning Servers */}
        <div className="rounded-2xl border border-[#24231f] bg-[#161512] p-4 flex items-center justify-between shadow-md">
          <div>
            <span className="text-[0.65rem] uppercase text-[#a3a39e] font-extrabold tracking-wider">Warning</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">{warningServers}</div>
          </div>
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)] flex items-center justify-center">
            <AlertTriangle size={20} className="text-amber-400" />
          </div>
        </div>

        {/* Offline / Faulty Servers */}
        <div className="rounded-2xl border border-[#24231f] bg-[#161512] p-4 flex items-center justify-between shadow-md">
          <div>
            <span className="text-[0.65rem] uppercase text-[#a3a39e] font-extrabold tracking-wider">Offline / Faulty</span>
            <div className="text-2xl font-extrabold text-rose-400 mt-1">{offlineServers}</div>
          </div>
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.15)] flex items-center justify-center">
            <XCircle size={20} className="text-rose-400" />
          </div>
        </div>
      </div>

      {/* Left Column: Grid Blocks Shelf Matrix (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        <div className="rounded-2xl border border-[#24231f] bg-[#161512] p-6 shadow-md space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-[#f5f5f4] flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <ServerIcon className="text-cyan-400" size={18} />
              </div>
              All Cabinet Shelves
            </h2>
            <p className="text-xs text-[#a3a39e] mt-0.5">Real-time status of all cabinet U-slots</p>
          </div>
          <div className="space-y-4">
            {shelves.map((shelf) => (
              <div key={shelf.name} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-[#1b1915] border border-[#282620] rounded-xl gap-4 hover:border-[#383630] transition-colors shadow-sm">
                <div className="flex items-center gap-3 w-40 shrink-0">
                  <div className={`p-2.5 rounded-lg border flex items-center justify-center ${shelf.color}`}>
                    {shelf.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#f5f5f4]">{shelf.name}</h4>
                    <span className="text-[0.65rem] text-[#a3a39e] font-mono font-bold">{shelf.range}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  {renderShelfBlocks(shelf.startU, shelf.endU)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Power history chart */}
        <PowerChart
          data={
            selectedServer
              ? [...selectedServer.readings]
                  .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                  .map((r) => ({
                    timestamp: new Date(r.timestamp).getTime(),
                    timeLabel: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    watts: r.watts,
                  }))
              : chartData
          }
          limit={selectedServer ? 350 : powerLimitWatts}
          title={selectedServer ? `Power History: ${selectedServer.name}` : undefined}
          subtitle={selectedServer ? `Telemetry readings for this server slot` : undefined}
        />
      </div>

      {/* Control Panel (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        {/* Status / Alert Banner */}
        <div className={`rounded-2xl border p-5 ${
          isOverLimit
            ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
            : 'border-[#24231f] bg-[#161512] text-[#f5f5f4]'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-sm text-[#a3a39e]">Rack Power Consumption</h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-2xl font-black ${isOverLimit ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {totalPower.toFixed(1)} W
                </span>
                <span className="text-xs text-[#a3a39e]">/ {powerLimitWatts} W Limit</span>
              </div>
            </div>
            {isOverLimit && (
              <span className="animate-pulse bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[0.65rem] font-black uppercase tracking-wider px-2 py-1 rounded">
                OVER LIMIT
              </span>
            )}
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 p-4 text-xs font-semibold flex justify-between items-center">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-200 cursor-pointer">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Dynamic Detail Card / Forms */}
        {selectedServer ? (
          /* Inspect & Edit Section */
          <div className="rounded-2xl border border-[#24231f] bg-[#161512] p-6 shadow-md space-y-6">
            {!isEditing ? (
              // Read-only Details
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <ServerIcon className="text-cyan-400" size={18} />
                    </div>
                    <h3 className="font-bold text-lg text-[#f5f5f4]">{selectedServer.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Tooltip content="Edit Server">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-[#a3a39e] hover:text-emerald-400 p-1.5 rounded bg-[#1b1915] border border-[#282620] transition-colors cursor-pointer"
                        aria-label="Edit Server"
                      >
                        <Edit size={14} />
                      </button>
                    </Tooltip>
                    <Tooltip content="Delete Server">
                      <button
                        onClick={() => triggerDeleteConfirm(selectedServer.id)}
                        disabled={isLoading}
                        className="text-[#a3a39e] hover:text-rose-400 p-1.5 rounded bg-[#1b1915] border border-[#282620] transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center"
                        aria-label="Delete Server"
                      >
                        {isLoading ? (
                          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </Tooltip>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#24231f]">
                  <div>
                    <div className="text-[0.65rem] text-[#a3a39e] uppercase tracking-wider font-extrabold">Start Unit</div>
                    <div className="text-sm font-bold text-[#f5f5f4] mt-0.5">U{selectedServer.startUnit}</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] text-[#a3a39e] uppercase tracking-wider font-extrabold">Height</div>
                    <div className="text-sm font-bold text-[#f5f5f4] mt-0.5">{selectedServer.sizeUnits} U</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] text-[#a3a39e] uppercase tracking-wider font-extrabold">Status</div>
                    <div className="mt-1">
                      <span className={`text-[0.65rem] font-mono font-extrabold uppercase px-2 py-0.5 rounded border ${
                        selectedServer.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : selectedServer.status === 'idle'
                          ? 'bg-[#1b1915] text-[#a3a39e] border border-[#282620]'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {selectedServer.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] text-[#a3a39e] uppercase tracking-wider font-extrabold">Live Power</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">
                      {selectedServer.readings[0] ? `${selectedServer.readings[0].watts.toFixed(1)} W` : '0.0 W'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Form
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg text-[#f5f5f4]">Edit Server</h3>
                  <button onClick={() => setIsEditing(false)} className="text-[#a3a39e] hover:text-white cursor-pointer">
                    <X size={16} />
                  </button>
                </div>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <input type="hidden" name="rackId" value={rackId} />
                  <div>
                    <label className="block text-xs font-extrabold text-[#a3a39e] uppercase tracking-wider mb-1">
                      Server Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-[#1b1915] border border-[#282620] text-[#e5e5e0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-[#a3a39e] uppercase tracking-wider mb-1">
                        Start Unit (U)
                      </label>
                      <input
                        type="number"
                        name="startUnit"
                        required
                        value={formStartUnit}
                        onChange={(e) => setFormStartUnit(parseInt(e.target.value) || 1)}
                        className="w-full bg-[#1b1915] border border-[#282620] text-[#e5e5e0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-[#a3a39e] uppercase tracking-wider mb-1">
                        Size (U Height)
                      </label>
                      <input
                        type="number"
                        name="sizeUnits"
                        required
                        value={formSizeUnits}
                        onChange={(e) => setFormSizeUnits(parseInt(e.target.value) || 1)}
                        className="w-full bg-[#1b1915] border border-[#282620] text-[#e5e5e0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#a3a39e] uppercase tracking-wider mb-1.5">
                      Status
                    </label>
                    <input type="hidden" name="status" value={formStatus} />
                    <Select
                      value={formStatus}
                      onValueChange={(val) => setFormStatus(val as ServerStatus)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="idle">Idle</SelectItem>
                        <SelectItem value="decommissioned">Decommissioned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl text-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      {isLoading ? (
                        <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-[#282620] bg-[#1b1915] rounded-xl text-sm text-[#e5e5e0] hover:text-white hover:bg-[#24231f] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* Add Server Form */
          <div className="rounded-2xl border border-[#24231f] bg-[#161512] p-6 shadow-md">
            <h3 className="font-extrabold text-lg text-[#f5f5f4] mb-4 flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Plus size={18} className="text-emerald-400" />
              </div>
              Add Server to Rack
            </h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <input type="hidden" name="rackId" value={rackId} />
              <div>
                <label className="block text-xs font-extrabold text-[#a3a39e] uppercase tracking-wider mb-1">
                  Server Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., AppServer-01"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#1b1915] border border-[#282620] text-[#e5e5e0] rounded-xl px-3.5 py-2 text-sm placeholder-[#73726c] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#a3a39e] uppercase tracking-wider mb-1">
                    Start Unit (U)
                  </label>
                  <input
                    type="number"
                    name="startUnit"
                    required
                    min="1"
                    max="42"
                    value={formStartUnit}
                    onChange={(e) => setFormStartUnit(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#1b1915] border border-[#282620] text-[#e5e5e0] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#a3a39e] uppercase tracking-wider mb-1">
                    Size (U Height)
                  </label>
                  <input
                    type="number"
                    name="sizeUnits"
                    required
                    min="1"
                    max="42"
                    value={formSizeUnits}
                    onChange={(e) => setFormSizeUnits(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#1b1915] border border-[#282620] text-[#e5e5e0] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#a3a39e] uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <input type="hidden" name="status" value={formStatus} />
                <Select
                  value={formStatus}
                  onValueChange={(val) => setFormStatus(val as ServerStatus)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="idle">Idle</SelectItem>
                    <SelectItem value="decommissioned">Decommissioned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold py-2 rounded-lg text-sm shadow-lg hover:shadow-emerald-950/20 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Create Server'
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteServerId !== null}
        title="Delete Server"
        message={`Are you sure you want to delete the server "${selectedServer?.name}"? This action will permanently remove it and all of its historical readings from the database.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteServerId(null)}
      />
    </div>
  );
}
