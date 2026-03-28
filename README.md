# aeroCheck - Model Aircraft Flight Calculator & Weather Tracker

A comprehensive flight planning tool for hobbyist RC pilots featuring accurate aviation physics calculations, real-time weather data, and live aircraft tracking.

## Live Demo

🚀 **https://sam-black007.github.io/aerocheck-full/**

## Features

### 🧮 Flight Calculator
- 15 aircraft types with accurate physics engine
- Lift coefficient (Cl) & drag coefficient (Cd)
- Stall speed, cruise speed, max speed
- Rate of climb (ROC), glide ratio
- Turn radius and turn rate
- Wing loading & thrust-to-weight ratio
- Stability factor, CG position
- Motor & propeller efficiency
- Service ceiling calculation

### 🌤️ Weather Integration (7 APIs)
- OpenWeatherMap, WeatherAPI, Tomorrow.io
- AVWX (Aviation Weather), NOAA
- Air Quality Index (OpenAQ)
- Solar information (sunrise/sunset)
- Weather alerts for flying conditions

### 🎮 Weather Simulator
- Adjust temperature (-20°C to +50°C)
- Adjust wind speed, humidity, altitude
- Calculate density altitude impact
- Performance impact analysis

### 📍 Flight Tracking
- GPS route logging
- Altitude and speed tracking
- Battery consumption monitoring
- G-force logging
- Export to JSON

### ✈️ Live Flight Tracking
- Real-time aircraft positions via OpenSky Network
- Searchable flight list
- Detailed flight information:
  - Callsign, origin country
  - Altitude, speed, heading
  - Vertical rate (climbing/descending)
  - Squawk code
- Position on map (Google Maps link)

### 📊 Analytics Dashboard
- Flight history charts
- Performance trends
- Personal records
- Aircraft usage statistics

### ⚖️ Model Comparison
- Side-by-side aircraft comparison
- Performance radar chart
- Best model recommendation

## Tech Stack

- React 18 - UI framework
- TypeScript - Type safety
- Tailwind CSS - Styling
- Vite - Build tool
- React Router - Navigation
- Recharts - Data visualization
- IndexedDB - Local storage

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/sam-black007/aerocheck-full.git
cd aerocheck-full

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard - overview and quick timer |
| `/calculator` | Flight performance calculator |
| `/simulator` | Weather impact simulator |
| `/weather` | Live weather & air quality |
| `/flights` | Flight log and GPS tracking |
| `/live` | Live aircraft tracking |
| `/models` | Aircraft database |
| `/analytics` | Flight analytics charts |
| `/compare` | Model comparison |
| `/settings` | Configuration |

## Data Sources

### Weather APIs (Optional API Keys)
- OpenWeatherMap - 60 calls/min
- WeatherAPI - 1M calls/month
- Tomorrow.io - 500 calls/day
- NOAA - Free

### Live Flight Data
- **OpenSky Network** - Real-time ADS-B flight tracking (free for non-commercial use)
  - No API key required
  - Updates every 30 seconds
  - Covers Europe and parts of North America

Add API keys in Settings page for premium features.

## License

MIT License
