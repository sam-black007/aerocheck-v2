import { useState, useEffect } from 'react';
import {
  CloudSun,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  MapPin,
  Search,
  Leaf,
  AlertCircle,
} from 'lucide-react';
import { fetchWeatherData, getLocationFromCity, getWeatherAlerts, getWeatherIcon } from '../lib/weather';
import { WeatherData } from '../types';

export default function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    detectLocation();
  }, []);

  async function detectLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const data = await fetchWeatherData(pos.coords.latitude, pos.coords.longitude);
        setWeather(data);
        setLoading(false);
      },
      () => {
        setError('Unable to get location');
        setLoading(false);
      }
    );
  }

  async function searchCity() {
    if (!city.trim()) return;
    
    setLoading(true);
    setError(null);
    
    const location = await getLocationFromCity(city);
    if (location) {
      const data = await fetchWeatherData(location.lat, location.lon);
      setWeather(data);
    } else {
      setError('City not found');
    }
    setLoading(false);
  }

  const alerts = weather ? getWeatherAlerts(weather) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <CloudSun className="w-6 h-6 text-white" />
          </span>
          Weather
        </h1>
        <p className="text-zinc-400 mt-1">Real-time weather data for flight planning</p>
      </div>

      {/* Search */}
      <div className="card">
        <div className="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchCity()}
            className="form-input flex-1 min-w-[200px]"
          />
          <button onClick={searchCity} className="btn btn-primary">
            <Search className="w-4 h-4" />
            Search
          </button>
          <button onClick={detectLocation} className="btn btn-secondary">
            <MapPin className="w-4 h-4" />
            Use Location
          </button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div key={i} className={`alert ${alert.severity === 'high' ? 'alert-danger' : 'alert-warning'}`}>
              <AlertCircle className="w-5 h-5" />
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="card">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-bg-elevated rounded-xl" />
          </div>
        </div>
      ) : weather ? (
        <>
          {/* Main Weather */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="text-center py-8 bg-gradient-to-b from-primary/10 to-transparent rounded-2xl -mx-6 -mt-6 mb-6 px-6">
                <div className="text-8xl mb-4">{getWeatherIcon(weather.code)}</div>
                <div className="text-6xl font-bold">{Math.round(weather.temperature)}°C</div>
                <div className="text-xl text-zinc-400 capitalize mt-2">{weather.condition}</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <WeatherStat icon={Wind} label="Wind" value={`${Math.round(weather.windSpeed)} km/h`} sub={weather.windDirection + '°'} />
                <WeatherStat icon={Droplets} label="Humidity" value={`${weather.humidity}%`} />
                <WeatherStat icon={Eye} label="Visibility" value={`${weather.visibility} km`} />
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold mb-6">Atmospheric Data</h2>
              <div className="grid grid-cols-2 gap-4">
                <WeatherStat icon={Gauge} label="Pressure" value={`${Math.round(weather.pressure)}`} sub="hPa" />
                <WeatherStat icon={CloudSun} label="Cloud Base" value={`${weather.cloudBase}`} sub="m AGL" />
              </div>

              <h3 className="text-lg font-semibold mt-8 mb-6">Solar Information</h3>
              <div className="grid grid-cols-3 gap-4">
                <WeatherStat icon={Sunrise} label="Sunrise" value={weather.sunrise || '--:--'} />
                <WeatherStat icon={Sunset} label="Sunset" value={weather.sunset || '--:--'} />
                <div className="bg-bg rounded-xl p-4 text-center">
                  <div className="text-xs text-zinc-500 mb-1">Daylight</div>
                  <div className="text-lg font-mono font-semibold">
                    {weather.sunrise && weather.sunset
                      ? calculateDaylight(weather.sunrise, weather.sunset)
                      : '--'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Air Quality */}
          {weather.aqi && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-accent" />
                Air Quality Index
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <WeatherStat icon={Leaf} label="AQI (US)" value={weather.aqi?.toString() || '--'} />
                <WeatherStat icon={Leaf} label="PM2.5" value={weather.pm25?.toFixed(1) || '--'} sub="μg/m³" />
                <WeatherStat icon={Leaf} label="PM10" value={weather.pm10?.toFixed(1) || '--'} sub="μg/m³" />
                <WeatherStat icon={Leaf} label="Ozone" value={weather.ozone?.toFixed(3) || '--'} sub="ppm" />
              </div>
            </div>
          )}
        </>
      ) : error ? (
        <div className="card text-center py-12 text-zinc-400">
          <CloudSun className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>{error}</p>
        </div>
      ) : null}
    </div>
  );
}

function WeatherStat({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-bg rounded-xl p-4 text-center">
      <Icon className="w-5 h-5 mx-auto mb-2 text-primary" />
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="text-lg font-mono font-semibold">{value}</div>
      {sub && <div className="text-xs text-zinc-400">{sub}</div>}
    </div>
  );
}

function calculateDaylight(sunrise: string, sunset: string): string {
  try {
    const rise = new Date(`2000/01/01 ${sunrise}`);
    const set = new Date(`2000/01/01 ${sunset}`);
    const diff = (set.getTime() - rise.getTime()) / 3600000;
    return `${diff.toFixed(1)}h`;
  } catch {
    return '--';
  }
}
