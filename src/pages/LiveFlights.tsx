import { useState, useEffect, useCallback } from 'react';
import {
  Plane,
  Radio,
  MapPin,
  Clock,
  Navigation,
  ChevronRight,
  RefreshCw,
  Filter,
  Search,
} from 'lucide-react';

interface Flight {
  icao24: string;
  callsign: string;
  origin_country: string;
  time_position: number;
  last_contact: number;
  longitude: number;
  latitude: number;
  baro_altitude: number;
  on_ground: boolean;
  velocity: number;
  heading: number;
  vertical_rate: number;
  sensors: number[];
  geo_altitude: number;
  squawk: string;
  spi: boolean;
  position_source: number;
}

interface FlightDetails extends Flight {
  origin?: string;
  destination?: string;
  route?: string[];
}

export default function LiveFlights() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<FlightDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [filter, setFilter] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    inAir: 0,
    onGround: 0,
    avgAltitude: 0,
    avgSpeed: 0,
  });

  const fetchFlights = useCallback(async () => {
    try {
      // OpenSky Network API - get all flights in view
      const response = await fetch(
        'https://opensky-network.org/api/states/all?lamin=35&lomin=-15&lamax=72&lomax=35',
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch flights');
      }

      const data = await response.json();
      
      if (data.states) {
        const flightData: Flight[] = data.states.map((state: any[]) => ({
          icao24: state[0],
          callsign: state[1]?.trim() || 'Unknown',
          origin_country: state[2],
          time_position: state[3],
          last_contact: state[4],
          longitude: state[5],
          latitude: state[6],
          baro_altitude: state[7],
          on_ground: state[8],
          velocity: state[9],
          heading: state[10],
          vertical_rate: state[11],
          sensors: state[12] || [],
          geo_altitude: state[13],
          squawk: state[14] || '',
          spi: state[15],
          position_source: state[16],
        })).filter((f: Flight) => f.latitude && f.longitude);

        setFlights(flightData);
        setFilteredFlights(flightData);
        setLastUpdate(new Date());
        setError(null);

        // Update stats
        const inAir = flightData.filter((f) => !f.on_ground);
        const avgAlt = inAir.reduce((sum, f) => sum + (f.baro_altitude || 0), 0) / Math.max(inAir.length, 1);
        const avgSpeed = flightData.reduce((sum, f) => sum + (f.velocity || 0), 0) / Math.max(flightData.length, 1);

        setStats({
          total: flightData.length,
          inAir: inAir.length,
          onGround: flightData.filter((f) => f.on_ground).length,
          avgAltitude: Math.round(avgAlt),
          avgSpeed: Math.round(avgSpeed * 3.6), // m/s to km/h
        });
      }
    } catch (err) {
      setError('Unable to fetch live flights. Please try again.');
      console.error('Flight fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [fetchFlights]);

  useEffect(() => {
    if (filter) {
      const searchTerm = filter.toLowerCase();
      setFilteredFlights(
        flights.filter(
          (f) =>
            f.callsign.toLowerCase().includes(searchTerm) ||
            f.origin_country.toLowerCase().includes(searchTerm) ||
            f.icao24.toLowerCase().includes(searchTerm)
        )
      );
    } else {
      setFilteredFlights(flights);
    }
  }, [filter, flights]);

  function selectFlight(flight: Flight) {
    const details: FlightDetails = {
      ...flight,
      origin: flight.callsign.substring(0, 3),
      destination: flight.callsign.substring(3, 6),
    };
    setSelectedFlight(details);
  }

  function formatTime(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleTimeString();
  }

  function getHeadingDirection(heading: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Radio className="w-6 h-6 text-white" />
            </span>
            Live Flights
          </h1>
          <p className="text-zinc-400 mt-1">Real-time aircraft tracking powered by OpenSky Network</p>
        </div>
        <button onClick={fetchFlights} className="btn btn-primary" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Flights" value={stats.total.toLocaleString()} icon={Plane} />
        <StatCard label="In Air" value={stats.inAir.toLocaleString()} icon={Navigation} color="text-emerald-400" />
        <StatCard label="On Ground" value={stats.onGround.toLocaleString()} icon={MapPin} />
        <StatCard label="Avg Altitude" value={`${(stats.avgAltitude / 1000).toFixed(1)}k`} unit="m" icon={ChevronRight} />
        <StatCard label="Avg Speed" value={stats.avgSpeed.toString()} unit="km/h" icon={Radio} />
      </div>

      {/* Last Update */}
      {lastUpdate && (
        <div className="text-sm text-zinc-500 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Last updated: {lastUpdate.toLocaleTimeString()} (updates every 30 seconds)
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <Plane className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Flight List */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Plane className="w-5 h-5 text-primary" />
              Aircraft ({filteredFlights.length.toLocaleString()})
            </h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search callsign, country..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="form-input pl-10 py-2 text-sm"
              />
            </div>
          </div>

          {loading && flights.length === 0 ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse h-16 bg-bg rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredFlights.slice(0, 100).map((flight) => (
                <button
                  key={flight.icao24}
                  onClick={() => selectFlight(flight)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedFlight?.icao24 === flight.icao24
                      ? 'bg-primary/10 border-primary'
                      : 'bg-bg border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        flight.on_ground ? 'bg-zinc-700' : 'bg-primary/20'
                      }`}>
                        <Plane className={`w-5 h-5 ${flight.on_ground ? 'text-zinc-400' : 'text-primary'}`} />
                      </div>
                      <div>
                        <div className="font-mono font-bold">{flight.callsign || 'Unknown'}</div>
                        <div className="text-sm text-zinc-400">{flight.origin_country}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${flight.on_ground ? 'text-zinc-400' : 'text-emerald-400'}`}>
                        {flight.on_ground ? 'Grounded' : `${Math.round(flight.baro_altitude || 0)}m`}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {flight.velocity ? `${Math.round(flight.velocity * 3.6)} km/h` : '--'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {filteredFlights.length > 100 && (
            <div className="text-center text-sm text-zinc-500 mt-4">
              Showing 100 of {filteredFlights.length.toLocaleString()} flights
            </div>
          )}
        </div>

        {/* Flight Details */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" />
            Flight Details
          </h2>

          {selectedFlight ? (
            <div className="space-y-4">
              {/* Callsign & Status */}
              <div className="text-center p-6 bg-gradient-to-b from-primary/10 to-transparent rounded-xl">
                <div className="text-4xl font-mono font-bold text-primary">{selectedFlight.callsign}</div>
                <div className="text-sm text-zinc-400 mt-1">{selectedFlight.origin_country}</div>
                <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                  selectedFlight.on_ground ? 'bg-zinc-700 text-zinc-300' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {selectedFlight.on_ground ? 'On Ground' : 'In Flight'}
                </div>
              </div>

              {/* Route */}
              <div className="bg-bg rounded-xl p-4">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Route</div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-zinc-500">Origin</div>
                    <div className="font-mono font-semibold">{selectedFlight.origin?.replace('_', '') || '---'}</div>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <div className="w-8 h-px bg-zinc-600" />
                    <Plane className="w-4 h-4" />
                    <div className="w-8 h-px bg-zinc-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-500">Destination</div>
                    <div className="font-mono font-semibold">{selectedFlight.destination?.replace('_', '') || '---'}</div>
                  </div>
                </div>
              </div>

              {/* Position */}
              <div className="bg-bg rounded-xl p-4">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Position</div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Latitude</span>
                    <span className="font-mono">{selectedFlight.latitude?.toFixed(4)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Longitude</span>
                    <span className="font-mono">{selectedFlight.longitude?.toFixed(4)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Altitude</span>
                    <span className="font-mono">{(selectedFlight.baro_altitude || 0).toLocaleString()} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Ground Alt</span>
                    <span className="font-mono">{(selectedFlight.geo_altitude || 0).toLocaleString()} m</span>
                  </div>
                </div>
              </div>

              {/* Motion */}
              <div className="bg-bg rounded-xl p-4">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Motion</div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Speed</span>
                    <span className="font-mono">
                      {selectedFlight.velocity ? `${(selectedFlight.velocity * 3.6).toFixed(1)} km/h` : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Heading</span>
                    <span className="font-mono">
                      {selectedFlight.heading ? `${selectedFlight.heading.toFixed(0)}° ${getHeadingDirection(selectedFlight.heading)}` : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Vertical Rate</span>
                    <span className={`font-mono ${(selectedFlight.vertical_rate || 0) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {(selectedFlight.vertical_rate || 0) > 0 ? '↑' : '↓'} {Math.abs(selectedFlight.vertical_rate || 0).toFixed(0)} m/s
                    </span>
                  </div>
                </div>
              </div>

              {/* Identification */}
              <div className="bg-bg rounded-xl p-4">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Identification</div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">ICAO 24-bit</span>
                    <span className="font-mono text-sm">{selectedFlight.icao24.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Squawk</span>
                    <span className="font-mono">{selectedFlight.squawk || '--'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Last Contact</span>
                    <span className="font-mono text-sm">{formatTime(selectedFlight.last_contact)}</span>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-bg rounded-xl p-4">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Map</div>
                <div className="aspect-video bg-bg-elevated rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="text-sm text-zinc-400">
                      {selectedFlight.latitude?.toFixed(2)}°, {selectedFlight.longitude?.toFixed(2)}°
                    </div>
                    <a
                      href={`https://www.google.com/maps?q=${selectedFlight.latitude},${selectedFlight.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-2 block"
                    >
                      Open in Google Maps →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-400">
              <Plane className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Select a flight to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-center text-sm text-zinc-500">
        Flight data provided by{' '}
        <a href="https://opensky-network.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          OpenSky Network
        </a>
        . Data may be delayed and is for informational purposes only.
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  color = 'text-primary',
}: {
  label: string;
  value: string;
  unit?: string;
  icon: any;
  color?: string;
}) {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider mb-2">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {unit && <div className="text-sm text-zinc-500">{unit}</div>}
    </div>
  );
}
