import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/app/actions';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Accordion } from '@/components/ui/Accordion';
import InteractiveRackDemo from '@/components/InteractiveRackDemo';
import {
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
  Database,
  Lock,
  Sparkles,
  Terminal,
  Activity,
  Command,
  TrendingUp,
} from 'lucide-react';

import ScrollToHash from '@/components/ScrollToHash';
import TryDemoButton from '@/components/TryDemoButton';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const user = await getCurrentUser();

  const faqItems = [
    {
      id: 'faq-1',
      title: 'What is RackSight?',
      content:
        'RackSight is a Next-gen Data Center Infrastructure Management (DCIM) platform that provides real-time 42U cabinet slot mapping, power consumption telemetry, thermal threshold warnings, and hardware control APIs.',
    },
    {
      id: 'faq-2',
      title: 'How does the hardware telemetry simulator work?',
      content:
        'RackSight includes an integrated standalone mock telemetry engine (`dcim-simulator`) that generates real-time wattage spikes, idle load drops, and server telemetry ticks via REST & control APIs.',
    },
    {
      id: 'faq-3',
      title: 'Can I monitor multiple data center rooms?',
      content:
        'Yes! You can organize your infrastructure into multiple custom rooms, each with configured thermal limits and individual rack cabinets.',
    },
    {
      id: 'faq-4',
      title: 'How are power threshold alerts handled?',
      content:
        'When the combined wattage of servers mounted in a cabinet exceeds its configured limit, RackSight immediately highlights the rack with animated visual warnings and power spike alerts.',
    },
  ];

  return (
    <div className="relative space-y-24 py-6 animate-in fade-in duration-500 font-sans text-[#e5e5e0]">
      {/* Cool Data Center Ambient Background Layer */}
      <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[820px] overflow-hidden -z-10 rounded-3xl">
        {/* Data Center Server Hall Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.24] mix-blend-luminosity scale-105"
          style={{ backgroundImage: `url('/images/datacenter_bg.jpg')` }}
        />
        {/* Ambient Emerald Radial Spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_20%,rgba(16,185,129,0.16),transparent_80%)]" />
        {/* Cyber Grid Overlay */}
        <div className="absolute inset-0 datacenter-grid-overlay opacity-70" />
        {/* Vignette Gradients for 100% Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e0d09]/70 via-transparent to-[#0e0d09]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_85%_at_50%_50%,transparent_35%,#0e0d09_100%)]" />
      </div>

      <ScrollToHash />
      {/* Logged in User Quick Banner */}
      {user && (
        <div className="rounded-2xl border border-[#2e2d27] bg-[#161512] p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5 items-center justify-center shrink-0">
              <span className="radar-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
            </span>
            <span className="text-sm font-bold text-[#e5e5e0]">
              Welcome back, <strong className="text-white">{user.username}</strong>! Your live dashboard telemetry is active.
            </span>
          </div>
          <Link href="/dashboard">
            <Button variant="gradient" size="sm">
              Launch Dashboard Matrix <ArrowRight size={14} className="ml-1.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative text-center space-y-8 max-w-4xl mx-auto pt-4 font-sans">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#2e2d27] bg-[#161512] text-[#e5e5e0] text-xs font-extrabold font-sans">
          <Sparkles size={14} className="text-emerald-400 animate-pulse" />
          <span>RackSight v1.0 — Next-Gen Cabinet Infrastructure Visibility</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#f5f5f4] leading-[1.1] font-sans">
          Real-Time Data Center Visibility &{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Cabinet Telemetry
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-[#a3a39e] max-w-2xl mx-auto leading-relaxed font-sans font-normal">
          Monitor 42U rack cabinet slot occupancy, live server power consumption, thermal thresholds, and hardware telemetry with zero vendor lock-in.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {user ? (
            <Link href="/dashboard">
              <Button variant="gradient" size="lg" className="w-full sm:w-auto text-base">
                Go to Dashboard Matrix <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="gradient" size="lg" className="w-full sm:w-auto text-base">
                  Get Started Free <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <TryDemoButton />
            </>
          )}
        </div>
      </section>

      {/* Interactive Sandbox Section */}
      <section id="interactive-demo" className="scroll-mt-36 space-y-6 font-sans">
        <div className="text-center space-y-2">
          <Badge variant="secondary">Live Interactive Sandbox</Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#f5f5f4] tracking-tight font-sans">
            Test Cabinet Telemetry Right Now
          </h2>
          <p className="text-xs sm:text-sm text-[#a3a39e] max-w-xl mx-auto font-sans">
            Interact with the 42U cabinet grid below. Click slots to toggle load states or trigger simulated power spikes.
          </p>
        </div>

        <InteractiveRackDemo />
      </section>

      {/* Trust & Performance Metrics Banner */}
      <section className="relative rounded-3xl border border-[#262420] bg-[#141310]/95 backdrop-blur-md shadow-2xl overflow-hidden font-sans">
        {/* Subtle background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.04] via-transparent to-emerald-500/[0.04] pointer-events-none" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#282620]">
          {/* Metric 1 */}
          <div className="group p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:bg-white/[0.02] transition-colors duration-200">
            <div className="h-7 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-2 text-zinc-300 font-semibold">
                <Layers size={16} className="text-emerald-400" />
                <span>RACK MATRIX</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/15 text-xs font-medium text-zinc-200">Standard 19&quot;</span>
            </div>

            <div className="min-h-[105px] flex flex-col justify-end space-y-1.5">
              <div className="text-4xl sm:text-5xl lg:text-5xl font-black text-[#f5f5f4] tracking-tight group-hover:text-emerald-300 transition-colors">
                42 U
              </div>
              <div className="text-xs sm:text-sm text-[#e5e5e0] font-extrabold uppercase tracking-wider font-sans">
                Slot Matrix Density
              </div>
            </div>

            <div className="pt-4 border-t border-[#282620] min-h-[64px]">
              <p className="text-xs sm:text-sm text-[#d4d4d0] leading-relaxed font-sans font-normal">
                Full U1 to U42 physical slot mapping with equipment occupancy detection.
              </p>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="group p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:bg-white/[0.02] transition-colors duration-200">
            <div className="h-7 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-2 text-zinc-300 font-semibold">
                <Zap size={16} className="text-emerald-400" />
                <span>REALTIME TICK</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
                </span>
                <span>LIVE</span>
              </span>
            </div>

            <div className="min-h-[105px] flex flex-col justify-end space-y-1.5">
              <div className="text-4xl sm:text-5xl lg:text-5xl font-black text-emerald-400 tracking-tight group-hover:scale-105 group-hover:text-emerald-300 transition-all origin-left">
                &lt; 50ms
              </div>
              <div className="text-xs sm:text-sm text-[#e5e5e0] font-extrabold uppercase tracking-wider font-sans">
                Telemetry Latency
              </div>
            </div>

            <div className="pt-4 border-t border-[#282620] min-h-[64px]">
              <p className="text-xs sm:text-sm text-[#d4d4d0] leading-relaxed font-sans font-normal">
                Ultra-low latency hardware tick ingestion and instant state sync.
              </p>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="group p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:bg-white/[0.02] transition-colors duration-200">
            <div className="h-7 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-2 text-zinc-300 font-semibold">
                <Activity size={16} className="text-emerald-400" />
                <span>SYSTEM HEALTH</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-mono font-semibold text-emerald-400">SLA Tier 1</span>
            </div>

            <div className="min-h-[105px] flex flex-col justify-end space-y-1.5">
              <div className="text-4xl sm:text-5xl lg:text-5xl font-black text-[#f5f5f4] tracking-tight group-hover:text-emerald-300 transition-colors">
                99.99%
              </div>
              <div className="text-xs sm:text-sm text-[#e5e5e0] font-extrabold uppercase tracking-wider font-sans">
                Engine Uptime
              </div>
            </div>

            <div className="pt-4 border-t border-[#282620] min-h-[64px]">
              <p className="text-xs sm:text-sm text-[#d4d4d0] leading-relaxed font-sans font-normal">
                High-availability telemetry monitoring with thermal guard protection.
              </p>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="group p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:bg-white/[0.02] transition-colors duration-200">
            <div className="h-7 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-2 text-zinc-300 font-semibold">
                <Terminal size={16} className="text-emerald-400" />
                <span>REST HOOKS</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/15 text-xs font-medium text-zinc-200">OpenAPI</span>
            </div>

            <div className="min-h-[105px] flex flex-col justify-end space-y-1.5">
              <div className="text-4xl sm:text-5xl lg:text-5xl font-black text-emerald-400 tracking-tight group-hover:scale-105 group-hover:text-emerald-300 transition-all origin-left">
                100%
              </div>
              <div className="text-xs sm:text-sm text-[#e5e5e0] font-extrabold uppercase tracking-wider font-sans">
                Open API Architecture
              </div>
            </div>

            <div className="pt-4 border-t border-[#282620] min-h-[64px]">
              <p className="text-xs sm:text-sm text-[#d4d4d0] leading-relaxed font-sans font-normal">
                Standard REST payload hooks for seamless hardware integration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities Bento Grid */}
      <section id="features" className="scroll-mt-36 space-y-10 font-sans">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="secondary">Infrastructure Matrix</Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#f5f5f4] tracking-tight font-sans">
            Engineered for Modern Data Center Operations
          </h2>
          <p className="text-xs sm:text-sm text-[#a3a39e] font-sans">
            Everything you need to inspect server slots, track power draw, and prevent infrastructure outages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: 42U Physical Rack Mapping (Span 2 columns) */}
          <div className="group md:col-span-2 p-7 sm:p-8 rounded-3xl border border-[#24231f] bg-[#161512] text-[#e5e5e0] font-sans shadow-md smooth-bento-card hover:bg-[#191814] flex flex-col justify-between space-y-6">
            <div>
              {/* Header row with Icon & Active PDU dots */}
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white group-hover:scale-110 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-all duration-200">
                  <Layers size={22} />
                </div>
                {/* 5 Staggered Active PDU Radar Status Dots */}
                <div className="flex items-center gap-2" title="Active PDU Telemetry Feed">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="radar-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
                  </span>
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="radar-ring-stagger-1 absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
                  </span>
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="radar-ring-stagger-2 absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
                  </span>
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="radar-ring-stagger-3 absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
                  </span>
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="radar-ring-stagger-4 absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
                  </span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#f5f5f4] font-sans mb-2">
                42U Physical Rack Mapping
              </h3>
              <p className="text-xs sm:text-sm text-[#a3a39e] leading-relaxed max-w-xl font-sans">
                Visual top-to-bottom U-slot mapping from U1 to U42. Inspect server size, start unit, equipment occupancy maps, and physical slot layout instantly.
              </p>
            </div>

            {/* Bottom 4 Data Center Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#24231f]/60">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#f5f5f4] tracking-tight">42U</div>
                <div className="text-[11px] text-[#a3a39e] font-semibold uppercase tracking-wider mt-0.5">Rack Capacity</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#f5f5f4] tracking-tight">U1–U42</div>
                <div className="text-[11px] text-[#a3a39e] font-semibold uppercase tracking-wider mt-0.5">Slot Range</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#f5f5f4] tracking-tight">3.2 kW</div>
                <div className="text-[11px] text-[#a3a39e] font-semibold uppercase tracking-wider mt-0.5">PDU Limit</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#f5f5f4] tracking-tight">100%</div>
                <div className="text-[11px] text-[#a3a39e] font-semibold uppercase tracking-wider mt-0.5">Slot Accuracy</div>
              </div>
            </div>
          </div>

          {/* Card 2: Live Power Draw Telemetry (Span 1 column) */}
          <div className="group md:col-span-1 p-7 sm:p-8 rounded-3xl border border-[#24231f] bg-[#161512] text-[#e5e5e0] font-sans shadow-md smooth-bento-card hover:bg-[#191814] flex flex-col justify-between space-y-6">
            <div>
              <div className="p-2.5 w-fit rounded-xl bg-white/5 border border-white/10 text-white group-hover:scale-110 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-all duration-200 mb-4">
                <Zap size={22} />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#f5f5f4] font-sans mb-2">
                Live Power Telemetry
              </h3>
              <p className="text-xs sm:text-sm text-[#a3a39e] leading-relaxed font-sans">
                Real-time wattage telemetry charting, load percentage monitoring, and automatic power spike alert detection.
              </p>
            </div>

            {/* Bottom Live Power Draw Sparkline Chart */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mb-1">
                <span>Power Draw</span>
                <span className="text-emerald-400 font-bold">2.8 kW Peak</span>
              </div>
              <svg className="w-full h-14 overflow-visible" viewBox="0 0 200 60" fill="none">
                <defs>
                  <linearGradient id="powerChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 48 L35 38 L70 42 L105 18 L140 32 L175 10 L200 22 V60 H0 Z"
                  fill="url(#powerChartGrad)"
                />
                <path
                  d="M0 48 L35 38 L70 42 L105 18 L140 32 L175 10 L200 22"
                  stroke="#34d399"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:stroke-emerald-300 transition-colors duration-200"
                />
              </svg>
            </div>
          </div>

          {/* Card 3: Multi-Room Infrastructure (Span 1 column) */}
          <div className="group md:col-span-1 p-7 sm:p-8 rounded-3xl border border-[#24231f] bg-[#161512] text-[#e5e5e0] font-sans shadow-md smooth-bento-card hover:bg-[#191814] flex flex-col justify-between space-y-6">
            <div>
              <div className="p-2.5 w-fit rounded-xl bg-white/5 border border-white/10 text-white group-hover:scale-110 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-all duration-200 mb-4">
                <Database size={22} />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#f5f5f4] font-sans mb-2">
                Multi-Room Facilities
              </h3>
              <p className="text-xs sm:text-sm text-[#a3a39e] leading-relaxed font-sans">
                Organize server cluster cabinets into dedicated room facilities with configurable thermal threshold limits (°C).
              </p>
            </div>

            {/* Bottom Room Facility Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-medium font-mono bg-[#22201b] text-zinc-300 border border-[#333028] group-hover:border-zinc-500 transition-colors">
                Main Hall
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-medium font-mono bg-[#22201b] text-zinc-300 border border-[#333028] group-hover:border-zinc-500 transition-colors">
                Cluster East
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-medium font-mono bg-[#22201b] text-emerald-400 border border-emerald-500/30 group-hover:border-emerald-400 transition-colors">
                Thermal &lt;35°C
              </span>
            </div>
          </div>

          {/* Card 4: Mock Hardware Simulator (Span 1 column) */}
          <div className="group md:col-span-1 p-7 sm:p-8 rounded-3xl border border-[#24231f] bg-[#161512] text-[#e5e5e0] font-sans shadow-md smooth-bento-card hover:bg-[#191814] flex flex-col justify-between space-y-6">
            <div>
              <div className="p-2.5 w-fit rounded-xl bg-white/5 border border-white/10 text-white group-hover:scale-110 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-all duration-200 mb-4">
                <Cpu size={22} />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#f5f5f4] font-sans mb-2">
                Mock Hardware Engine
              </h3>
              <p className="text-xs sm:text-sm text-[#a3a39e] leading-relaxed font-sans">
                Built-in hardware simulation engine emitting 500ms telemetry ticks and REST control API hooks.
              </p>
            </div>

            {/* Bottom Glowing Simulator Pulse Badge */}
            <div className="pt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono font-semibold text-emerald-400">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
                </span>
                <span>~500ms telemetry tick</span>
              </span>
            </div>
          </div>

          {/* Card 5: Critical Threshold Guard & Auth (Span 1 column) */}
          <div className="group md:col-span-1 p-7 sm:p-8 rounded-3xl border border-[#24231f] bg-[#161512] text-[#e5e5e0] font-sans shadow-md smooth-bento-card hover:bg-[#191814] flex flex-col justify-between space-y-6">
            <div>
              <div className="p-2.5 w-fit rounded-xl bg-white/5 border border-white/10 text-white group-hover:scale-110 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-all duration-200 mb-4">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#f5f5f4] font-sans mb-2">
                Threshold Guard & Auth
              </h3>
              <p className="text-xs sm:text-sm text-[#a3a39e] leading-relaxed font-sans">
                Visual pulse alerts whenever power draw exceeds limit thresholds, backed by JWT session security.
              </p>
            </div>

            {/* Bottom Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-medium font-mono bg-[#22201b] text-zinc-300 border border-[#333028] group-hover:border-zinc-500 transition-colors">
                JWT Auth
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-medium font-mono bg-[#22201b] text-rose-400 border border-rose-500/30 group-hover:border-rose-400 transition-colors">
                Pulse Alert
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-medium font-mono bg-[#22201b] text-zinc-300 border border-[#333028] group-hover:border-zinc-500 transition-colors">
                REST Hooks
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Developer API & Architecture Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12 rounded-3xl border border-[#24231f] bg-[#12110e] font-sans">
        <div className="lg:col-span-6 space-y-4">
          <Badge variant="secondary">Developer First API</Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#f5f5f4] tracking-tight font-sans">
            Seamless Hardware Ingestion & Control API
          </h2>
          <p className="text-sm text-[#a3a39e] leading-relaxed font-sans">
            RackSight connects seamlessly with any telemetry agent or mock hardware simulator. Query current wattage, trigger load shifts, or post server state changes using simple REST payloads.
          </p>
          <div className="space-y-2.5 pt-2 text-xs sm:text-sm font-bold text-[#e5e5e0]">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>Standard REST API endpoints for telemetry ticks (`POST /api/simulate`)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>High-speed Prisma ORM integration with PostgreSQL database</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>Zero external agent installation required</span>
            </div>
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="lg:col-span-6 rounded-2xl border border-[#24231f] bg-[#161512] p-6 space-y-3 font-sans text-xs shadow-md">
          <div className="flex justify-between items-center pb-3 border-b border-[#24231f] text-[#a3a39e]">
            <span className="flex items-center gap-2 font-bold">
              <Terminal size={14} className="text-[#a3a39e]" />
              telemetryPayload.json
            </span>
            <Badge variant="emerald">200 OK</Badge>
          </div>
          <pre className="text-emerald-400 font-bold overflow-x-auto leading-relaxed">
{`{
  "rackId": 1,
  "cabinetName": "Cabinet Alpha",
  "powerLimitWatts": 1200.0,
  "totalPowerWatts": 816.6,
  "isOverLimit": false,
  "servers": [
    { "id": 101, "name": "AppServer-01", "watts": 215.0, "status": "active" },
    { "id": 102, "name": "AppServer-02", "watts": 385.2, "status": "spike" }
  ]
}`}
          </pre>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="scroll-mt-36 max-w-3xl mx-auto space-y-8 font-sans">
        <div className="text-center space-y-2">
          <Badge variant="secondary">Got Questions?</Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#f5f5f4] tracking-tight font-sans">
            Frequently Asked Questions
          </h2>
        </div>

        <Accordion items={faqItems} />
      </section>

      {/* CTA Footer Banner */}
      <section className="text-center p-10 sm:p-14 rounded-3xl bg-[#161512] border border-[#24231f] shadow-md space-y-6 font-sans">
        <h2 className="text-3xl sm:text-4xl font-black text-[#f5f5f4] tracking-tight font-sans">
          Ready to Monitor Your Data Center Cabinet Matrix?
        </h2>
        <p className="text-[#a3a39e] text-sm max-w-xl mx-auto font-sans">
          Start inspecting your 42U rack cabinets, power consumption graphs, and room infrastructure in seconds.
        </p>
        <div>
          <Link href={user ? '/dashboard' : '/login'}>
            <Button variant="gradient" size="lg" className="text-base px-8">
              {user ? 'Open Overview Dashboard' : 'Get Started Now'} <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
