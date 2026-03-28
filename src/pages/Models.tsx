import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
  Octagon,
  CircleDot,
  RotateCw,
  Calculator,
} from 'lucide-react';
import { aircraftTypes } from '../lib/aircraft';
import { AircraftType } from '../types';

const iconMap: Record<string, any> = {
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
  Octagon,
  CircleDot,
  RotateCw,
};

const categories = [
  { id: 'all', label: 'All (15)', count: 15 },
  { id: 'fixed-wing', label: 'Fixed Wing', count: 8 },
  { id: 'multirotor', label: 'Multirotor', count: 4 },
  { id: 'rotor', label: 'Rotor', count: 1 },
  { id: 'special', label: 'Special', count: 2 },
];

export default function Models() {
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const filtered = filter === 'all'
    ? aircraftTypes
    : aircraftTypes.filter((a) => a.category === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Plane className="w-6 h-6 text-white" />
          </span>
          Model Library
        </h1>
        <p className="text-zinc-400 mt-1">Browse 15 aircraft types with detailed specifications</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === cat.id
                ? 'bg-primary text-white'
                : 'bg-bg-elevated text-zinc-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((aircraft) => {
          const Icon = iconMap[aircraft.icon] || Plane;
          return (
            <div key={aircraft.id} className="card">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{aircraft.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-bg-elevated text-zinc-400 capitalize">
                    {aircraft.category.replace('-', ' ')}
                  </span>
                </div>
              </div>

              <p className="text-sm text-zinc-400 mb-4">{aircraft.bestFor}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <SpecItem label="Wingspan" value={`${aircraft.wingspan} cm`} />
                <SpecItem label="Weight" value={`${aircraft.weight} g`} />
                <SpecItem label="Motor" value={`${aircraft.motorPower} W`} />
                <SpecItem label="Battery" value={`${aircraft.battery} mAh`} />
              </div>

              <div className="text-xs text-zinc-500 mb-4">
                <span className="text-zinc-400">Aero coefficients:</span> Cl={aircraft.clMax}, Cd₀={aircraft.cd0}, e={aircraft.Oswald}
              </div>

              <button
                onClick={() => navigate('/calculator')}
                className="btn btn-primary btn-block"
              >
                <Calculator className="w-4 h-4" />
                Calculate
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg rounded-lg p-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="font-mono font-semibold">{value}</div>
    </div>
  );
}
