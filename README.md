# Vedic Foundation — 3D Interactive Jyotish Studio, Voice Mentor & Remedy Report

**Vedic Foundation** is a full-stack Vedic astrology platform combining a **3D Interactive North Indian Kundli Mandapa**, **Deepanshu Giri (Lunar Astro) Voice Mentor**, **9-Planet Navagraha Remedy Report**, **Wix Studio Embed SDK**, and **GitHub Skills Upgrade Architecture**.

## Features

- **Upload-First Wix Studio Interface**: Starts with a clean, unpopulated canvas so users can upload their own Kundli screenshots (AstroSage, Jagannatha Hora, Lunar Astro PDFs/screenshots) for Gemini Vision OCR extraction or generate a live Sidereal ephemeris chart from Birth Date, Time, and City.
- **3D Interactive Blender Mandapa (`Three.js` / `@react-three/fiber`)**: Extruded obsidian-and-gold 12-Bhava diamond Kundli with custom sacred-geometry Navagraha tokens, orbit/isometric camera presets, and click-to-inspect Bhava rays.
- **GitHub Skills Upgrade Hub**:
  - `@vedic-foundation/lahiri-ephemeris` — High-precision Sidereal Lahiri (Chitrapaksha), Raman, and KP Ayanamsa ephemeris engine.
  - `@vedic-foundation/lunar-astro-dictums` — Deepanshu Giri (Lunar Astro) Pending Karma, Blind Chart & 3rd-Step Nakshatra Lord engine.
  - `@vedic-foundation/bnn-trinal-circuit` — Bhrigu Nandi Nadi (BNN) Trinal (1-5-9) directional circuit & degree-conjunction analyzer.
  - `@vedic-foundation/blender-3d-mandapa` — Three.js PBR shaders, OrbitControls, and Navagraha 3D mesh tokens.
  - `@vedic-foundation/navagraha-remedy-report` — Official 9-Planet Navagraha Remedy Report & 3/6/12-Month natural Sadhana tracker.
  - Live **GitHub Repository Inspector** (`/api/github/repo-inspect`), exportable `vedic-foundation-skills.json` manifest, and GitHub Actions CI/CD workflow (`deploy-vedic-foundation.yml`).
- **Zero-Trust Security**: AES-GCM 256-bit client-side vault encryption + Firebase Authentication & Firestore security rules (`firestore.rules`).

## Getting Started

### Prerequisites

- Node.js 22+
- `GEMINI_API_KEY` configured in `.env`

### Installation & Local Development

```bash
npm install
npm run dev
```

The server starts on `http://0.0.0.0:3000` (Express + Vite middleware).

### Testing & Build

```bash
npx tsx --test src/utils/shastiamshaLogic.test.ts firestore.rules.test.ts
npm run build
```
