# aeroCheck - Model Aircraft Flight Calculator

A comprehensive flight planning tool for hobbyist RC pilots featuring accurate aviation physics calculations and real-time weather data.

## Live Demo

🚀 **https://sam-black007.github.io/aerocheck/**

## Features

### 🧮 Flight Calculator
- 15 aircraft types (Fixed Wing, Quadcopter, Hexacopter, VTOL, Helicopter, Sailplane, and more)
- Accurate physics engine using real aviation formulas:
  - Lift coefficient (Cl) & Drag coefficient (Cd)
  - Stall speed, cruise speed, max speed
  - Rate of climb (ROC)
  - Glide ratio and turn performance
  - Wing loading & thrust-to-weight ratio
  - Endurance calculation

### 🌤️ Weather Integration
- Real-time weather from Open-Meteo API (no API key required)
- Wind speed, direction, and gusts
- Temperature, humidity, pressure
- Cloud base estimation
- Flying conditions assessment

### 🎮 Weather Simulator
- Adjust temperature (-20°C to +50°C)
- Adjust wind speed, humidity, altitude
- Calculate density altitude impact
- Performance impact analysis (lift loss, thrust loss, range loss)

### 📋 Flight Log
- Start/stop flight timer
- Track max altitude and battery usage
- Export flights to JSON
- Local storage persistence

### ⚖️ Model Comparison
- Side-by-side comparison of 2 models
- Compare all performance metrics
- Best use case recommendations

## Usage

Simply open `index.html` in any browser - no build step or server required!

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard - overview and quick timer |
| `/calculator` | Flight performance calculator |
| `/weather` | Detailed weather data |
| `/simulator` | Weather impact simulator |
| `/flights` | Flight log and tracking |
| `/models` | Aircraft database |
| `/compare` | Model comparison |

## Aircraft Types

1. Fixed Wing - General flying, training
2. Quadcopter - Aerial photography
3. Hexacopter - Heavy lift, professional
4. VTOL - Vertical takeoff/landing
5. Helicopter - 3D aerobatics
6. Sailplane - Thermal soaring
7. Delta Wing - Fast sport flying
8. Biplane - Scale flying
9. Flying Wing - Efficient cruise
10. Park Flyer - Beginners
11. Warbird - Scale realism
12. Jet Turbine - High speed
13. Tricopter - Lightweight agile
14. Octocopter - Cinema, heavy lift
15. Hot Air Balloon - Casual, indoor

## Physics Formulas Used

```
Stall Speed: Vs = √(2W / (ρ × S × Cl_max))
Wing Loading: WL = Weight / Wing Area
Thrust/Weight: T/W = Thrust / Weight
Rate of Climb: ROC = (Power_available - Power_required) / Weight
Glide Ratio: L/D = √(π × AR × e / 4 × Cdp)
Density Altitude: DA = PA + (120 × ΔT)
```

## Tech Stack

- Pure HTML/CSS/JavaScript (no dependencies)
- Open-Meteo API for weather data
- LocalStorage for data persistence
- Responsive design (mobile-friendly)

## License

MIT License

## Author

Built with ❤️ for RC pilots everywhere
