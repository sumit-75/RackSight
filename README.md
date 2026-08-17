# ⚡ RackSight — Next-Gen Data Center Infrastructure Management (DCIM)

[![Next.js](https://img.shields.io/badge/Next.js-16.3.0-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-7.9-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=for-the-badge)](LICENSE)

**RackSight** is a state-of-the-art, real-time Data Center Infrastructure Management (DCIM) platform designed for modern hardware operators, network engineers, and data center administrators. Monitor 42U physical cabinet slot occupancies, track live server power consumption, receive thermal guard warnings, and control hardware state with zero vendor lock-in.

---

## 🌟 Core Features

- 🖥️ **42U Physical Rack Cabinet Mapping**: Top-to-bottom physical U1 to U42 slot layout inspection with U-height calculation, start unit positioning, and slot occupancy detection.
- ⚡ **Real-Time Power & Telemetry Monitoring**: Track server wattage consumption, tick latency (< 50ms), and peak load metrics with interactive Recharts power draw charts.
- 🚨 **Critical Threshold Alerts & Guard**: Visual pulse alerts and warning banners trigger instantly when total cabinet wattage exceeds configured power limits.
- 🏢 **Multi-Room Facility Organization**: Organize server cabinets into custom data center room facilities with configurable thermal threshold limits (°C).
- 🔄 **Integrated Telemetry Engine (`dcim-simulator`)**: Built-in mock hardware engine emitting ~500ms telemetry ticks and REST API control hooks (`POST /api/simulate`).
- 🔐 **JWT Authentication & Security**: Secure administrator sessions backed by HTTP-only JWT cookies, encrypted session tokens, and administrative credential management.
- ✨ **High-Impact On-Scroll Reveal Effects**: Lenis smooth wheel scrolling coupled with hardware-accelerated `IntersectionObserver` on-scroll animations (`fade-up`, `scale-up`, `slide-left`, `slide-right`).
- 📱 **100% Fully Responsive Layout**: Mobile-first glassmorphic floating navbar with mobile menu toggle drawer, touch-scrollable tabs, and mobile-optimized tables.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Actions & React Server Components) |
| **Frontend UI** | [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/) |
| **Data Visualization** | [Recharts](https://recharts.org/) (Interactive Telemetry Area Charts) |
| **Smooth Motion** | [Lenis Scroll](https://lenis.darkroom.engineering/) & Custom `IntersectionObserver` Scroll Reveal Engine |
| **Database & ORM** | [Prisma ORM](https://www.prisma.io/) with PostgreSQL database driver |
| **Authentication** | [Jose](https://github.com/panva/jose) (JWT Signing & Verification with HTTP-only Cookies) |
| **Telemetry Simulator**| Standalone Node.js Hardware Telemetry Engine (`dcim-simulator`) |

---

## 📁 Repository Structure

```
DCIM/
├── app/                        # Next.js App Router (Pages, Actions, & APIs)
│   ├── page.tsx                # Landing Page with ScrollReveal & Interactive Sandbox
│   ├── login/                  # Auth Login & Admin Registration Page
│   ├── dashboard/              # Overview Telemetry Dashboard Matrix
│   ├── rooms/                  # Multi-Room Facility Management & Details
│   ├── racks/[id]/             # 42U Physical Cabinet Inspector & Control Panel
│   ├── api/simulate/           # Telemetry Tick Ingestion API Endpoint
│   ├── actions.ts              # Server Actions (Auth, Rooms, Racks, Servers)
│   └── globals.css             # Tailwind CSS Design System & Motion Utilities
├── components/                 # Reusable UI & Client Components
│   ├── ScrollReveal.tsx        # Hardware-Accelerated On-Scroll Entrance Animations
│   ├── SmoothScroll.tsx        # Lenis Smooth Wheel Scroll Provider
│   ├── FloatingNavbar.tsx      # Responsive Glassmorphic Navbar & Mobile Drawer
│   ├── InteractiveRackDemo.tsx   # Interactive 42U Sandbox Simulator Component
│   ├── RackLayout.tsx          # Physical 42U Slot Layout & Management Panel
│   ├── PowerChart.tsx          # Recharts Telemetry Area Chart
│   └── ui/                     # UI Primitives (Button, Card, Badge, Accordion, Select)
├── dcim-simulator/             # Standalone Hardware Telemetry Simulation Engine
├── prisma/                     # Database Schema (`schema.prisma`) & Migrations
└── public/                     # Static Assets, Fonts & Data Center Graphics
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local environment:
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **PostgreSQL Database**: A local or remote PostgreSQL database instance (e.g. Supabase, Neon, or local Postgres)

---

### Local Installation Guide

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/RackSight.git
   cd RackSight
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your configuration:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/racksight?schema=public"
   JWT_SECRET="your_super_secret_jwt_key_min_32_chars"
   ```

4. **Initialize Database Schema**:
   Push the Prisma schema to your PostgreSQL database:
   ```bash
   npx prisma db push
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

6. **(Optional) Run Hardware Telemetry Engine**:
   To feed mock real-time telemetry ticks into the database, start the simulator in a separate terminal:
   ```bash
   npm --prefix dcim-simulator start
   ```

---

## 📡 API Reference & Ingestion Hooks

### Telemetry Ingestion API

Post telemetry readings from physical agents or hardware simulators:

```http
POST /api/simulate
Content-Type: application/json
```

**Example Payload**:
```json
{
  "rackId": 1,
  "cabinetName": "Cabinet Alpha",
  "powerLimitWatts": 1200.0,
  "totalPowerWatts": 816.6,
  "isOverLimit": false,
  "servers": [
    { "id": 101, "name": "AppServer-01", "watts": 215.0, "status": "active" },
    { "id": 102, "name": "AppServer-02", "watts": 385.2, "status": "spike" }
  ]
}
```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p center>
  Built with ❤️ for Data Center & Infrastructure Engineers.
</p>
