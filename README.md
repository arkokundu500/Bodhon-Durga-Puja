# বোধন (Bodhon) — Durga Puja 2026

<div align="center">

![Bodhon Banner](/client/public/durga-gold-wide_329e4673.png)

### মায়ের আগমনের গল্প · শহর জুড়ে আলোর পথ
**A Cinematic, Contemporary Bengali Editorial Guide & Living City Companion for Durga Puja 2026**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2.1-61DAFB.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.1.9-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.14-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3.15.0-88CE02.svg?logo=greensock)](https://greensock.com/)
[![Google Maps](https://img.shields.io/badge/Google_Maps-API_Ready-4285F4.svg?logo=google-maps)](https://developers.google.com/maps)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[✨ Live Local Demo](http://localhost:3000/) · [🗺️ Pandal Directory](http://localhost:3000/guide) · [🎵 Bodhon Radio](http://localhost:3000/#music) · [📖 Quickstart](#-quickstart--how-to-run)

</div>

---

## 🌸 Overview

**বোধন (Bodhon)** is an immersive, bilingual (Bengali–English) digital companion crafted for Durga Puja 2026. Inspired by the quiet dawn of Mahalaya, the rustle of Kashful under autumn skies, and the golden radiance of para pandals across Kolkata and West Bengal, Bodhon seamlessly weaves **devotional storytelling**, **pandal exploration**, **transit intelligence**, and **traditional festive soundscapes** into one unified experience.

---

## 🎨 Design Philosophy: শিউলি সকাল (Morning Shiuli)

Bodhon is designed around the **শিউলি সকাল** aesthetic — contemporary Bengali editorial craftsmanship:
- **Warm Paper Textures**: Cream and soft off-white surfaces (`#F8F1E4`, `#FFF9EF`) recalling hand-made puja invitations.
- **Bodhon Vermilion (`#B52A22`)**: Ritual red reserved for decisive moments, active navigation, route threads, and the sacred third-eye mark.
- **Marigold Radiance (`#E5A62C`, `#F8D36D`)**: Golden ceremonial highlights, transit nodes, and date markers.
- **Deep Ink Brown (`#2A201A`)**: Anchoring display typography and footer ground.
- **Bilingual Typography**: Authentic **Noto Serif Bengali** for emotional headlines and narrative depth paired with **Manrope** for crisp modern utility controls.

---

## ✨ Key Features

### 1. 🔍 Instant Search & Pandal Directory
- **Smooth Search Tool**: Live, debounced search across all 70+ curated pandals in Kolkata and West Bengal.
- **Multi-field Filtering**: Instant matching by pandal name, neighborhood (e.g., Bagbazar, Sovabazar, Ekdalia, Maddox), zone, or description.
- **Distance Sorting**: One-click **"Use my location"** calculates distance from your live GPS position and sorts pandals from nearest to furthest.
- **Tactile Pagination**: 10 pandals per page with clear visual pagination and count badges.

### 2. 🗺️ Dual-Layer Interactive Map & Transit Intelligence
- **Google Maps API**: Full interactive map surface with custom gold and vermilion pins for selected pandals.
- **Own-Built Illustrated Fallback**: Built-in artistic canvas map fallback showing Kolkata transit zones if Google Maps is offline.
- **Transit Hubs**: Automatically identifies and displays the nearest **Kolkata Metro station** (Blue/Green lines) and **Bus stop** for every pandal with walking distance estimates.
- **"Guide Me" Directions**: Instant Google Maps navigation links with exact latitude/longitude decimal coordinates.

### 3. 📻 Bodhon Radio (Spotify-like Glider)
- **Ceremonial Audio Player**: Built-in festive music player featuring classic Agomoni and celebratory tracks:
  - *ঢাক বাজা কাঁসর বাজা* (Dhak Baja Kashor Baja)
  - *ঢাকের তালে* (Dhaker Taley)
  - *দুগ্গা মা* (Dugga Ma)
  - *দুগ্গা এলো* (Dugga Elo)
- **Gramophone Reel Animation**: Vinyl disc / alpona wheel with synchronized GSAP rotation while playing.
- **Interactive Scrubber**: Full track seeking, previous/next skipping, and volume/mute controls.

### 4. ⏳ Mahalaya & Puja 2026 Countdown
- Real-time precision countdown to Mahalaya dawn (October 10, 2026).
- Complete Bengali ritual calendar spanning Maha Panchami through Vijaya Dashami with verified tithi notes.

### 5. 👥 Live Celebration Visitor Counter
- Ceremonial visitor count badge in the footer with live session tracking and glowing status indicator.

---

## 🚀 Quickstart — How to Run

Running Bodhon locally on your machine is straightforward.

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **Package Manager**: `npm` or `pnpm`

---

### Step 1: Install Dependencies
Open your terminal in the project directory and run:

```bash
npm install
```
*(or `pnpm install`)*

---

### Step 2: Configure Environment (Optional)
The project comes pre-configured with the Google Maps Demo API key. If you wish to customize keys or ports, check `.env.local`:

```env
NODE_ENV=development
PORT=3000
VITE_GOOGLE_MAPS_USE_DIRECT=true
VITE_GOOGLE_MAPS_API_KEY="Collect from Google MAPS"
```

---

### Step 3: Start the Development Server
Simply run:

```bash
npm run dev
```

Open your browser and navigate to:
```
👉 http://localhost:3000/
```

---

### Step 4: Run Tests
To run the automated Vitest test suite (8 test files, 18 unit tests):

```bash
npm test
```

---

### Step 5: Production Build
To create an optimized production bundle:

```bash
npm run build
npm start
```

---

## ⚡ Deploying to Vercel

Bodhon is pre-configured with `vercel.json` and serverless API handlers in `api/` for zero-configuration 1-click deployment on [Vercel](https://vercel.com).

### Option A: Deploy via GitHub (Recommended)
1. Push your repository to **GitHub**:
   ```bash
   git add .
   git commit -m "Deploy Bodhon to Vercel"
   git push origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New" ➔ "Project"**.
3. Select and import your **`durga_puja`** repository.
4. In **Project Settings**:
   - **Framework Preset**: `Vite` (automatically detected)
   - **Build Command**: `vite build` (or `npm run build`)
   - **Output Directory**: `dist/public`
5. *(Optional)* Under **Environment Variables**, add:
   - `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps API key
   - `VITE_GOOGLE_MAPS_USE_DIRECT`: `true`
6. Click **Deploy**! 🚀

---

### Option B: Deploy via Vercel CLI
If you have `vercel` CLI installed:
```bash
npx vercel
# Follow the interactive prompts and deploy to production:
npx vercel --prod
```

---

## 🛠️ Tech Stack & Dependencies

```text
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Vite 7 + React 19)               │
│  ├── TailwindCSS v4 + Radix UI Primitives                   │
│  ├── GSAP ScrollTrigger + Framer Motion (Ceremonial Motion) │
│  ├── Zustand (Selected Pandal & Audio Player State)         │
│  ├── TanStack Query + tRPC Client (Data Hydration)          │
│  └── Google Maps JavaScript SDK (Live Map Surface)          │
├─────────────────────────────────────────────────────────────┤
│                    SERVER (Node.js + Express 4)             │
│  ├── tRPC Server v11 (Typed Endpoints)                      │
│  ├── Storage Proxy (Local /client/public/ Asset Streamer)   │
│  ├── Drizzle ORM + MySQL/TiDB (Lazy DB Connection)          │
│  └── Transit Routing & A* Node Path Calculations            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Directory Structure

```
durga_puja/
├── client/
│   ├── public/                  # Static media assets (MP3s, MP4 loop, WebP images)
│   ├── src/
│   │   ├── components/          # Reusable UI components (SiteHeader, AudioDock, PandalMap, etc.)
│   │   ├── data/                # Kolkata datasets (csv-pandals.json, metro-stations.json, bus-stops.json)
│   │   ├── lib/                 # Core data stores (bodhon-data.ts, a-star.ts, location.ts)
│   │   ├── pages/               # Views (Home.tsx, PandalGuide.tsx, MediaManager.tsx, NotFound.tsx)
│   │   ├── _core/               # Client authorization & hooks (useAuth.ts)
│   │   ├── App.tsx              # Application shell & Wouter router
│   │   └── index.css            # Custom design tokens & alpona styling
├── server/
│   ├── _core/                   # Express bootstrap, storage proxy, Google Maps helper
│   ├── routers.ts               # tRPC routes (guide.route, media.list, auth.me)
│   └── db.ts                    # Drizzle ORM client
├── .env.local                   # Local environment configuration
├── package.json                 # Project dependencies and npm scripts
└── README.md                    # Project documentation
```

---

## 📍 Adding New Pandals

All pandals are centrally driven by `client/src/data/csv-pandals.json` and typed in `client/src/lib/bodhon-data.ts`.

To add a new pandal, append an object with the following schema:

```json
{
  "id": "new-pandal-id",
  "name": "Pandal Name (প্যান্ডেলের নাম)",
  "address": "Street Address, Kolkata",
  "category": "North Kolkata / South Kolkata",
  "lat": 22.5852,
  "lng": 88.3712,
  "description": "Artistic theme description and highlights."
}
```
*The map markers, search bar, distance calculations, and transit cards will automatically incorporate the new entry without modifying component markup.*

---

## 📜 Available NPM Scripts

| Command | Action |
| --- | --- |
| `npm run dev` | Starts the unified Vite + Express development server on `http://localhost:3000` |
| `npm run build` | Compiles client assets and bundles server code into `dist/` |
| `npm start` | Runs the compiled production build from `dist/index.js` |
| `npm test` | Runs the full Vitest unit test suite |
| `npm run check` | Runs the TypeScript compiler check (`tsc --noEmit`) |
| `npm run format`| Formats the codebase with Prettier |

---

## 🤝 Contact & Credits

- **Creator**: Arko Kundu
- **Email**: [arkokundu.tech@gmail.com](mailto:arkokundu.tech@gmail.com)
- **Phone**: +91 7439817750
- **Dedicated to**: The eternal spirit of Durga Puja, Kolkata, and the artists of Bengal.

<div align="center">

### শুভ শারদীয়া · See you under the lights. ✨

</div>
