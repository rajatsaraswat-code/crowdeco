# 🏟️ Campus Sentinel - Predictive Crowd Management & Early-Warning System

**Campus Sentinel** is a production-ready predictive crowd safety application. It features real-time crowd dynamics, pedestrian tracking, velocity-vector movement calculation ($\vec{v}$), and an automated **predictive congestion engine** that warns operators **30 to 60 seconds *before* critical bottlenecks manifest**.

This version includes a **zero-dependency, standard HTML/CSS/JavaScript implementation** that runs instantly in any browser or with any basic live server without needing `node_modules` or a complex dev server.

---

## ⚡ Instant Run (No Node.js or npm Required)

You have multiple instant ways to view and run Campus Sentinel:

### Option 1: Direct File Open (Zero Servers Needed)
Simply double-click **`index.html`** in your File Explorer, or open it directly in Chrome / Edge / Firefox.

### Option 2: Basic Live Server (One-Click)
Run the included launcher:
- **Windows Batch:** Double-click `start_live_server.bat`
- **PowerShell:** Run `.\start_live_server.ps1`
- **Or via Terminal:**
  ```bash
  python -m http.server 5000
  ```
  Then open **`http://localhost:5000`** in your browser.

### Option 3: Full-Stack Mode (Python FastAPI + WebSocket)
If you also want to run the Python FastAPI backend engine:
```bash
cd backend
python run_backend.py
```
*The frontend automatically connects to `ws://localhost:8000/ws/live-feed` when the backend is active, or seamlessly switches to its built-in client-side simulation engine when running standalone.*

---

## 📁 Clean Project Structure

```
Campus Sentinel/
├── index.html                # Standalone single-file build (HTML + CSS + JS bundled, ready to view instantly)
├── frontend_static/          # Modular standard web structure
│   ├── index.html            # Main markup
│   ├── styles.css            # Tactical dark theme styles, radar glows & animations
│   └── app.js                # Core state, HTML5 2D canvas engine, Chart.js & kinetic forecast logic
├── backend/                  # Python FastAPI Real-time Core
│   ├── app/
│   │   ├── analytics/        # Tracker, Spatial Grid, Predictive Engine & Heatmap
│   │   ├── simulation/       # Microscopic Social-Force Pedestrian Physics Simulator
│   │   ├── api/              # REST Endpoints and WebSocket Broadcaster (~12 Hz)
│   │   ├── config.py         # Zone Thresholds and Venue Boundaries
│   │   └── main.py           # FastAPI Application Entrypoint
│   ├── run_backend.py        # Standalone backend server runner
│   └── requirements.txt      # Python Dependencies (FastAPI, uvicorn, websockets, numpy)
├── ml_models/                # Computer Vision & Vector Flow Analyzers
│   ├── vector_flow.py        # Vector Flow Field & Divergence Calculator
│   └── yolo_detector.py      # YOLO Bounding Box & Pedestrian Detector
├── start_live_server.bat     # One-click basic live server launcher (port 5000)
├── start_live_server.ps1     # One-click PowerShell live server launcher
├── start_campus-sentinel.bat        # Dual service launcher (Backend + Frontend)
└── README.md
```

---

## 🚀 Key Functional Modules

### 1. Live Feed & Multi-Zone Interactive Grid Dashboard
- **Logical Venue Zones:** Real-time spatial tracking across 4 zones:
  - **Gate A (Main Entrance)** — Capacity: 130
  - **Main Arena Concourse** — Capacity: 360
  - **Food Court (Zone B)** — Capacity: 170
  - **Exit Corridor (South Egress)** — Capacity: 95
