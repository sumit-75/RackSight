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
    <div className="space-y-24 py-6 animate-in fade-in duration-500 font-sans text-[#e5e5e0]">
      <ScrollToHash />
      {/* Logged in User Quick Banner */}
      {user && (
        <div className="rounded-2xl border border-[#2e2d27] bg-[#161512] p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
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
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-7 sm:p-9 rounded-3xl border border-[#24231f] bg-[#161512] font-sans">
        <div className="text-center space-y-1">
          <div className="text-3xl sm:text-4xl font-black text-[#f5f5f4] font-sans">42 U</div>
          <div className="text-xs text-[#a3a39e] font-extrabold uppercase tracking-wider">Slot Matrix Density</div>
        </div>
        <div className="text-center space-y-1">
          <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-sans">&lt; 50ms</div>
          <div className="text-xs text-[#a3a39e] font-extrabold uppercase tracking-wider">Telemetry Latency</div>
        </div>
        <div className="text-center space-y-1">
          <div className="text-3xl sm:text-4xl font-black text-[#f5f5f4] font-sans">99.99%</div>
          <div className="text-xs text-[#a3a39e] font-extrabold uppercase tracking-wider">Engine Uptime</div>
        </div>
        <div className="text-center space-y-1">
          <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-sans">100%</div>
          <div className="text-xs text-[#a3a39e] font-extrabold uppercase tracking-wider">Open API Architecture</div>
        </div>
      </section>

      {/* Core Capabilities Feature Grid */}
      <section id="features" className="scroll-mt-36 space-y-12 font-sans">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="secondary">Infrastructure Matrix</Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#f5f5f4] tracking-tight font-sans">
            Engineered for Modern Data Center Operations
          </h2>
          <p className="text-xs sm:text-sm text-[#a3a39e] font-sans">
            Everything you need to inspect server slots, track power draw, and prevent infrastructure outages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <Card>
            <CardHeader>
              <div className="p-3 w-fit rounded-xl bg-[#1b1915] border border-[#282620] text-[#e5e5e0] mb-2">
                <Layers size={22} />
              </div>
              <CardTitle>42U Physical Rack Mapping</CardTitle>
              <CardDescription>
                Visual top-to-bottom U-slot mapping from U1 to U42. Inspect server size, start unit, and occupancy map instantly.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 2 */}
          <Card>
            <CardHeader>
              <div className="p-3 w-fit rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
                <Zap size={22} />
              </div>
              <CardTitle>Live Power Draw Telemetry</CardTitle>
              <CardDescription>
                Real-time wattage telemetry charting, load percentage monitoring, and automatic power spike alert detection.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 3 */}
          <Card>
            <CardHeader>
              <div className="p-3 w-fit rounded-xl bg-[#1b1915] border border-[#282620] text-[#e5e5e0] mb-2">
                <Database size={22} />
              </div>
              <CardTitle>Multi-Room Infrastructure</CardTitle>
              <CardDescription>
                Organize your cluster into dedicated room facilities with configurable thermal threshold limits (°C).
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 4 */}
          <Card>
            <CardHeader>
              <div className="p-3 w-fit rounded-xl bg-[#1b1915] border border-[#282620] text-[#e5e5e0] mb-2">
                <Cpu size={22} />
              </div>
              <CardTitle>Mock Hardware Simulator</CardTitle>
              <CardDescription>
                Built-in hardware simulation engine (`dcim-simulator`) emitting realistic telemetry ticks and REST control API hooks.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 5 */}
          <Card>
            <CardHeader>
              <div className="p-3 w-fit rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-2">
                <ShieldCheck size={22} />
              </div>
              <CardTitle>Critical Threshold Guard</CardTitle>
              <CardDescription>
                Visual pulse alerts whenever a rack cabinet power draw exceeds configured limit thresholds.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Card 6 */}
          <Card>
            <CardHeader>
              <div className="p-3 w-fit rounded-xl bg-[#1b1915] border border-[#282620] text-[#e5e5e0] mb-2">
                <Lock size={22} />
              </div>
              <CardTitle>JWT Session Authentication</CardTitle>
              <CardDescription>
                Secure administrative authentication, cookie-based session verification, and instant credential updates.
              </CardDescription>
            </CardHeader>
          </Card>
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
