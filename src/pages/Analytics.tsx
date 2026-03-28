import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Mountain,
  Award,
  Plane,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { getAllFlights } from '../lib/db';
import { FlightData } from '../types';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function Analytics() {
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await getAllFlights();
    setFlights(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-10 w-48 bg-bg-elevated rounded mb-2" />
          <div className="h-6 w-64 bg-bg-elevated rounded" />
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalFlights = flights.length;
  const totalTime = flights.reduce((sum, f) => sum + f.duration, 0);
  const avgFlight = totalTime / totalFlights || 0;
  const maxAltitude = Math.max(...flights.map((f) => f.maxAltitude), 0);
  const longestFlight = flights.reduce((max, f) => (f.duration > max.duration ? f : max), flights[0]);
  const mostUsedAircraft = getMostUsedAircraft(flights);

  // Chart data
  const durationData = getDurationData(flights);
  const aircraftUsageData = getAircraftUsageData(flights);
  const altitudeData = getAltitudeData(flights);
  const monthlyData = getMonthlyData(flights);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </span>
          Flight Analytics
        </h1>
        <p className="text-zinc-400 mt-1">Analyze your flight patterns and performance trends</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Flights" value={totalFlights} icon={Plane} />
        <MetricCard label="Flight Time" value={`${(totalTime / 3600000).toFixed(1)}h`} icon={Clock} />
        <MetricCard label="Avg Flight" value={formatDuration(avgFlight)} icon={TrendingUp} />
        <MetricCard label="Max Altitude" value={`${maxAltitude}m`} icon={Mountain} />
      </div>

      {flights.length === 0 ? (
        <div className="card text-center py-16 text-zinc-400">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-semibold">No data yet</p>
          <p className="text-sm">Record flights to see analytics</p>
        </div>
      ) : (
        <>
          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Duration Trend */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-6">Flight Duration Trend</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={durationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid #3f3f46' }}
                      labelStyle={{ color: '#fafafa' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="duration"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Aircraft Usage */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-6">Aircraft Usage</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={aircraftUsageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {aircraftUsageData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid #3f3f46' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Altitude Progress */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-6">Altitude Progress</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={altitudeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid #3f3f46' }}
                    />
                    <Bar dataKey="altitude" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Flights */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-6">Monthly Activity</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid #3f3f46' }}
                    />
                    <Bar dataKey="flights" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Personal Records */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Personal Records
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-6">
                <div className="text-sm text-amber-400 mb-1">Longest Flight</div>
                <div className="text-2xl font-bold font-mono">
                  {longestFlight ? formatDuration(longestFlight.duration) : '--:--'}
                </div>
                <div className="text-sm text-zinc-400 mt-1">{longestFlight?.aircraft}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
                <div className="text-sm text-blue-400 mb-1">Highest Altitude</div>
                <div className="text-2xl font-bold font-mono">{maxAltitude}m</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-6">
                <div className="text-sm text-emerald-400 mb-1">Most Used</div>
                <div className="text-2xl font-bold">{mostUsedAircraft || 'N/A'}</div>
                <div className="text-sm text-zinc-400 mt-1">
                  {mostUsedAircraft ? `${aircraftUsageData[0]?.value || 0} flights` : ''}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider mb-2">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getMostUsedAircraft(flights: FlightData[]): string | null {
  const counts: Record<string, number> = {};
  flights.forEach((f) => {
    counts[f.aircraft] = (counts[f.aircraft] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || null;
}

function getDurationData(flights: FlightData[]): { name: string; duration: number }[] {
  return flights.slice(-10).map((f, i) => ({
    name: `#${i + 1}`,
    duration: Math.round(f.duration / 60000),
  }));
}

function getAircraftUsageData(flights: FlightData[]): { name: string; value: number }[] {
  const counts: Record<string, number> = {};
  flights.forEach((f) => {
    counts[f.aircraft] = (counts[f.aircraft] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function getAltitudeData(flights: FlightData[]): { name: string; altitude: number }[] {
  return flights.slice(-10).map((f, i) => ({
    name: `#${i + 1}`,
    altitude: f.maxAltitude,
  }));
}

function getMonthlyData(flights: FlightData[]): { month: string; flights: number }[] {
  const months: Record<string, number> = {};
  flights.forEach((f) => {
    const month = new Date(f.date).toLocaleDateString('en-US', { month: 'short' });
    months[month] = (months[month] || 0) + 1;
  });
  return Object.entries(months).map(([month, flights]) => ({ month, flights }));
}
