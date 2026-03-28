import { useState } from 'react';
import {
  Scale,
  Plane,
  Wind,
  Hexagon,
  ArrowUpDown,
  Feather,
  Triangle,
  Layers,
  ArrowRight,
  Bird,
  Award,
  Zap,
  CheckCircle,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { aircraftTypes } from '../lib/aircraft';
import { calculatePerformance } from '../lib/physics';
import { AircraftType } from '../types';

const iconMap: Record<string, any> = {
  Plane, Wind, Hexagon, ArrowUpDown, Feather, Triangle, Layers, ArrowRight, Bird, Award, Zap,
};

export default function Compare() {
  const [selected, setSelected] = useState<string[]>(['fixed-wing', 'quadcopter']);

  function toggleAircraft(id: string) {
    if (selected.includes(id)) {
      if (selected.length > 2) {
        setSelected(selected.filter((s) => s !== id));
      }
    } else if (selected.length < 4) {
      setSelected([...selected, id]);
    }
  }

  const aircraft = selected.map((id) => aircraftTypes.find((a) => a.id === id)!).filter(Boolean);

  const radarData = aircraft.map((ac) => {
    const result = calculatePerformance(ac);
    return {
      name: ac.name,
      Speed: (result.cruiseSpeed / 150) * 100,
      Climb: (result.rateOfClimb / 10) * 100,
      Endurance: (result.endurance / 60) * 100,
      Agility: (100 - Math.min(result.turnRadius / 5, 100)),
      Efficiency: (result.glideRatio / 20) * 100,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Scale className="w-6 h-6 text-white" />
          </span>
          Compare Models
        </h1>
        <p className="text-zinc-400 mt-1">Side-by-side performance comparison</p>
      </div>

      {/* Selection */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Select Models (2-4)</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {aircraftTypes.map((ac) => {
            const Icon = iconMap[ac.icon] || Plane;
            return (
              <button
                key={ac.id}
                onClick={() => toggleAircraft(ac.id)}
                className={`aircraft-btn ${selected.includes(ac.id) ? 'selected' : ''}`}
              >
                <Icon className="w-6 h-6 mx-auto mb-1" />
                <div className="text-xs font-medium">{ac.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      {aircraft.length >= 2 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-6">Comparison Table</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-zinc-400 uppercase tracking-wider">
                  <th className="pb-4 pr-4">Metric</th>
                  {aircraft.map((ac) => {
                    const Icon = iconMap[ac.icon] || Plane;
                    return (
                      <th key={ac.id} className="pb-4 px-4">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5 text-primary" />
                          {ac.name}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="font-mono text-sm">
                <ComparisonRow label="Wingspan" unit="cm" aircraft={aircraft} getValue={(a) => a.wingspan} />
                <ComparisonRow label="Weight" unit="g" aircraft={aircraft} getValue={(a) => a.weight} />
                <ComparisonRow
                  label="Stall Speed"
                  unit="km/h"
                  aircraft={aircraft}
                  getValue={(a) => calculatePerformance(a).stallSpeed}
                />
                <ComparisonRow
                  label="Cruise Speed"
                  unit="km/h"
                  aircraft={aircraft}
                  getValue={(a) => calculatePerformance(a).cruiseSpeed}
                />
                <ComparisonRow
                  label="Rate of Climb"
                  unit="m/s"
                  aircraft={aircraft}
                  getValue={(a) => calculatePerformance(a).rateOfClimb}
                  decimals={1}
                />
                <ComparisonRow
                  label="Wing Loading"
                  unit="g/dm²"
                  aircraft={aircraft}
                  getValue={(a) => calculatePerformance(a).wingLoading}
                  decimals={1}
                />
                <ComparisonRow
                  label="Endurance"
                  unit="min"
                  aircraft={aircraft}
                  getValue={(a) => calculatePerformance(a).endurance}
                />
                <ComparisonRow
                  label="T/W Ratio"
                  unit=":1"
                  aircraft={aircraft}
                  getValue={(a) => calculatePerformance(a).thrustWeight}
                  decimals={2}
                />
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Radar Chart */}
      {aircraft.length >= 2 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-6">Performance Radar</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#3f3f46" />
                <PolarAngleAxis dataKey="name" stroke="#71717a" fontSize={12} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#71717a" fontSize={10} />
                {aircraft.map((ac, i) => (
                  <Radar
                    key={ac.id}
                    name={ac.name}
                    dataKey={['Speed', 'Climb', 'Endurance', 'Agility', 'Efficiency'][i % 5]}
                    stroke={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][i]}
                    fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][i]}
                    fillOpacity={0.2}
                  />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recommendation */}
      {aircraft.length >= 2 && (
        <div className="alert alert-success">
          <CheckCircle className="w-5 h-5" />
          <span>
            <strong>{aircraft[0].name}</strong> offers the best balance of speed and efficiency for
            general flying.
          </span>
        </div>
      )}
    </div>
  );
}

function ComparisonRow({
  label,
  unit,
  aircraft,
  getValue,
  decimals = 0,
}: {
  label: string;
  unit: string;
  aircraft: AircraftType[];
  getValue: (a: AircraftType) => number;
  decimals?: number;
}) {
  const values = aircraft.map(getValue);
  const maxIdx = values.indexOf(Math.max(...values));

  return (
    <tr className="border-t border-zinc-800">
      <td className="py-3 pr-4 text-zinc-400">{label}</td>
      {aircraft.map((ac, i) => (
        <td key={ac.id} className={`py-3 px-4 ${i === maxIdx ? 'text-emerald-400' : ''}`}>
          {values[i].toFixed(decimals)} <span className="text-zinc-500">{unit}</span>
        </td>
      ))}
    </tr>
  );
}
