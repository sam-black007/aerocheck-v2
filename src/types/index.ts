export interface AircraftType {
  id: string;
  name: string;
  icon: string;
  category: 'fixed-wing' | 'multirotor' | 'rotor' | 'special';
  wingspan: number; // cm
  weight: number; // grams
  wingArea: number; // cm²
  aspectRatio: number;
  motorPower: number; // watts
  battery: number; // mAh
  voltage: number; // V
  bestFor: string;
  cd0: number; // zero-lift drag coefficient
  clMax: number; // max lift coefficient
  Oswald: number; // Oswald efficiency factor
}

export interface FlightData {
  id: string;
  date: string;
  duration: number; // milliseconds
  aircraft: string;
  maxAltitude: number; // meters
  maxSpeed: number; // km/h
  batteryUsed: number; // percentage
  gForce: number; // average g-force
  notes: string;
  route?: GpsPoint[];
}

export interface GpsPoint {
  lat: number;
  lon: number;
  alt: number;
  timestamp: number;
  speed?: number;
}

export interface WeatherData {
  temperature: number; // °C
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection: number; // degrees
  pressure: number; // hPa
  visibility: number; // km
  cloudBase: number; // m
  condition: string;
  code: number;
  aqi?: number;
  pm25?: number;
  pm10?: number;
  ozone?: number;
  sunrise?: string;
  sunset?: string;
}

export interface SimulatorState {
  temperature: number;
  windSpeed: number;
  humidity: number;
  altitude: number;
  densityAltitude: number;
  airDensityRatio: number;
  liftLoss: number;
  thrustLoss: number;
  rangeLoss: number;
  rocLoss: number;
}

export interface CalculationResult {
  stallSpeed: number; // km/h
  cruiseSpeed: number;
  maxSpeed: number;
  rateOfClimb: number; // m/s
  glideRatio: number;
  turnRadius: number; // m
  turnRate: number; // °/s
  endurance: number; // minutes
  wingLoading: number; // g/dm²
  thrustWeight: number;
  liftCoefficient: number;
  dragCoefficient: number;
  stabilityFactor: number;
  cgPosition: number; // % MAC
  propellerEfficiency: number;
  ceiling: number; // service ceiling in m
}

export interface AppState {
  flights: FlightData[];
  selectedAircraft: AircraftType | null;
  weather: WeatherData | null;
  simulator: SimulatorState;
  settings: Settings;
  gpsTracking: boolean;
  currentRoute: GpsPoint[];
}

export interface Settings {
  units: 'metric' | 'imperial';
  tempUnit: 'celsius' | 'fahrenheit';
  defaultAircraft: string;
  apiKeys: {
    openWeather?: string;
    weatherApi?: string;
    tomorrow?: string;
    aviationstack?: string;
  };
}

export interface WeatherAlert {
  type: 'wind' | 'rain' | 'temperature' | 'visibility';
  severity: 'low' | 'medium' | 'high';
  message: string;
}
