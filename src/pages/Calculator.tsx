import { useState, useEffect, useRef, useCallback } from 'react';
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
  Calculator as CalcIcon,
  TrendingUp,
  Gauge,
  Clock,
  Target,
  Activity,
  Navigation,
} from 'lucide-react';
import { aircraftTypes } from '../lib/aircraft';
import { calculatePerformance, calculateSuitabilityScore } from '../lib/physics';
import { AircraftType, CalculationResult } from '../types';

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

export default function Calculator() {
  const [selectedAircraft, setSelectedAircraft] = useState<AircraftType>(aircraftTypes[0]);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [suitabilityScore, setSuitabilityScore] = useState(75);

  const [customSpecs, setCustomSpecs] = useState({
    wingspan: aircraftTypes[0].wingspan,
    weight: aircraftTypes[0].weight,
    wingArea: aircraftTypes[0].wingArea,
    motorPower: aircraftTypes[0].motorPower,
    battery: aircraftTypes[0].battery,
    voltage: aircraftTypes[0].voltage,
  });

  useEffect(() => {
    calculate();
  }, []);

  function selectAircraft(aircraft: AircraftType) {
    setSelectedAircraft(aircraft);
    setCustomSpecs({
      wingspan: aircraft.wingspan,
      weight: aircraft.weight,
      wingArea: aircraft.wingArea,
      motorPower: aircraft.motorPower,
      battery: aircraft.battery,
      voltage: aircraft.voltage,
    });
    calculateWithCustomSpecs(aircraft, customSpecs);
  }

  function updateSpec(key: keyof typeof customSpecs, value: number) {
    const newSpecs = { ...customSpecs, [key]: value };
    setCustomSpecs(newSpecs);
    calculateWithCustomSpecs(selectedAircraft, newSpecs);
  }

  function calculateWithCustomSpecs(aircraft: AircraftType, specs: typeof customSpecs) {
    const tempAircraft: AircraftType = {
      ...aircraft,
      wingspan: specs.wingspan,
      weight: specs.weight,
      wingArea: specs.wingArea,
      motorPower: specs.motorPower,
      battery: specs.battery,
      voltage: specs.voltage,
    };

    const calcResult = calculatePerformance(tempAircraft, 15, 0);
    setResult(calcResult);

    const score = calculateSuitabilityScore(
      calcResult.wingLoading,
      calcResult.thrustWeight,
      12,
      10
    );
    setSuitabilityScore(score);
  }

  function calculate() {
    calculateWithCustomSpecs(selectedAircraft, customSpecs);
  }

  const IconComponent = iconMap[selectedAircraft.icon] || Plane;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <CalcIcon className="w-6 h-6 text-white" />
          </span>
          <span className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
            Flight Calculator
          </span>
        </h1>
        <p className="text-zinc-400 mt-1">Calculate accurate flight performance using aviation physics</p>
      </div>

      <div className="card bg-gradient-to-br from-zinc-900 to-zinc-900/50 border-cyan-500/20">
        <h2 className="text-lg font-semibold mb-4 text-cyan-400">Select Aircraft Type</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {aircraftTypes.map((aircraft) => {
            const Icon = iconMap[aircraft.icon] || Plane;
            return (
              <button
                key={aircraft.id}
                onClick={() => selectAircraft(aircraft)}
                className={`aircraft-btn ${selectedAircraft.id === aircraft.id ? 'selected border-cyan-500 bg-cyan-500/10' : 'border-zinc-700 hover:border-cyan-500/50'}`}
              >
                <Icon className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
                <div className="text-sm font-medium text-zinc-300">{aircraft.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card bg-gradient-to-br from-zinc-900 to-zinc-900/50 border-cyan-500/20">
          <h2 className="text-lg font-semibold mb-6 text-cyan-400 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Aircraft Specifications
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label text-cyan-400/80">Wingspan (cm)</label>
                <input
                  type="number"
                  className="form-input bg-zinc-800/50 border-cyan-500/30 focus:border-cyan-500"
                  value={customSpecs.wingspan}
                  onChange={(e) => updateSpec('wingspan', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="form-label text-cyan-400/80">Weight (g)</label>
                <input
                  type="number"
                  className="form-input bg-zinc-800/50 border-cyan-500/30 focus:border-cyan-500"
                  value={customSpecs.weight}
                  onChange={(e) => updateSpec('weight', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label text-cyan-400/80">Wing Area (cm²)</label>
                <input
                  type="number"
                  className="form-input bg-zinc-800/50 border-cyan-500/30 focus:border-cyan-500"
                  value={customSpecs.wingArea}
                  onChange={(e) => updateSpec('wingArea', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="form-label text-cyan-400/80">Motor Power (W)</label>
                <input
                  type="number"
                  className="form-input bg-zinc-800/50 border-cyan-500/30 focus:border-cyan-500"
                  value={customSpecs.motorPower}
                  onChange={(e) => updateSpec('motorPower', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label text-cyan-400/80">Battery (mAh)</label>
                <input
                  type="number"
                  className="form-input bg-zinc-800/50 border-cyan-500/30 focus:border-cyan-500"
                  value={customSpecs.battery}
                  onChange={(e) => updateSpec('battery', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="form-label text-cyan-400/80">Voltage (V)</label>
                <input
                  type="number"
                  className="form-input bg-zinc-800/50 border-cyan-500/30 focus:border-cyan-500"
                  value={customSpecs.voltage}
                  step="0.1"
                  onChange={(e) => updateSpec('voltage', Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-zinc-900 to-zinc-900/50 border-cyan-500/20">
          <h2 className="text-lg font-semibold mb-6 text-cyan-400 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Results
          </h2>

          {result && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm text-cyan-400/60 uppercase tracking-wider mb-3">Speed Performance</h3>
                <div className="grid grid-cols-3 gap-3">
                  <ResultItem label="Stall Speed" value={result.stallSpeed} unit="km/h" />
                  <ResultItem label="Cruise Speed" value={result.cruiseSpeed} unit="km/h" />
                  <ResultItem label="Max Speed" value={result.maxSpeed} unit="km/h" />
                </div>
              </div>

              <div>
                <h3 className="text-sm text-cyan-400/60 uppercase tracking-wider mb-3">Climbing & Gliding</h3>
                <div className="grid grid-cols-3 gap-3">
                  <ResultItem label="Rate of Climb" value={result.rateOfClimb} unit="m/s" />
                  <ResultItem label="Glide Ratio" value={result.glideRatio} unit=":1" />
                  <ResultItem label="Service Ceiling" value={result.ceiling} unit="m" />
                </div>
              </div>

              <div>
                <h3 className="text-sm text-cyan-400/60 uppercase tracking-wider mb-3">Turn Performance</h3>
                <div className="grid grid-cols-2 gap-3">
                  <ResultItem label="Turn Radius" value={result.turnRadius} unit="m" />
                  <ResultItem label="Turn Rate" value={result.turnRate} unit="°/s" />
                </div>
              </div>

              <div>
                <h3 className="text-sm text-cyan-400/60 uppercase tracking-wider mb-3">Efficiency</h3>
                <div className="grid grid-cols-3 gap-3">
                  <ResultItem label="Endurance" value={result.endurance} unit="min" />
                  <ResultItem label="Prop Efficiency" value={result.propellerEfficiency * 100} unit="%" />
                  <ResultItem label="T/W Ratio" value={result.thrustWeight} unit=":1" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card bg-gradient-to-br from-zinc-900 to-zinc-900/50 border-cyan-500/20">
          <h2 className="text-lg font-semibold mb-6 text-cyan-400 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Flight Suitability Score
          </h2>

          <div className="flex items-center gap-8">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-zinc-800" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${suitabilityScore * 2.83} 283`}
                  className={
                    suitabilityScore >= 70
                      ? 'text-emerald-400'
                      : suitabilityScore >= 40
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold">{suitabilityScore}</span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <div className="text-sm text-zinc-400">Wing Loading</div>
                <div className="font-mono font-semibold text-cyan-400">{result?.wingLoading} g/dm²</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Thrust/Weight</div>
                <div className="font-mono font-semibold text-cyan-400">{result?.thrustWeight} :1</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Best For</div>
                <div className="text-sm text-zinc-300">{selectedAircraft.bestFor}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-zinc-900 to-zinc-900/50 border-cyan-500/20">
          <h2 className="text-lg font-semibold mb-6 text-cyan-400 flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            Advanced Physics
          </h2>

          {result && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-800/50 rounded-xl p-4 border border-cyan-500/20">
                <div className="text-sm text-zinc-400">Lift Coeff (Cl)</div>
                <div className="text-xl font-mono font-bold text-cyan-400">{result.liftCoefficient}</div>
              </div>
              <div className="bg-zinc-800/50 rounded-xl p-4 border border-red-500/20">
                <div className="text-sm text-zinc-400">Drag Coeff (Cd)</div>
                <div className="text-xl font-mono font-bold text-red-400">{result.dragCoefficient}</div>
              </div>
              <div className="bg-zinc-800/50 rounded-xl p-4 border border-amber-500/20">
                <div className="text-sm text-zinc-400">Stability Factor</div>
                <div className="text-xl font-mono font-bold text-amber-400">
                  {result.stabilityFactor > 0 ? '+' : ''}{result.stabilityFactor}
                </div>
              </div>
              <div className="bg-zinc-800/50 rounded-xl p-4 border border-purple-500/20">
                <div className="text-sm text-zinc-400">CG Position</div>
                <div className="text-xl font-mono font-bold text-purple-400">{result.cgPosition}% MAC</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultItem({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="bg-zinc-800/50 rounded-xl p-4 border border-cyan-500/10">
      <div className="text-xs text-zinc-500 mb-1">{label}</div>
      <div className="text-xl font-mono font-bold text-cyan-400">{value}</div>
      <div className="text-xs text-zinc-400">{unit}</div>
    </div>
  );
}
