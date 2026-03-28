import { useState, useEffect } from 'react';
import { Wind, Thermometer, Droplets, Mountain, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Simulator() {
  const [state, setState] = useState({
    temperature: 20,
    windSpeed: 10,
    humidity: 50,
    altitude: 0,
  });

  const [results, setResults] = useState({
    densityAltitude: 0,
    sigma: 1.0,
    liftLoss: 0,
    thrustLoss: 0,
    rangeLoss: 0,
    rocLoss: 0,
    stallSpeed: 35,
    trueAirspeed: 72,
    rateOfClimb: 3.5,
  });

  useEffect(() => {
    calculate();
  }, [state]);

  function calculate() {
    const isaTemp = 15 - (state.altitude / 1000) * 2;
    const tempDiff = state.temperature - isaTemp;
    const pressureAlt = state.altitude + tempDiff * 120;
    const densityAltitude = Math.round(pressureAlt * 3.281);
    const sigma = Math.exp(-state.altitude / 8500) * (1 - tempDiff * 0.0001);
    const liftLoss = Math.round((1 - sigma) * 100);
    const thrustLoss = Math.round((1 - sigma) * 100 * 0.8);
    const rangeLoss = Math.round((1 - sigma) * 100);
    const rocLoss = Math.round((1 - sigma) * 100);
    const stallSpeed = Math.round(35 / Math.sqrt(sigma));
    const trueAirspeed = Math.round(60 / Math.sqrt(sigma));
    const rateOfClimb = Number((3.5 * sigma).toFixed(1));

    setResults({
      densityAltitude,
      sigma: Math.round(sigma * 1000) / 1000,
      liftLoss,
      thrustLoss,
      rangeLoss,
      rocLoss,
      stallSpeed,
      trueAirspeed,
      rateOfClimb,
    });
  }

  const getAlert = () => {
    if (results.densityAltitude > 3000) {
      return { type: 'danger', message: 'High density altitude - reduce payload' };
    }
    if (results.densityAltitude > 1500) {
      return { type: 'warning', message: 'Moderate density altitude - allow longer takeoff' };
    }
    return { type: 'success', message: 'Normal conditions - aircraft performs as expected' };
  };

  const alert = getAlert();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Wind className="w-6 h-6 text-white" />
          </span>
          <span className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
            Weather Simulator
          </span>
        </h1>
        <p className="text-zinc-400 mt-1">Test weather conditions impact on flight performance</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card bg-gradient-to-br from-zinc-900 to-zinc-900/50 border-cyan-500/20">
          <h2 className="text-lg font-semibold mb-6 text-cyan-400">Weather Controls</h2>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="flex items-center gap-2 text-sm text-zinc-400">
                  <Thermometer className="w-4 h-4" /> Temperature
                </label>
                <span className="font-mono font-semibold text-cyan-400">{state.temperature}°C</span>
              </div>
              <input
                type="range"
                min="-20"
                max="50"
                value={state.temperature}
                onChange={(e) => setState({ ...state, temperature: Number(e.target.value) })}
                className="w-full accent-cyan-500"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-1">
                <span>-20°C</span><span>50°C</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="flex items-center gap-2 text-sm text-zinc-400">
                  <Wind className="w-4 h-4" /> Wind Speed
                </label>
                <span className="font-mono font-semibold text-cyan-400">{state.windSpeed} km/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={state.windSpeed}
                onChange={(e) => setState({ ...state, windSpeed: Number(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="flex items-center gap-2 text-sm text-zinc-400">
                  <Droplets className="w-4 h-4" /> Humidity
                </label>
                <span className="font-mono font-semibold text-cyan-400">{state.humidity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={state.humidity}
                onChange={(e) => setState({ ...state, humidity: Number(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="flex items-center gap-2 text-sm text-zinc-400">
                  <Mountain className="w-4 h-4" /> Field Elevation
                </label>
                <span className="font-mono font-semibold text-cyan-400">{state.altitude} m</span>
              </div>
              <input
                type="range"
                min="0"
                max="4000"
                step="100"
                value={state.altitude}
                onChange={(e) => setState({ ...state, altitude: Number(e.target.value) })}
                className="w-full accent-cyan-500"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-1">
                <span>Sea Level</span><span>4000m</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-zinc-900 to-zinc-900/50 border-cyan-500/20">
          <h2 className="text-lg font-semibold mb-6 text-cyan-400">Density Altitude</h2>

          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-6 text-center mb-6">
            <div className="text-sm text-white/80 mb-1">Calculated Density Altitude</div>
            <div className="text-5xl font-bold font-mono text-white">
              {results.densityAltitude.toLocaleString()}
            </div>
            <div className="text-sm text-white/80 mt-1">feet</div>
          </div>

          <h3 className="text-sm text-cyan-400/60 uppercase tracking-wider mb-4">Performance Impact</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-800/50 rounded-xl p-4 border border-red-500/20">
              <div className="text-xs text-zinc-500 mb-1">Lift Loss</div>
              <div className="text-2xl font-mono font-bold text-red-400">{results.liftLoss}%</div>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 border border-amber-500/20">
              <div className="text-xs text-zinc-500 mb-1">Thrust Loss</div>
              <div className="text-2xl font-mono font-bold text-amber-400">{results.thrustLoss}%</div>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 border border-cyan-500/20">
              <div className="text-xs text-zinc-500 mb-1">Range Loss</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">{results.rangeLoss}%</div>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 border border-emerald-500/20">
              <div className="text-xs text-zinc-500 mb-1">ROC Loss</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">{results.rocLoss}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-gradient-to-br from-zinc-900 to-zinc-900/50 border-cyan-500/20">
        <h2 className="text-lg font-semibold mb-6 text-cyan-400">Corrected Performance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-zinc-800/50 rounded-xl p-4 border border-cyan-500/20">
            <div className="text-xs text-zinc-500 mb-1">Air Density (σ)</div>
            <div className="text-2xl font-mono font-bold text-cyan-400">{results.sigma}</div>
          </div>
          <div className="bg-zinc-800/50 rounded-xl p-4 border border-cyan-500/20">
            <div className="text-xs text-zinc-500 mb-1">TAS at IAS 60</div>
            <div className="text-2xl font-mono font-bold text-cyan-400">{results.trueAirspeed} km/h</div>
          </div>
          <div className="bg-zinc-800/50 rounded-xl p-4 border border-cyan-500/20">
            <div className="text-xs text-zinc-500 mb-1">Stall Speed</div>
            <div className="text-2xl font-mono font-bold text-cyan-400">{results.stallSpeed} km/h</div>
          </div>
          <div className="bg-zinc-800/50 rounded-xl p-4 border border-cyan-500/20">
            <div className="text-xs text-zinc-500 mb-1">Rate of Climb</div>
            <div className="text-2xl font-mono font-bold text-cyan-400">{results.rateOfClimb} m/s</div>
          </div>
        </div>
      </div>

      <div className={`alert ${alert.type === 'danger' ? 'alert-danger' : alert.type === 'warning' ? 'alert-warning' : 'alert-success'}`}>
        {alert.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
        <span>{alert.message}</span>
      </div>
    </div>
  );
}
