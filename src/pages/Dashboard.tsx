import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  CloudSun,
  Wind,
  Droplets,
  Eye,
  Plane,
  Timer,
  TrendingUp,
  Trophy,
  AlertCircle,
  CheckCircle,
  Clock,
  Radio,
  Navigation,
} from 'lucide-react';
import { useGpsTracking, calculateTotalDistance } from '../hooks/useGpsTracking';
import { getAllFlights } from '../lib/db';
import { fetchWeatherData } from '../lib/weather';
import { FlightData, WeatherData } from '../types';

export default function Dashboard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveStats, setLiveStats] = useState({ total: 0, inAir: 0 });
  const timerRef = useRef(0);
  const [timerDisplay, setTimerDisplay] = useState('00:00');
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const {
    isTracking,
    route,
    maxSpeed,
    maxAltitude,
    averageGForce,
    startTracking,
    stopTracking,
  } = useGpsTracking();

  useEffect(() => {
    loadData();
    loadLiveFlights();
  }, []);

  useEffect(() => {
    let interval: number;
    if (isTimerRunning) {
      const startTime = Date.now() - timerRef.current;
      interval = window.setInterval(() => {
        timerRef.current = Date.now() - startTime;
        setTimerDisplay(formatTime(timerRef.current));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  async function loadData() {
    try {
      const [flightData, position] = await Promise.all([
        getAllFlights(),
        new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        }).catch(() => null),
      ]);

      setFlights(flightData);

      if (position) {
        const weatherData = await fetchWeatherData(
          position.coords.latitude,
          position.coords.longitude
        );
        setWeather(weatherData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadLiveFlights() {
    try {
      const response = await fetch(
        'https://opensky-network.org/api/states/all?lamin=35&lomin=-15&lamax=72&lomax=35'
      );
      if (response.ok) {
        const data = await response.json();
        if (data.states) {
          const inAir = data.states.filter((s: any[]) => !s[8]).length;
          setLiveStats({ total: data.states.length, inAir });
        }
      }
    } catch (error) {
      console.error('Failed to load live flights:', error);
    }
  }

  function toggleTimer() {
    if (isTimerRunning) {
      stopTracking();
      timerRef.current = 0;
      setTimerDisplay('00:00');
    } else {
      startTracking();
    }
    setIsTimerRunning(!isTimerRunning);
  }

  function formatTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  const totalFlightTime = flights.reduce((sum, f) => sum + f.duration, 0);
  const totalDistance = calculateTotalDistance(route);

  const getFlyingStatus = () => {
    if (!weather) return { status: 'Unknown', color: 'text-zinc-400', bg: 'bg-zinc-500/10' };
    if (weather.windSpeed > 25 || weather.temperature < -5 || weather.temperature > 40) {
      return { status: 'Poor', color: 'text-red-400', bg: 'bg-red-500/10' };
    }
    if (weather.windSpeed > 15 || weather.temperature < 5 || weather.temperature > 35) {
      return { status: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    }
    return { status: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  };

  const flyingStatus = getFlyingStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <CloudSun className="w-6 h-6 text-white" />
          </span>
          Dashboard
        </h1>
        <p className="text-zinc-400 mt-1">Your flight overview and current conditions</p>
      </div>

      {/* Status Alert */}
      <div className={`alert ${flyingStatus.bg} ${flyingStatus.color.includes('red') ? 'border-red-500/30' : flyingStatus.color.includes('amber') ? 'border-amber-500/30' : 'border-emerald-500/30'}`}>
        {flyingStatus.status === 'Good' ? (
          <CheckCircle className="w-5 h-5 text-emerald-400" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-400" />
        )}
        <span>
          {weather
            ? flyingStatus.status === 'Good'
              ? 'Weather conditions are excellent for flying!'
              : flyingStatus.status === 'Moderate'
              ? 'Exercise caution - conditions are marginal'
              : 'Weather conditions are not suitable for flying'
            : 'Loading weather data...'}
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Total Flights"
          value={flights.length.toString()}
          unit="recorded"
          icon={Plane}
        />
        <MetricCard
          label="Flight Time"
          value={(totalFlightTime / 3600000).toFixed(1)}
          unit="hours"
          icon={Clock}
        />
        <MetricCard
          label="GPS Distance"
          value={totalDistance.toFixed(2)}
          unit="km tracked"
          icon={TrendingUp}
        />
        <MetricCard
          label="Conditions"
          value={flyingStatus.status}
          unit="flying status"
          icon={Wind}
          valueColor={flyingStatus.color}
        />
        <MetricCard
          label="Live Aircraft"
          value={liveStats.total > 0 ? liveStats.total.toLocaleString() : '--'}
          unit={`${liveStats.inAir} in air`}
          icon={Radio}
          valueColor="text-purple-400"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weather Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-primary" />
              Current Weather
            </h2>
            <Link to="/weather" className="text-sm text-primary hover:underline">
              Full details →
            </Link>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-24 bg-bg-elevated rounded-xl" />
            </div>
          ) : weather ? (
            <>
              <div className="text-center py-6 bg-gradient-to-b from-primary/10 to-transparent rounded-xl mb-6">
                <div className="text-6xl mb-2">
                  {weather.temperature > 25 ? '☀️' : weather.temperature < 5 ? '❄️' : '⛅'}
                </div>
                <div className="text-5xl font-bold">{Math.round(weather.temperature)}°C</div>
                <div className="text-zinc-400 capitalize">{weather.condition}</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <WeatherDetail icon={Wind} label="Wind" value={`${Math.round(weather.windSpeed)} km/h`} />
                <WeatherDetail icon={Droplets} label="Humidity" value={`${weather.humidity}%`} />
                <WeatherDetail icon={Eye} label="Visibility" value={`${weather.visibility} km`} />
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-zinc-400">Unable to load weather</div>
          )}
        </div>

        {/* Live Flights Card */}
        <div className="card bg-gradient-to-br from-purple-500/5 to-purple-600/5 border-purple-500/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Radio className="w-5 h-5 text-purple-400" />
              Live Flights
            </h2>
            <Link to="/live" className="text-sm text-purple-400 hover:underline font-medium">
              View All →
            </Link>
          </div>

          <div className="text-center py-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-sm text-purple-400 font-medium">Real-time Tracking</span>
            </div>
            
            <div className="text-5xl font-bold text-purple-400 mb-2">
              {liveStats.total > 0 ? liveStats.total.toLocaleString() : '--'}
            </div>
            <div className="text-zinc-400">aircraft visible</div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-bg/50 rounded-xl p-4">
                <Navigation className="w-5 h-5 mx-auto mb-2 text-emerald-400" />
                <div className="text-xl font-bold text-emerald-400">{liveStats.inAir}</div>
                <div className="text-xs text-zinc-500">In Air</div>
              </div>
              <div className="bg-bg/50 rounded-xl p-4">
                <Plane className="w-5 h-5 mx-auto mb-2 text-zinc-400" />
                <div className="text-xl font-bold">{liveStats.total - liveStats.inAir}</div>
                <div className="text-xs text-zinc-500">On Ground</div>
              </div>
            </div>

            <Link to="/live" className="btn btn-primary w-full mt-6">
              <Radio className="w-4 h-4" />
              Track Live Aircraft
            </Link>
          </div>
        </div>

        {/* Quick Timer */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Timer className="w-5 h-5 text-primary" />
              Quick Timer
            </h2>
          </div>

          <div className="text-center py-6 bg-gradient-to-b from-accent/10 to-transparent rounded-xl mb-6">
            <div className="text-5xl font-bold font-mono text-accent">{timerDisplay}</div>
            <div className="text-zinc-400 mt-2">
              {isTracking ? 'Recording flight...' : 'Ready to fly'}
            </div>
          </div>

          <button
            onClick={toggleTimer}
            className={`btn btn-lg w-full ${isTimerRunning ? 'bg-red-500 hover:bg-red-600' : 'btn-success'}`}
          >
            {isTimerRunning ? (
              <>
                <span>■</span> Stop Flight
              </>
            ) : (
              <>
                <span>▶</span> Start Flight
              </>
            )}
          </button>

          {isTracking && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{Math.round(maxSpeed)}</div>
                <div className="text-xs text-zinc-400">Max km/h</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{Math.round(maxAltitude)}</div>
                <div className="text-xs text-zinc-400">Max m</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{averageGForce.toFixed(1)}</div>
                <div className="text-xs text-zinc-400">Avg G</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Flights */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Recent Flights
          </h2>
          <Link to="/flights" className="text-sm text-primary hover:underline">
            View all →
          </Link>
        </div>

        {flights.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            <Plane className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No flights recorded yet</p>
            <p className="text-sm">Start your first flight to see it here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {flights.slice(0, 5).map((flight) => (
              <div
                key={flight.id}
                className="flex items-center gap-4 p-4 bg-bg rounded-xl border border-zinc-800"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{flight.aircraft}</div>
                  <div className="text-sm text-zinc-400">
                    {new Date(flight.date).toLocaleDateString()} • {flight.maxAltitude}m • {flight.batteryUsed}% battery
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-accent">
                    {formatTime(flight.duration)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  valueColor,
}: {
  label: string;
  value: string;
  unit: string;
  icon: any;
  valueColor?: string;
}) {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider mb-2">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <div className={`text-2xl lg:text-3xl font-bold ${valueColor || 'text-white'}`}>{value}</div>
      <div className="text-sm text-zinc-500">{unit}</div>
    </div>
  );
}

function WeatherDetail({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="text-center p-3 bg-bg rounded-xl">
      <Icon className="w-5 h-5 mx-auto mb-1 text-primary" />
      <div className="font-mono font-semibold">{value}</div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  );
}
