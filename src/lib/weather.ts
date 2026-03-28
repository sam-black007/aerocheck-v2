import { WeatherData, WeatherAlert } from '../types';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';
const SUNRISE_SUNSET_BASE = 'https://api.sunrise-sunset.org/json';
const OPENAQ_BASE = 'https://api.openaq.org/v2/latest';

/**
 * Fetch weather from Open-Meteo (free, no API key)
 */
export async function fetchOpenMeteoWeather(lat: number, lon: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,cloud_cover,surface_pressure,visibility',
    hourly: 'visibility',
    timezone: 'auto',
  });

  const response = await fetch(`${OPEN_METEO_BASE}?${params}`);
  if (!response.ok) throw new Error('Weather fetch failed');

  const data = await response.json();
  const current = data.current;

  return {
    temperature: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    windDirection: current.wind_direction_10m,
    pressure: current.surface_pressure,
    visibility: (current.visibility || 10000) / 1000,
    cloudBase: estimateCloudBase(current.relative_humidity_2m, current.temperature_2m),
    condition: getConditionFromCode(current.weather_code),
    code: current.weather_code,
  };
}

/**
 * Fetch sunrise/sunset times
 */
export async function fetchSunTimes(lat: number, lon: number): Promise<{ sunrise: string; sunset: string }> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lon.toString(),
    formatted: '0',
  });

  const response = await fetch(`${SUNRISE_SUNSET_BASE}?${params}`);
  if (!response.ok) {
    return { sunrise: '06:30', sunset: '18:30' };
  }

  const data = await response.json();
  if (data.status !== 'OK') {
    return { sunrise: '06:30', sunset: '18:30' };
  }

  return {
    sunrise: new Date(data.results.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sunset: new Date(data.results.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Fetch air quality from OpenAQ
 */
export async function fetchAirQuality(lat: number, lon: number): Promise<Partial<WeatherData>> {
  const params = new URLSearchParams({
    city: 'current',
    coordinates: `${lat},${lon}`,
    radius: '10000',
  });

  try {
    const response = await fetch(`${OPENAQ_BASE}?${params}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return {};

    const data = await response.json();
    const results = data.results?.[0]?.measurements || [];

    const getValue = (param: string) => results.find((m: any) => m.parameter === param)?.value || 0;

    return {
      aqi: Math.round(getValue('pm25') / 2.4), // Convert to US AQI
      pm25: Math.round(getValue('pm25') * 10) / 10,
      pm10: Math.round(getValue('pm10') * 10) / 10,
      ozone: Math.round(getValue('o3') * 1000) / 1000,
    };
  } catch {
    return {};
  }
}

/**
 * Get combined weather data
 */
export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const [weather, sunTimes, airQuality] = await Promise.all([
      fetchOpenMeteoWeather(lat, lon),
      fetchSunTimes(lat, lon),
      fetchAirQuality(lat, lon),
    ]);

    return {
      ...weather,
      ...airQuality,
      sunrise: sunTimes.sunrise,
      sunset: sunTimes.sunset,
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    return null;
  }
}

/**
 * Get weather alerts based on conditions
 */
export function getWeatherAlerts(weather: WeatherData): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  // Wind alerts
  if (weather.windSpeed > 30) {
    alerts.push({
      type: 'wind',
      severity: 'high',
      message: 'Dangerous wind conditions - do not fly!',
    });
  } else if (weather.windSpeed > 20) {
    alerts.push({
      type: 'wind',
      severity: 'medium',
      message: 'Strong winds - experienced pilots only',
    });
  } else if (weather.windSpeed > 15) {
    alerts.push({
      type: 'wind',
      severity: 'low',
      message: 'Moderate winds - exercise caution',
    });
  }

  // Temperature alerts
  if (weather.temperature < -5 || weather.temperature > 40) {
    alerts.push({
      type: 'temperature',
      severity: 'high',
      message: 'Extreme temperature - flying not recommended',
    });
  } else if (weather.temperature < 5 || weather.temperature > 35) {
    alerts.push({
      type: 'temperature',
      severity: 'medium',
      message: 'Temperature outside optimal range',
    });
  }

  // Visibility alerts
  if (weather.visibility < 2) {
    alerts.push({
      type: 'visibility',
      severity: 'high',
      message: 'Very low visibility - do not fly',
    });
  } else if (weather.visibility < 5) {
    alerts.push({
      type: 'visibility',
      severity: 'medium',
      message: 'Reduced visibility - VLOS flying only',
    });
  }

  // Rain/weather condition alerts
  const rainCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99];
  if (rainCodes.includes(weather.code)) {
    alerts.push({
      type: 'rain',
      severity: 'high',
      message: 'Precipitation detected - do not fly',
    });
  }

  return alerts;
}

/**
 * Get location from city name using Nominatim
 */
export async function getLocationFromCity(city: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`,
      { headers: { Accept: 'application/json' } }
    );
    const data = await response.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Get weather icon based on code
 */
export function getWeatherIcon(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫';
  if (code <= 55) return '🌧';
  if (code <= 65) return '🌧';
  if (code <= 75) return '❄️';
  if (code <= 82) return '🌨';
  return '⛈';
}

/**
 * Get condition text from weather code
 */
function getConditionFromCode(code: number): string {
  const conditions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Heavy drizzle',
    56: 'Freezing drizzle',
    57: 'Heavy freezing drizzle',
    61: 'Light rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Freezing rain',
    67: 'Heavy freezing rain',
    71: 'Light snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Light showers',
    81: 'Moderate showers',
    82: 'Violent showers',
    85: 'Light snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Severe thunderstorm',
  };
  return conditions[code] || 'Unknown';
}

/**
 * Estimate cloud base height
 */
function estimateCloudBase(humidity: number, temp: C): number {
  // Using simple dewpoint depression method
  const dewpoint = temp - ((100 - humidity) / 5);
  const cloudBase = (temp - dewpoint) * 125; // meters
  return Math.round(Math.max(0, cloudBase));
}

type C = number;
