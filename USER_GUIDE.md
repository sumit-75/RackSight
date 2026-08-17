# 📖 RackSight — Comprehensive User Guide & Operating Manual

Welcome to **RackSight**, the next-generation Data Center Infrastructure Management (DCIM) platform. This guide provides an end-to-end walkthrough of all platform capabilities, system limits, telemetry monitoring workflows, and operational procedures.

---

## 📋 Table of Contents
1. [System Architecture & Features](#1-system-architecture--features)
2. [Platform Limits & Thresholds](#2-platform-limits--thresholds)
3. [Step-by-Step User Walkthrough](#3-step-by-step-user-walkthrough)
   - [3.1 Registering & Admin Authentication](#31-registering--admin-authentication)
   - [3.2 Landing Page & Live Interactive Sandbox](#32-landing-page--live-interactive-sandbox)
   - [3.3 Infrastructure Telemetry Dashboard](#33-infrastructure-telemetry-dashboard)
   - [3.4 Managing Rooms & Thermal Limits](#34-managing-rooms--thermal-limits)
   - [3.5 Managing 42U Rack Cabinets & PDU Limits](#35-managing-42u-rack-cabinets--pdu-limits)
   - [3.6 Mounting & Inspecting Server Slots](#36-mounting--inspecting-server-slots)
4. [Hardware Telemetry Ingestion API & Simulator](#4-hardware-telemetry-ingestion-api--simulator)
5. [Troubleshooting & FAQs](#5-troubleshooting--faqs)

---

## 1. System Architecture & Features

RackSight gives hardware operators and infrastructure teams real-time visibility into physical rack cabinets, power utilization, thermal thresholds, and equipment occupancy.

### 🌟 Core Capabilities
- **42U Physical Slot Mapping**: Inspect top-to-bottom U-slot layouts from U1 to U42. Slot occupancy, start units, and server heights are updated dynamically.
- **Live Power Draw Telemetry**: Chart wattage draw in real time using interactive Recharts telemetry graphs with < 50ms ingestion tick updates.
- **Automated Threshold Guard**: Visual pulse alerts trigger automatically when combined cabinet wattage exceeds configured power caps.
- **Multi-Room Facility Categorization**: Organize server cluster cabinets into dedicated facility rooms with thermal limit warnings (°C).
- **JWT Session Security**: Administrative authentication secured via HTTP-only JWT cookies and password management.
- **High-Impact Motion & Responsiveness**: Lenis smooth wheel scrolling, hardware-accelerated on-scroll section reveals, and a mobile navigation drawer for phones & tablets.

---

## 2. Platform Limits & Thresholds

RackSight enforces clear, safety-first operational boundaries across hardware components:

| Threshold / Limit | Value | Description |
| :--- | :--- | :--- |
| **Individual Server Power Limit** | **`350 W`** | Maximum single-server PSU wattage limit. Draw exceeding `350W` triggers a **Critical Power Spike Alert**. |
| **Cabinet Total Power Limit** | Configurable (e.g. `1200W`, `3200W`) | Total PDU wattage limit configured per 42U rack cabinet. Exceeding this marks the rack as **OVER LIMIT**. |
| **Room Thermal Threshold** | Configurable (e.g. `25.0°C`, `35.0°C`) | Ambient room temperature limit (°C) configured per data center room facility. |
| **Cabinet Density Capacity** | **`42 U`** | Standard 19" rack density mapped from slot `U1` (bottom) to `U42` (top). |
| **Server Form Factor Heights** | `1U` to `42U` | Vertical U-slot occupancy height for server chassis. |
| **Telemetry Ingestion Tick Latency**| **`< 50ms`** | Ingestion speed for REST payload ticks and graph updates. |

---

## 3. Step-by-Step User Walkthrough

### 3.1 Registering & Admin Authentication
1. Open [http://localhost:3000/login](http://localhost:3000/login) or click **Get Started** in the top navigation bar.
2. To create a new admin account:
   - Click **"Don't have an admin account? Register"**.
   - Enter your preferred **Username**, **Password** (min. 6 characters), and **Confirm Password**.
   - Click **Register Account**.
3. Sign in with your credentials to launch your session. Your JWT session token is securely stored in an HTTP-only cookie.

---

### 3.2 Landing Page & Live Interactive Sandbox
Navigate to [http://localhost:3000](http://localhost:3000):
- **Hero & Motion Features**: Scroll down to view the smooth on-scroll entrance animations (`fade-up`, `scale-up`, `slide-left`, `slide-right`).
- **Interactive 42U Sandbox**:
  - **Click any U-slot button** (e.g. U42, U24, U14) to toggle load states: `Active` ➔ `Spike` ➔ `Idle` ➔ `Empty`.
  - **Spike Load Button**: Click **"Spike Load"** at the top right of the sandbox window to simulate an instant high-load power surge across the cabinet.
  - **Reset Button**: Click **"Reset"** to restore default baseline telemetry.

---

### 3.3 Infrastructure Telemetry Dashboard
Navigate to [http://localhost:3000/dashboard](http://localhost:3000/dashboard):
- **Metrics Overview Panel**: View aggregate counters for Total Rooms, Active Racks, Total Live Power Draw (W), and Active Threshold Alerts.
- **Active Alerts Banner**: If any rack exceeds its wattage limit, a glowing red warning banner highlights critical cabinets requiring attention.
- **Room Status Matrix**: Inspect room facilities, cabinet counts, power draws, thermal limits (°C), and SLA status badges (**Optimal** / **Alert**).

---

### 3.4 Managing Rooms & Thermal Limits
Navigate to [http://localhost:3000/rooms](http://localhost:3000/rooms):
1. **Add New Room**:
   - Fill in **Room Name** (e.g. *Server Hall Alpha*).
   - Enter **Temp Threshold (°C)** (e.g. *24.5*).
   - Click **Create Room**.
2. **Delete Room**:
   - Click the Trash icon on any room card. A confirmation dialog will prompt you before permanently removing the room and its associated cabinets.
3. **Open Room Details**:
   - Click **Manage Room** to view and configure all cabinets inside that facility.

---

### 3.5 Managing 42U Rack Cabinets & PDU Limits
Inside a Room page ([http://localhost:3000/rooms/1](http://localhost:3000/rooms/1)):
1. **Add New Cabinet**:
   - Enter **Rack Name** (e.g. *Rack A-10*).
   - Set **Total Units** (default `42`).
   - Enter **Power Limit (Watts)** (e.g. *3000*).
   - Click **Create Rack**.
2. **Inspect Cabinet**:
   - Click **Inspect Rack Layout** to open the cabinet's U-slot inspector and live telemetry charts.

---

### 3.6 Mounting & Inspecting Server Slots
Inside a Cabinet Inspector page ([http://localhost:3000/racks/1](http://localhost:3000/racks/1)):
- **Mount Server**:
  - Click any empty dark U-slot block in the grid or fill out **Add Server to Rack**.
  - Specify **Server Name**, **Start Unit (U1–U42)**, **Size (U Height)**, and **Status** (`active`, `idle`, `decommissioned`).
- **Inspect Server Telemetry**:
  - Click any mounted server to view its details and focus the **Power Consumption Chart** on that individual server slot (displaying `LIMIT: 350W`).
- **Edit or Delete Server**:
  - Click the **Pencil (Edit)** icon to modify server specs.
  - Click the **Trash (Delete)** icon to unmount the server.

---

## 4. Hardware Telemetry Ingestion API & Simulator

### 4.1 Telemetry REST API
Post hardware telemetry readings from real external agents or mock scripts:

```http
POST http://localhost:3000/api/simulate
Content-Type: application/json
```

**JSON Payload**:
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

### 4.2 Running the Telemetry Simulator
The project includes a standalone Node.js telemetry generator (`dcim-simulator`):

```bash
# Run simulator from project root
npm --prefix dcim-simulator start
```
The engine emits continuous 500ms telemetry ticks into the system, generating realistic power fluctuations, wattage drops, and spike conditions.

---

## 5. Troubleshooting & FAQs

### Q: Why does the Power Chart badge say `LIMIT: 350W`?
> **Answer**: Single-server hardware PSUs are capped at `350W`. When you click an individual server slot, the telemetry chart zooms into that specific server and displays `LIMIT: 350W`. When no server is selected, the chart shows the total rack PDU limit (e.g. `1200W` / `3200W`).

### Q: What triggers an "OVER LIMIT" power warning?
> **Answer**: When the sum of all live server wattage draw mounted in a cabinet exceeds the cabinet's `powerLimitWatts`, RackSight highlights the cabinet with red animated alerts.

### Q: How do I change my Admin Username or Password?
> **Answer**: Go to **Settings** ([http://localhost:3000/settings](http://localhost:3000/settings)), enter your current password, type your new credentials, and click **Update Credentials**.

---

<p align="center">
  <strong>RackSight DCIM Platform</strong> — Real-time visibility & control for modern infrastructure.
</p>
