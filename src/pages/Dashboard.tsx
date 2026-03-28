import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  MapPin,
  Activity,
  Sun,
  Moon,
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
  const [liveFlights, setLiveFlights] = useState<any[]>([]);
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
    const interval = setInterval(loadLiveFlights, 15000);
    return () => clearInterval(interval);
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
        new Promise<GeolocationPosition>((resolve) => {
          navigator.geolocation.getCurrentPosition(resolve, () => resolve(null as any), { timeout: 5000 });
        }),
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
          const flightsData = data.states
            .filter((s: any[]) => s[5] && s[6] && !s[8])
            .slice(0, 20)
            .map((s: any[]) => ({
              icao: s[0],
              callsign: s[1]?.trim() || 'Unknown',
              country: s[2],
              lat: s[6],
              lon: s[5],
              alt: Math.round(s[7] || 0),
              speed: Math.round((s[9] || 0) * 3.6),
              heading: Math.round(s[10] || 0),
              vertical: s[11] || 0,
            }));

          setLiveStats({
            total: data.states.length,
            inAir: data.states.filter((s: any[]) => !s[8]).length,
          });
          setLiveFlights(flightsData);
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
    if (!weather) return { status: 'Unknown', color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/30' };
    if (weather.windSpeed > 25 || weather.temperature < -5 || weather.temperature > 40) {
      return { status: 'Poor', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
    }
    if (weather.windSpeed > 15 || weather.temperature < 5 || weather.temperature > 35) {
      return { status: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    }
    return { status: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
  };

  const flyingStatus = getFlyingStatus();
  const isNight = new Date().getHours() > 18 || new Date().getHours() < 6;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <CloudSun className="w-6 h-6 text-white" />
          </span>
          <span className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
            aeroCheck
          </span>
        </h1>
        <p className="text-zinc-400 mt-1">Aviation Dashboard • Real-time Flight Tracking</p>
      </div>

      <div className={`alert ${flyingStatus.bg} ${flyingStatus.border}`}>
        {flyingStatus.status === 'Good' ? (
          <CheckCircle className="w-5 h-5 text-emerald-400" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-400" />
        )}
        <span className={flyingStatus.color}>
          {weather
            ? flyingStatus.status === 'Good'
              ? '✓ Weather conditions are excellent for flying!'
              : flyingStatus.status === 'Moderate'
              ? '⚠ Exercise caution - conditions are marginal'
              : '✗ Weather conditions are not suitable for flying'
            : 'Loading weather data...'}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Total Flights"
          value={flights.length.toString()}
          unit="recorded"
          icon={Plane}
          color="from-cyan-500 to-blue-500"
        />
        <MetricCard
          label="Flight Time"
          value={(totalFlightTime / 3600000).toFixed(1)}
          unit="hours"
          icon={Clock}
          color="from-emerald-500 to-teal-500"
        />
        <MetricCard
          label="GPS Distance"
          value={totalDistance.toFixed(2)}
          unit="km tracked"
          icon={TrendingUp}
          color="from-purple-500 to-pink-500"
        />
        <MetricCard
          label="Conditions"
          value={flyingStatus.status}
          unit="flying status"
          icon={Wind}
          color={flyingStatus.color.includes('emerald') ? 'from-emerald-500 to-green-500' : flyingStatus.color.includes('amber') ? 'from-amber-500 to-orange-500' : 'from-red-500 to-rose-500'}
        />
        <MetricCard
          label="Live Aircraft"
          value={liveStats.total > 0 ? liveStats.total.toLocaleString() : '--'}
          unit={`${liveStats.inAir} in air`}
          icon={Radio}
          color="from-violet-500 to-purple-500"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-zinc-900 to-zinc-900/50 border-cyan-500/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
              <CloudSun className="w-5 h-5" />
              Current Weather
            </h2>
            <Link to="/weather" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
              Full details →
            </Link>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-zinc-800/50 rounded-xl" />
            </div>
          ) : weather ? (
            <>
              <div className="text-center py-6 bg-gradient-to-b from-cyan-500/10 to-transparent rounded-xl mb-6">
                <div className="text-6xl mb-2">{isNight ? '🌙' : weather.temperature > 25 ? '☀️' : weather.temperature < 5 ? '❄️' : '⛅'}</div>
                <div className="text-5xl font-bold text-white">{Math.round(weather.temperature)}°C</div>
                <div className="text-zinc-400 capitalize mt-2">{weather.condition}</div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <WeatherDetail icon={Wind} label="Wind" value={`${Math.round(weather.windSpeed)} km/h`} />
                <WeatherDetail icon={Droplets} label="Humidity" value={`${weather.humidity}%`} />
                <WeatherDetail icon={Eye} label="Visibility" value={`${weather.visibility} km`} />
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-zinc-400">Unable to load weather</div>
          )}
        </div>

        <div className="card bg-gradient-to-br from-zinc-900 to-zinc-900/50 border-violet-500/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-violet-400 flex items-center gap-2">
              <Radio className="w-5 h-5" />
              Live Aircraft Tracking
            </h2>
            <Link to="/live" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
              Full map →
            </Link>
          </div>

          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-sm text-violet-400 font-medium">Real-time ADS-B</span>
            </div>
            
            <div className="text-5xl font-bold text-violet-400 mb-2">
              {liveStats.total > 0 ? liveStats.total.toLocaleString() : '--'}
            </div>
            <div className="text-zinc-400">aircraft visible</div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-zinc-800/50 rounded-xl p-4 border border-emerald-500/20">
                <Navigation className="w-5 h-5 mx-auto mb-2 text-emerald-400" />
                <div className="text-xl font-bold text-emerald-400">{liveStats.inAir}</div>
                <div className="text-xs text-zinc-500">In Air</div>
              </div>
              <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-600/50">
                <Plane className="w-5 h-5 mx-auto mb-2 text-zinc-400" />
                <div className="text-xl font-bold text-zinc-300">{liveStats.total - liveStats.inAir}</div>
                <div className="text-xs text-zinc-500">On Ground</div>
              </div>
            </div>

            {liveFlights.length > 0 && (
              <div className="mt-6 text-left">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Nearby Aircraft</div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {liveFlights.slice(0, 5).map((flight, i) => (
                    <div key={i} className="bg-zinc-800/30 rounded-lg p-2 text-sm flex justify-between items-center">
                      <span className="font-mono text-cyan-400">{flight.callsign || 'N/A'}</span>
                      <span className="text-zinc-400">{flight.alt}m</span>
                      <span className="text-zinc-500">{flight.speed} km/h</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link to="/live" className="btn btn-primary w-full mt-6 bg-gradient-to-r from-violet-600 to-purple-600">
              <Radio className="w-4 h-4" />
              Track Live Aircraft
            </Link>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-zinc-900 to-zinc-900/50 border-emerald-500/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-emerald-400 flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Quick Timer
            </h2>
          </div>

          <div className="text-center py-6 bg-gradient-to-b from-emerald-500/10 to-transparent rounded-xl mb-6">
            <div className="text-5xl font-bold font-mono text-emerald-400">{timerDisplay}</div>
            <div className="text-zinc-400 mt-2 flex items-center justify-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isTimerRunning ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
              {isTimerRunning ? 'Recording flight...' : 'Ready to fly'}
            </div>
          </div>

          <button
            onClick={toggleTimer}
            className={`btn btn-lg w-full ${isTimerRunning ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'}`}
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
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                <Activity className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                <div className="text-lg font-bold text-cyan-400">{Math.round(maxSpeed)}</div>
                <div className="text-xs text-zinc-500">Max km/h</div>
              </div>
              <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                <TrendingUp className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                <div className="text-lg font-bold text-cyan-400">{Math.round(maxAltitude)}</div>
                <div className="text-xs text-zinc-500">Max m</div>
              </div>
              <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                <Activity className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                <div className="text-lg font-bold text-cyan-400">{averageGForce.toFixed(1)}</div>
                <div className="text-xs text-zinc-500">Avg G</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card bg-gradient-to-br from-zinc-900 to-zinc-900/50 border-cyan-500/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Recent Flights
          </h2>
          <Link to="/flights" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
            View all →
          </Link>
        </div>

        {flights.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            <Plane className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No flights recorded yet</p>
            <p className="text-sm text-zinc-500">Start your first flight to see it here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {flights.slice(0, 5).map((flight) => (
              <div
                key={flight.id}
                className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 hover:border-cyan-500/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-zinc-200">{flight.aircraft}</div>
                  <div className="text-sm text-zinc-400">
                    {new Date(flight.date).toLocaleDateString()} • {flight.maxAltitude}m • {flight.batteryUsed}% battery
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-emerald-400">
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
  color,
}: {
  label: string;
  value: string;
  unit: string;
  icon: any;
  color: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 group hover:border-cyan-500/30 transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity`} />
      <div className="relative">
        <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider mb-2">
          <Icon className="w-4 h-4" />
          {label}
        </div>
        <div className={`text-2xl lg:text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
          {value}
        </div>
        <div className="text-sm text-zinc-500 mt-1">{unit}</div>
      </div>
    </div>
  );
}

function WeatherDetail({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-zinc-800/50 rounded-xl p-3 text-center border border-cyan-500/10">
      <Icon className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
      <div className="font-mono font-semibold text-zinc-200">{value}</div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  );
}
