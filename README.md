# Cybersecurity Analyst & Systems Engineer Portfolio

> **Live Workstation & Cinematic Landing Experience**  
> Engineered by **Lalith Chaitanya Mulapala** — Cybersecurity Analyst & Systems Engineer specializing in VAPT, Cloud Compliance Automation, SIEM Detection Pipelines, and Threat Intelligence.

---

## Overview

This repository houses a hybrid cybersecurity portfolio featuring two tightly integrated visual paradigms:
1. **Stage 1 — The Gateway**: A pixel-faithful, cinematic black stage landing page with dual-pass looping video atmosphere, SVG color-lookup grading (`#grade` / `#grade2`), left-locked typography (`Space Grotesk` & `JetBrains Mono`), responsive coordinate scaling, and one-shot WAAPI entrance choreography.
2. **Stage 2 — The OS Workstation**: An interactive, desktop-grade HUD operating system environment providing multi-window capabilities (drag, drop, maximize, 8-directional touch/tablet resize), live telemetry ingestion monitors, ambient particle & radar motion background, an unpinned CLI terminal emulator, and an interactive 3D rotatable glass cyber cube.

---

## Key Features

### 1. Cinematic Landing Page (Stage 1)
- **Fluid Scaled Canvas**: Dynamic CSS `--s` coordinate system targeting `1505×700` (desktop), `900×1200` (tablet portrait), and `430×620` (mobile) with zero scrolling and strict mathematical scaling.
- **Dual-Pass Looping Atmosphere**: Synchronized CloudFront video plate with real-time SVG color-grade lookup matrices.
- **One-Shot Entrance Choreography**: Web Animations API (WAAPI) sequencing with staggered ease curves (`EXPO`, `QUINT`, `QUART`, `TYPE`) and automatic cleanup.
- **Responsive Navigation**: Adaptive desktop header links and a mobile/tablet off-canvas accordion navigation overlay.

### 2. Multi-Window OS HUD Workstation (Stage 2)
- **OS Window Management**:
  - Full windowing controls: Drag by titlebar, minimize, maximize/restore (`□` / `❐`), and close (`✕`).
  - **8-Directional Resizing**: Grab and resize from all 4 corners (`tl`, `tr`, `bl`, `br`) and all 4 edges (`t`, `b`, `l`, `r`) with generous touch targets (`touch-action: none`) optimized for iPad, Android tablets, and touchscreens.
  - **Corner Anti-Collision Clamping**: Automatic container bounds protection preventing windows from getting stuck in screen corners.
- **Interactive 3D Glass Cyber Cube**:
  - Built with **Three.js** (WebGL).
  - Dual-pass 6-band chromatic dispersion shader (`uIorR`, `uIorY`, `uIorG`, `uIorC`, `uIorB`, `uIorP`) with Blinn-Phong specular lighting and Fresnel reflections.
  - Offscreen 2D canvas dynamically rendering the bold headline **"Privacy is a MYTH"**, refracted in real-time through the rounded cuboid.
  - Inertia physics, drag-to-rotate touch controls, idle drift, ±90° arrow steps, and dot pagination.
  - Loads a high-precision rounded cube GLTF model with procedural fallback to `RoundedBoxGeometry`.
- **Unpinned CLI Terminal Window (`WIN://VISITOR_TERMINAL.SH`)**:
  - Full interactive terminal emulator with persistent history (↑/↓ arrows) and Tab autocomplete.
  - Commands suite: `help`, `whoami`, `about`, `experience`, `projects`, `skills`, `certs`, `resume`, `theme [crimson|matrix|amber]`, `sound [on|off]`, `landing`, `sudo`, `clear`.
  - Quick-action command chips for instant execution.
- **Procedural 3D Wireframe Cyber Hologram**:
  - Real-time rotating 3D cybernetic mesh avatar rendered on HTML5 canvas with depth projection, vertex glows, scanner beam, and HUD crosshairs.
- **Ambient Workstation Motion Background**:
  - Real-time HTML5 particle canvas with interconnected vector filaments and a 360° sweeping radar beam adapted to the active theme accent.
