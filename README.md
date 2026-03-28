# aeroCheck - Model Aircraft Flight Calculator & Weather Tracker

A comprehensive flight planning tool for hobbyist RC pilots featuring accurate aviation physics calculations and real-time weather data.

## Live Demo

🚀 **https://sam-black007.github.io/aerocheck/**

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
git clone https://github.com/sam-black007/aerocheck.git
cd aerocheck

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
| `/models` | Aircraft database |
| `/analytics` | Flight analytics charts |
| `/compare` | Model comparison |
| `/settings` | Configuration |

## API Keys (Optional)

Weather APIs with free tiers:
- OpenWeatherMap - 60 calls/min
- WeatherAPI - 1M calls/month
- Tomorrow.io - 500 calls/day
- NOAA - Free

Add API keys in Settings page for premium features.

## License

MIT License
