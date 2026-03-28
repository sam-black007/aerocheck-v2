import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Timer,
  Plane,
  Mountain,
  Battery,
  Save,
  Download,
  Trash2,
  Play,
  Square,
  MapPin,
  Activity,
} from 'lucide-react';
import { useGpsTracking, calculateTotalDistance } from '../hooks/useGpsTracking';
import { getAllFlights, saveFlight, deleteFlight, clearAllFlights, exportFlightsToJSON, downloadJSON } from '../lib/db';
import { FlightData } from '../types';

const aircraftOptions = [
  'Fixed Wing', 'Quadcopter', 'Hexacopter', 'VTOL', 'Helicopter',
  'Sailplane', 'Delta Wing', 'Biplane', 'Flying Wing', 'Park Flyer',
  'Warbird', 'Jet Turbine', 'Tricopter', 'Octocopter', 'Hot Air Balloon'
];

export default function Flights() {
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerDisplay, setTimerDisplay] = useState('00:00:00');
  const [formData, setFormData] = useState({
    aircraft: 'Fixed Wing',
    maxAltitude: '',
    batteryUsed: '',
    notes: '',
  });

  const timerRef = useRef(0);
  const startTimeRef = useRef(0);

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
    loadFlights();
  }, []);

  useEffect(() => {
    let interval: number;
    if (isTimerRunning) {
      const startTime = Date.now() - timerRef.current;
      interval = window.setInterval(() => {
        timerRef.current = Date.now() - startTime;
        setTimerDisplay(formatDuration(timerRef.current));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  async function loadFlights() {
    const data = await getAllFlights();
    setFlights(data);
  }

  function toggleFlight() {
    if (isTimerRunning) {
      stopTracking();
      timerRef.current = 0;
      setTimerDisplay('00:00:00');
    } else {
      startTracking();
      startTimeRef.current = Date.now();
    }
    setIsTimerRunning(!isTimerRunning);
  }

  async function saveCurrentFlight() {
    if (timerRef.current < 10000) {
      alert('Flight too short to save');
      return;
    }

    const flight: FlightData = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      duration: timerRef.current,
      aircraft: formData.aircraft,
      maxAltitude: maxAltitude || Number(formData.maxAltitude) || 0,
      maxSpeed: maxSpeed || 0,
      batteryUsed: Number(formData.batteryUsed) || 0,
      gForce: averageGForce,
      notes: formData.notes,
      route: route.length > 0 ? route : undefined,
    };

    await saveFlight(flight);
    await loadFlights();

    // Reset form
    setFormData({ aircraft: 'Fixed Wing', maxAltitude: '', batteryUsed: '', notes: '' });
    setTimerDisplay('00:00:00');
    timerRef.current = 0;
    setIsTimerRunning(false);
  }

  async function handleDeleteFlight(id: string) {
    if (confirm('Delete this flight?')) {
      await deleteFlight(id);
      await loadFlights();
    }
  }

  async function handleExport() {
    const json = exportFlightsToJSON(flights);
    downloadJSON(json, `aerocheck-flights-${new Date().toISOString().split('T')[0]}.json`);
  }

  async function handleClearAll() {
    if (confirm('Delete all flights? This cannot be undone.')) {
      await clearAllFlights();
      await loadFlights();
    }
  }

  function formatDuration(ms: number): string {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  const totalDistance = calculateTotalDistance(route);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Timer className="w-6 h-6 text-white" />
          </span>
          Flight Log
        </h1>
        <p className="text-zinc-400 mt-1">Track and manage your flight history</p>
      </div>

      {/* Active Session */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-6">Active Session</h2>

        <div className="text-center py-8 bg-gradient-to-b from-accent/10 to-transparent rounded-2xl mb-6">
          <div className="text-6xl font-bold font-mono text-accent">{timerDisplay}</div>
          <div className="text-zinc-400 mt-2">
            {isTimerRunning ? 'Recording flight...' : 'Ready to record'}
          </div>
        </div>

        {isTimerRunning && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-bg rounded-xl p-4 text-center">
              <MapPin className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="text-lg font-mono font-semibold">{Math.round(maxAltitude)}</div>
              <div className="text-xs text-zinc-500">Max Alt (m)</div>
            </div>
            <div className="bg-bg rounded-xl p-4 text-center">
              <Activity className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="text-lg font-mono font-semibold">{Math.round(maxSpeed)}</div>
              <div className="text-xs text-zinc-500">Max km/h</div>
            </div>
            <div className="bg-bg rounded-xl p-4 text-center">
              <Plane className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="text-lg font-mono font-semibold">{totalDistance.toFixed(2)}</div>
              <div className="text-xs text-zinc-500">Distance (km)</div>
            </div>
            <div className="bg-bg rounded-xl p-4 text-center">
              <Activity className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="text-lg font-mono font-semibold">{averageGForce.toFixed(1)}</div>
              <div className="text-xs text-zinc-500">Avg G-Force</div>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="form-label">Aircraft</label>
            <select
              value={formData.aircraft}
              onChange={(e) => setFormData({ ...formData, aircraft: e.target.value })}
              className="form-input form-select"
            >
              {aircraftOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Max Altitude (m)</label>
            <input
              type="number"
              value={formData.maxAltitude}
              onChange={(e) => setFormData({ ...formData, maxAltitude: e.target.value })}
              placeholder="120"
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Battery Used (%)</label>
            <input
              type="number"
              value={formData.batteryUsed}
              onChange={(e) => setFormData({ ...formData, batteryUsed: e.target.value })}
              placeholder="75"
              min="0"
              max="100"
              className="form-input"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="form-label">Flight Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Weather conditions, location, observations..."
            rows={2}
            className="form-input"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={toggleFlight}
            className={`btn btn-lg flex-1 ${isTimerRunning ? 'bg-red-500 hover:bg-red-600' : 'btn-success'}`}
          >
            {isTimerRunning ? (
              <>
                <Square className="w-5 h-5" />
                End Flight
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Flight
              </>
            )}
          </button>
          {isTimerRunning && (
            <button onClick={saveCurrentFlight} className="btn btn-primary btn-lg">
              <Save className="w-5 h-5" />
              Save
            </button>
          )}
        </div>
      </div>

      {/* Flight History */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Flight History</h2>
          <div className="flex gap-2">
            <button onClick={handleExport} className="btn btn-secondary btn-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
            {flights.length > 0 && (
              <button onClick={handleClearAll} className="btn btn-danger btn-sm">
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {flights.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <Plane className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold">No flights recorded</p>
            <p className="text-sm">Start your first flight to see it here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {flights.map((flight) => (
              <div key={flight.id} className="flex items-center gap-4 p-4 bg-bg rounded-xl border border-zinc-800">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{flight.aircraft}</div>
                  <div className="text-sm text-zinc-400 flex flex-wrap gap-x-4 gap-y-1">
                    <span>{new Date(flight.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1">
                      <Mountain className="w-3 h-3" /> {flight.maxAltitude}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Battery className="w-3 h-3" /> {flight.batteryUsed}%
                    </span>
                    {flight.route && <span>📍 GPS logged</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-accent">{formatDuration(flight.duration)}</div>
                </div>
                <button
                  onClick={() => handleDeleteFlight(flight.id)}
                  className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