- **Interactive Telemetry Cards:** Displays real-time **Headcount**, **Inflow Rate** ($\uparrow$ peds/min), **Outflow Rate** ($\downarrow$ peds/min), **Acceleration** ($\text{peds}/\text{s}^2$), and **Congestion Risk Index (CRI %)**.
- **Multi-Layer Visualizer Canvas:**
  - **YOLO Bounding Boxes:** Computer vision bounding box overlays with confidence scores and track IDs.
  - **Velocity Vectors ($\vec{v}$):** Dynamic flow arrows showing instantaneous direction and speed.
  - **Macroscopic Flow Field:** Grid arrows displaying collective pedestrian currents across the venue.
  - **Thermal Density Heatmap:** Real-time color-coded radial heat gradient.
  - **View Modes:** Toggle between *CCTV Overlay*, *Tactical Sensor Grid*, and *Thermal Density Mode*.

### 2. Predictive Congestion Engine (Kinetic Forecasting)
- **2nd-Order Taylor Kinetic Projection ($T+30s$ and $T+60s$):**
  $$\Delta N(t + \tau) = N(t) + F_{\text{net}}(t) \cdot \tau + \frac{1}{2} A(t) \cdot \tau^2$$
  where $F_{\text{net}} = \text{Inflow} - \text{Outflow}$ and $A(t) = \frac{d F_{\text{net}}}{dt}$ is trajectory acceleration.
- **Congestion Risk Index (CRI %):**
  $$\text{CRI} = \min\left(100, \left( \frac{N(t)}{C_{\max}} \times 0.30 + \frac{N_{30s}}{C_{\max}} \times 0.45 + \frac{N_{60s}}{C_{\max}} \times 0.25 \right) \times 100 + \text{Penalty}_{\text{accel}}\right)$$
- **Early-Warning Bottleneck Trigger:** When the forecast predicts a zone will exceed critical capacity ($>85\%$), the engine automatically flags the bottleneck with an estimated time-to-breach (e.g. $T-42s$).

### 3. Proactive Alerting & Notification System
- **Automated Banner Alerts:** Pushes high-priority alert cards featuring a countdown badge (`T-42s to 85% Bottleneck`), peak CRI score, and concrete actionable recommendations (e.g., *"⚠️ Predicted Bottleneck in Food Court Zone B within 42s. Suggest opening secondary exit pathway."*).
- **Interactive Mitigations:** One-click operator actions to **Acknowledge Alert** or **Execute Mitigation & Clear**.
- **Audio Warning Ping:** Web Audio API alarm sound that beeps when a critical bottleneck is forecasted.
- **Incident Audit Log:** Historical audit drawer recording alert ID, timestamp, zone name, peak risk score, and resolution status.

### 4. Simulation & Testing Control Panel
- **Artificial Influx Spikes:** One-click injection buttons (`+25`, `+45`, `+60`) to artificially surge crowd density into any zone without needing live CCTV hardware.
- **Scenarios:** *Normal Event Flow*, *Gate A Influx Spike*, *Halftime Food Court Rush*, and *Emergency Egress & Stampede Bottleneck*.
- **Interactive Controls:** Simulation speed slider ($0.5\times$ to $3.0\times$) and dynamic zone capacity overrides.

---

## 🧪 Testing the Early-Warning Predictive Alert

1. Open `http://localhost:5000` (or double-click `index.html`).
2. Notice the live 2D canvas displaying attendees moving between zones with velocity vectors ($\vec{v}$) and bounding boxes.
3. In the **Simulation & Synthetic Crowd Testing Control Deck**:
   - Click **`+30 Food Court Surge`**, OR
   - Click the red button: **`🚨 TRIGGER CRITICAL BOTTLENECK TEST (>85% CRI FORECAST)`**.
4. The **Predictive Alert Banner** will immediately appear at the top with:
   - Countdown badge: `T-38s to 85% Bottleneck`
   - High CRI score: `>85%`
   - Actionable recommendation: *"Activate secondary exit corridor adjacent to Concession #3."*
5. Click **"Acknowledge Alert"** or **"Execute Mitigation & Clear"** to resolve the alert.
6. Open the **Alert Incident Log** tab to view the audit record.
