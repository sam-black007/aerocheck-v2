# aeroCheck - Model Aircraft Flight Calculator & Weather Tracker

A comprehensive aviation dashboard with flight planning tools, real-time weather, and live aircraft tracking.

## Live Demo

🚀 **https://aerocheck-v2.vercel.app**

## Deploy to Vercel

### Option 1: One-Click Deploy (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sam-black007/aerocheck-v2)

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd aerocheck-v2
vercel

# Production deploy
vercel --prod
```

### Option 3: GitHub Integration

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import `sam-black007/aerocheck-v2`
4. Vercel auto-detects Vite framework
5. Click "Deploy"

## Features

### 🧮 Flight Calculator
- 15 aircraft types with physics calculations
- Lift/Drag coefficients, stall speed, glide ratio
- Turn performance, rate of climb

### 🌤️ Weather Integration
- Real-time weather from Open-Meteo
- Air quality index
- Solar information

### 🎮 Weather Simulator
- Density altitude calculator
- Performance impact analysis

### ✈️ Live Flight Tracking
- Real-time aircraft positions via OpenSky Network
- Interactive map with aircraft markers
- Flight details: altitude, speed, heading

### 📍 Flight Tracking
- GPS route logging
- Battery monitoring
- Export to JSON

### 📊 Analytics Dashboard
- Flight history charts
- Performance trends

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS
- Vite
- Leaflet (maps)
- Recharts
- IndexedDB

## Local Development

```bash
# Clone
git clone https://github.com/sam-black007/aerocheck-v2.git
cd aerocheck-v2

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Data Sources

- **Weather**: Open-Meteo API (free, no key)
- **Flights**: OpenSky Network (free ADS-B data)
- **Maps**: CartoDB Dark Tiles (free)

## License

MIT
