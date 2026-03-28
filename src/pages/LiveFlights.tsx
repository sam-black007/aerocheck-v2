import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plane,
  Radio,
  MapPin,
  Clock,
  Navigation,
  RefreshCw,
  Search,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface Flight {
  icao24: string;
  callsign: string;
  origin_country: string;
  longitude: number;
  latitude: number;
  baro_altitude: number;
  on_ground: boolean;
  velocity: number;
  heading: number;
  vertical_rate: number;
  squawk: string;
}

export default function LiveFlights() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [filter, setFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, inAir: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInitialized = useRef(false);

  const fetchFlights = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://opensky-network.org/api/states/all?lamin=35&lomin=-15&lamax=72&lomax=35'
      );

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      
      if (data.states) {
        const flightData: Flight[] = data.states
          .filter((state: any[]) => state[5] !== null && state[6] !== null)
          .map((state: any[]) => ({
            icao24: state[0],
            callsign: state[1]?.trim() || 'Unknown',
            origin_country: state[2],
            longitude: state[5],
            latitude: state[6],
            baro_altitude: state[7],
            on_ground: state[8],
            velocity: state[9],
            heading: state[10],
            vertical_rate: state[11],
            squawk: state[14] || '',
          }));

        setFlights(flightData);
        setFilteredFlights(flightData);
        setLastUpdate(new Date());

        const inAir = flightData.filter((f) => !f.on_ground).length;
        setStats({ total: flightData.length, inAir });
      }
    } catch (err) {
      console.error('Flight fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, 15000);
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

  useEffect(() => {
    if (!mapRef.current || mapInitialized.current || !window.L) return;

    const initMap = async () => {
      if (typeof window === 'undefined') return;
      
      const L = (window as any).L;
      if (!L || mapInitialized.current) return;

      const map = L.map(mapRef.current!).setView([51.5, 10], 5);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      mapInitialized.current = true;
    };

    const loadLeaflet = () => {
      if (document.querySelector('link[href*="leaflet"]')) {
        initMap();
      } else {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = initMap;
        document.body.appendChild(script);
      }
    };

    loadLeaflet();
  }, []);

  useEffect(() => {
    if (!mapRef.current || !window.L || flights.length === 0) return;

    const L = (window as any).L;
    
    document.querySelectorAll('.flight-marker-custom').forEach(el => el.remove());

    flights.filter(f => !f.on_ground && f.latitude && f.longitude).slice(0, 50).forEach((flight) => {
      const rotation = flight.heading || 0;
      
      const icon = L.divIcon({
        html: `<div style="transform: rotate(${rotation}deg); width: 24px; height: 24px; color: #22d3ee; filter: drop-shadow(0 0 4px rgba(34, 211, 238, 0.5));">✈</div>`,
        className: 'flight-marker-custom',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([flight.latitude, flight.longitude], { icon })
        .addTo(mapRef.current!)
        .bindPopup(`<div style="color: #1a1a1a; font-family: monospace;"><strong>${flight.callsign}</strong><br/>Alt: ${Math.round(flight.baro_altitude)}m<br/>Speed: ${Math.round((flight.velocity || 0) * 3.6)} km/h</div>`);
    });
  }, [flights]);

  function getHeadingDirection(heading: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Radio className="w-6 h-6 text-white" />
            </span>
            <span className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
              Live Flight Tracker
            </span>
          </h1>
          <p className="text-zinc-400 mt-1">Real-time aircraft positions via OpenSky Network ADS-B</p>
        </div>
        <button onClick={fetchFlights} className="btn btn-primary bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4">
          <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider mb-2">
            <Plane className="w-4 h-4" /> Total Aircraft
          </div>
          <div className="text-2xl font-bold text-cyan-400">{stats.total.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4">
          <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider mb-2">
            <Navigation className="w-4 h-4" /> In Air
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.inAir.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4">
          <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider mb-2">
            <MapPin className="w-4 h-4" /> On Ground
          </div>
          <div className="text-2xl font-bold text-zinc-300">{stats.total - stats.inAir}</div>
        </div>
        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4">
          <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider mb-2">
            <Clock className="w-4 h-4" /> Last Update
          </div>
          <div className="text-xl font-mono font-bold text-cyan-400">{lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--'}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card bg-gradient-to-br from-zinc-900 to-zinc-900/50 border-cyan-500/20 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Flight Map
            </h2>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Live tracking
            </div>
          </div>
          <div ref={mapRef} className="h-[500px] w-full" />
        </div>

        <div className="card bg-gradient-to-br from-zinc-900 to-zinc-900/50 border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
              <Plane className="w-5 h-5" /> Aircraft List
            </h2>
            <span className="text-sm text-zinc-500">{filteredFlights.length} flights</span>
          </div>

          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search callsign, country..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="form-input pl-10 py-2 text-sm bg-zinc-800/50 border-cyan-500/20"
            />
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredFlights.filter(f => !f.on_ground).slice(0, 30).map((flight) => (
              <button
                key={flight.icao24}
                onClick={() => setSelectedFlight(flight)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedFlight?.icao24 === flight.icao24
                    ? 'bg-cyan-500/10 border-cyan-500'
                    : 'bg-zinc-800/50 border-zinc-700/50 hover:border-cyan-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono font-bold text-cyan-400">{flight.callsign}</div>
                    <div className="text-xs text-zinc-500">{flight.origin_country}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-emerald-400">{Math.round(flight.baro_altitude)}m</div>
                    <div className="text-xs text-zinc-500">{Math.round((flight.velocity || 0) * 3.6)} km/h</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedFlight && (
        <div className="card bg-gradient-to-br from-zinc-900 to-zinc-900/50 border-cyan-500/20">
          <h2 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5" /> Selected Flight Details
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-zinc-800/50 rounded-xl p-4 border border-cyan-500/20">
              <div className="text-sm text-zinc-400 mb-1">Callsign</div>
              <div className="text-xl font-mono font-bold text-cyan-400">{selectedFlight.callsign}</div>
              <div className="text-xs text-zinc-500 mt-1">{selectedFlight.origin_country}</div>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 border border-cyan-500/20">
              <div className="text-sm text-zinc-400 mb-1">Altitude</div>
              <div className="text-xl font-mono font-bold text-emerald-400">{Math.round(selectedFlight.baro_altitude)}m</div>
              <div className="text-xs text-zinc-500 mt-1">{(selectedFlight.baro_altitude / 3.281).toFixed(0)} ft</div>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 border border-cyan-500/20">
              <div className="text-sm text-zinc-400 mb-1">Speed</div>
              <div className="text-xl font-mono font-bold text-amber-400">{Math.round((selectedFlight.velocity || 0) * 3.6)} km/h</div>
              <div className="text-xs text-zinc-500 mt-1">{Math.round((selectedFlight.velocity || 0) * 1.944)} kts</div>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 border border-cyan-500/20">
              <div className="text-sm text-zinc-400 mb-1">Heading</div>
              <div className="text-xl font-mono font-bold text-purple-400">{Math.round(selectedFlight.heading)}° {getHeadingDirection(selectedFlight.heading)}</div>
              <div className="flex items-center gap-1 mt-1">
                {(selectedFlight.vertical_rate || 0) > 0 ? (
                  <ArrowUp className="w-3 h-3 text-emerald-400" />
                ) : (
                  <ArrowDown className="w-3 h-3 text-red-400" />
                )}
                <span className="text-xs text-zinc-500">{Math.abs(selectedFlight.vertical_rate || 0).toFixed(0)} m/s</span>
              </div>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 border border-cyan-500/20 md:col-span-2">
              <div className="text-sm text-zinc-400 mb-1">Position</div>
              <div className="font-mono text-zinc-200">
                {selectedFlight.latitude?.toFixed(4)}°, {selectedFlight.longitude?.toFixed(4)}°
              </div>
              <a
                href={`https://www.google.com/maps?q=${selectedFlight.latitude},${selectedFlight.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-cyan-400 hover:text-cyan-300 mt-2 inline-block"
              >
                Open in Google Maps →
              </a>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 border border-cyan-500/20">
              <div className="text-sm text-zinc-400 mb-1">Squawk</div>
              <div className="text-xl font-mono font-bold text-orange-400">{selectedFlight.squawk || '--'}</div>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 border border-cyan-500/20">
              <div className="text-sm text-zinc-400 mb-1">ICAO 24-bit</div>
              <div className="text-lg font-mono text-zinc-300">{selectedFlight.icao24.toUpperCase()}</div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-sm text-zinc-500">
        Flight data provided by{' '}
        <a href="https://opensky-network.org" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
          OpenSky Network
        </a>
        . Updates every 15 seconds.
      </div>
    </div>
  );
}