- **Merged Overview & Telemetry Tile**:
  - Live animated threat ingestion bars, surveillance indicators, and system metrics alongside career highlights.
- **Dual Narrative & Technical Experience Log**:
  - Toggle between **First-Person Narrative** (behind-the-scenes engineering stories) and **Technical Specifications** (remediation metrics, tools, and methodologies).
- **Theme Customization Engine**:
  - Instant theme switching between **Crimson Security** (`#c81b1c`), **Matrix Green** (`#00ff66`), and **Amber Gold** (`#ffb000`).
- **Programmatic Audio Engine (Web Audio API)**:
  - Zero external MP3 files: synthetically generated sine, triangle, and sawtooth frequencies for keystrokes, navigation chirps, boot sequence, and window closure blips (muted by default with toggle control).

### 3. Printable Resume Dossier (Stage 3)
- Dedicated CV modal view detailing education, experience, technical skills, and certifications.
- Clean `@media print` layout formatting the dossier into a crisp, recruiter-friendly black-and-white document via `window.print()`.

---

## Tech Stack

- **Runtime / Framework**: React 19, TypeScript, Vanilla Modern JS (ES Modules)
- **Bundler & Tooling**: Vite 8, tsx, esbuild
- **3D Graphics & Shaders**: Three.js (WebGL, Custom GLSL Shaders, GLTFLoader, BufferGeometryUtils)
- **Styling**: Tailwind CSS v4, Custom CSS Variables & Fluid Coordinate Math
- **Animation & Audio**: Web Animations API (WAAPI), HTML5 Canvas 2D, Web Audio API
- **Deployment**: Google Cloud Run / Static Web Hosting

---

## Project Structure

```
├── index.html              # Document shell, Stage 1 Landing markup, HUD Stage, and SVG filters
├── metadata.json           # Application metadata and capabilities
├── package.json            # Project dependencies and build scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
├── src/
│   ├── app.js              # Application orchestrator, mode switching & WAAPI entrance
│   ├── avatar.js           # Procedural 3D wireframe cybernetic avatar canvas
│   ├── cube.js             # 3D Glass Cyber Cube with chromatic dispersion (Three.js)
│   ├── data.js             # Portfolio content, experiences, projects, skills, and certifications
│   ├── hud.js              # HUD workstation controller, directory drawer & window lifecycle
│   ├── motion-bg.js        # Ambient particle matrix & radar sweep canvas background
│   ├── sound.js            # Synthesized Web Audio API sound effects engine
│   ├── styles.css          # Unified stylesheet, OS window system, themes, and responsive queries
│   ├── terminal.js         # Interactive CLI terminal command parser and autocomplete
│   ├── window-manager.js   # OS desktop multi-window manager (8-direction resize, drag, clamp)
│   ├── main.tsx            # React entry point
│   ├── App.tsx             # Root component wrapper
│   └── index.css           # Global Tailwind CSS imports
```

---

## Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/LalithChaitanya1701/portfolio-website.git
   cd portfolio-website
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

4. **Build for production**:
   ```bash
   npm run build
   ```
   The production-ready artifacts will be generated in the `dist/` directory.

5. **Typecheck & Lint**:
   ```bash
   npm run lint
   ```

---

## 👤 Author

**Lalith Chaitanya Mulapala**  
*Cybersecurity Analyst & Systems Engineer*  
- **Email**: [lalithchaitanya.mulapala@gmail.com](mailto:lalithchaitanya.mulapala@gmail.com)  
- **GitHub**: [@LalithChaitanya1701](https://github.com/LalithChaitanya1701)  
- **LinkedIn**: [lalith-chaitanya-mulapala](https://linkedin.com/in/lalith-chaitanya-mulapala)  
- **Education**: B.Tech CSE (Cybersecurity Major, AI/ML Minor) — Guru Nanak Institutions Technical Campus (GNITC)

---

## 📄 License

This project is licensed under the [Apache-2.0 License](LICENSE).
