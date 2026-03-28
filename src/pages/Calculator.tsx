import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { aircraftTypes, getAircraftById } from '../lib/aircraft';
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

  // Custom specs (override defaults)
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
    // Create temporary aircraft with custom specs
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
      12, // default wind
      10  // default visibility
    );
    setSuitabilityScore(score);
  }

  function calculate() {
    calculateWithCustomSpecs(selectedAircraft, customSpecs);
  }

  const IconComponent = iconMap[selectedAircraft.icon] || Plane;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <CalcIcon className="w-6 h-6 text-white" />
          </span>
          Flight Calculator
        </h1>
        <p className="text-zinc-400 mt-1">Calculate accurate flight performance using aviation physics</p>
      </div>

      {/* Aircraft Selection */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Select Aircraft Type</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {aircraftTypes.map((aircraft) => {
            const Icon = iconMap[aircraft.icon] || Plane;
            return (
              <button
                key={aircraft.id}
                onClick={() => selectAircraft(aircraft)}
                className={`aircraft-btn ${selectedAircraft.id === aircraft.id ? 'selected' : ''}`}
              >
                <Icon className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
                <div className="text-sm font-medium">{aircraft.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Specifications */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Aircraft Specifications
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Wingspan (cm)</label>
                <input
                  type="number"
                  className="form-input"
                  value={customSpecs.wingspan}
                  onChange={(e) => updateSpec('wingspan', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Weight (g)</label>
                <input
                  type="number"
                  className="form-input"
                  value={customSpecs.weight}
                  onChange={(e) => updateSpec('weight', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Wing Area (cm²)</label>
                <input
                  type="number"
                  className="form-input"
                  value={customSpecs.wingArea}
                  onChange={(e) => updateSpec('wingArea', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Motor Power (W)</label>
                <input
                  type="number"
                  className="form-input"
                  value={customSpecs.motorPower}
                  onChange={(e) => updateSpec('motorPower', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Battery (mAh)</label>
                <input
                  type="number"
                  className="form-input"
                  value={customSpecs.battery}
                  onChange={(e) => updateSpec('battery', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Voltage (V)</label>
                <input
                  type="number"
                  className="form-input"
                  value={customSpecs.voltage}
                  step="0.1"
                  onChange={(e) => updateSpec('voltage', Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Performance Results
          </h2>

          {result && (
            <div className="space-y-6">
              {/* Speed Metrics */}
              <div>
                <h3 className="text-sm text-zinc-400 uppercase tracking-wider mb-3">Speed Performance</h3>
                <div className="grid grid-cols-3 gap-3">
                  <ResultItem label="Stall Speed" value={result.stallSpeed} unit="km/h" />
                  <ResultItem label="Cruise Speed" value={result.cruiseSpeed} unit="km/h" />
                  <ResultItem label="Max Speed" value={result.maxSpeed} unit="km/h" />
                </div>
              </div>

              {/* Climbing Performance */}
              <div>
                <h3 className="text-sm text-zinc-400 uppercase tracking-wider mb-3">Climbing & Gliding</h3>
                <div className="grid grid-cols-3 gap-3">
                  <ResultItem label="Rate of Climb" value={result.rateOfClimb} unit="m/s" />
                  <ResultItem label="Glide Ratio" value={result.glideRatio} unit=":1" />
                  <ResultItem label="Service Ceiling" value={result.ceiling} unit="m" />
                </div>
              </div>

              {/* Turn Performance */}
              <div>
                <h3 className="text-sm text-zinc-400 uppercase tracking-wider mb-3">Turn Performance</h3>
                <div className="grid grid-cols-2 gap-3">
                  <ResultItem label="Turn Radius (30°)" value={result.turnRadius} unit="m" />
                  <ResultItem label="Turn Rate" value={result.turnRate} unit="°/s" />
                </div>
              </div>

              {/* Endurance */}
              <div>
                <h3 className="text-sm text-zinc-400 uppercase tracking-wider mb-3">Efficiency</h3>
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

      {/* Advanced Metrics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Suitability Score */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
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
                <div className="font-mono font-semibold">{result?.wingLoading} g/dm²</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Thrust/Weight</div>
                <div className="font-mono font-semibold">{result?.thrustWeight} :1</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Best For</div>
                <div className="text-sm">{selectedAircraft.bestFor}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Physics */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            Advanced Physics
          </h2>

          {result && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-bg rounded-xl p-4">
                <div className="text-sm text-zinc-400">Lift Coeff (Cl)</div>
                <div className="text-xl font-mono font-bold text-primary">{result.liftCoefficient}</div>
              </div>
              <div className="bg-bg rounded-xl p-4">
                <div className="text-sm text-zinc-400">Drag Coeff (Cd)</div>
                <div className="text-xl font-mono font-bold text-red-400">{result.dragCoefficient}</div>
              </div>
              <div className="bg-bg rounded-xl p-4">
                <div className="text-sm text-zinc-400">Stability Factor</div>
                <div className="text-xl font-mono font-bold">
                  {result.stabilityFactor > 0 ? '+' : ''}{result.stabilityFactor}
                </div>
              </div>
              <div className="bg-bg rounded-xl p-4">
                <div className="text-sm text-zinc-400">CG Position</div>
                <div className="text-xl font-mono font-bold">{result.cgPosition}% MAC</div>
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
    <div className="result-item">
      <div className="text-xs text-zinc-500 mb-1">{label}</div>
      <div className="text-xl font-mono font-bold text-primary">{value}</div>
      <div className="text-xs text-zinc-400">{unit}</div>
    </div>
  );
}
