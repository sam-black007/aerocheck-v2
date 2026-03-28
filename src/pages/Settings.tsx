import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Key,
  Ruler,
  Database,
  Download,
  Upload,
  Trash2,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { getSettings, saveSettings, getAllFlights, exportFlightsToJSON, downloadJSON, clearAllFlights } from '../lib/db';
import { Settings } from '../types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    units: 'metric',
    tempUnit: 'celsius',
    defaultAircraft: 'fixed-wing',
    apiKeys: {},
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const data = await getSettings();
    if (data) {
      setSettings(data);
    }
  }

  async function handleSave() {
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleExportData() {
    const flights = await getAllFlights();
    const data = {
      settings,
      flights,
      exportDate: new Date().toISOString(),
    };
    downloadJSON(JSON.stringify(data, null, 2), `aerocheck-backup-${new Date().toISOString().split('T')[0]}.json`);
  }

  async function handleImportData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.settings) {
          setSettings(data.settings);
          await saveSettings(data.settings);
        }
        alert('Data imported successfully!');
      } catch {
        alert('Invalid file format');
      }
    };
    input.click();
  }

  async function handleClearAll() {
    if (confirm('Delete ALL data? This cannot be undone.')) {
      await clearAllFlights();
      localStorage.clear();
      window.location.reload();
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </span>
          Settings
        </h1>
        <p className="text-zinc-400 mt-1">Configure your aeroCheck experience</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* API Configuration */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            API Configuration
          </h2>

          <div className="alert alert-warning mb-6">
            <AlertTriangle className="w-5 h-5" />
            <span>API keys are optional. aeroCheck works with free APIs without keys.</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="form-label">OpenWeatherMap API Key</label>
              <input
                type="password"
                className="form-input"
                placeholder="Optional - for premium features"
                value={settings.apiKeys.openWeather || ''}
                onChange={(e) =>
                  setSettings({ ...settings, apiKeys: { ...settings.apiKeys, openWeather: e.target.value } })
                }
              />
            </div>
            <div>
              <label className="form-label">WeatherAPI Key</label>
              <input
                type="password"
                className="form-input"
                placeholder="Optional"
                value={settings.apiKeys.weatherApi || ''}
                onChange={(e) =>
                  setSettings({ ...settings, apiKeys: { ...settings.apiKeys, weatherApi: e.target.value } })
                }
              />
            </div>
            <div>
              <label className="form-label">Aviationstack API Key</label>
              <input
                type="password"
                className="form-input"
                placeholder="Optional - for aviation weather"
                value={settings.apiKeys.aviationstack || ''}
                onChange={(e) =>
                  setSettings({ ...settings, apiKeys: { ...settings.apiKeys, aviationstack: e.target.value } })
                }
              />
            </div>
          </div>

          <button onClick={handleSave} className="btn btn-primary mt-6">
            {saved ? '✓ Saved!' : 'Save API Keys'}
          </button>
        </div>

        {/* Units */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Ruler className="w-5 h-5 text-primary" />
            Units & Preferences
          </h2>

          <div className="space-y-4">
            <div>
              <label className="form-label">Distance Units</label>
              <select
                value={settings.units}
                onChange={(e) => setSettings({ ...settings, units: e.target.value as 'metric' | 'imperial' })}
                className="form-input form-select"
              >
                <option value="metric">Metric (km, m)</option>
                <option value="imperial">Imperial (mi, ft)</option>
              </select>
            </div>

            <div>
              <label className="form-label">Temperature Units</label>
              <select
                value={settings.tempUnit}
                onChange={(e) => setSettings({ ...settings, tempUnit: e.target.value as 'celsius' | 'fahrenheit' })}
                className="form-input form-select"
              >
                <option value="celsius">Celsius (°C)</option>
                <option value="fahrenheit">Fahrenheit (°F)</option>
              </select>
            </div>

            <div>
              <label className="form-label">Default Aircraft</label>
              <select
                value={settings.defaultAircraft}
                onChange={(e) => setSettings({ ...settings, defaultAircraft: e.target.value })}
                className="form-input form-select"
              >
                <option value="fixed-wing">Fixed Wing</option>
                <option value="quadcopter">Quadcopter</option>
                <option value="hexacopter">Hexacopter</option>
                <option value="vtol">VTOL</option>
                <option value="helicopter">Helicopter</option>
              </select>
            </div>
          </div>

          <button onClick={handleSave} className="btn btn-primary mt-6">
            {saved ? '✓ Saved!' : 'Save Preferences'}
          </button>
        </div>

        {/* Data Management */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Data Management
          </h2>

          <div className="space-y-4">
            <button onClick={handleExportData} className="btn btn-secondary w-full">
              <Download className="w-4 h-4" />
              Export All Data
            </button>
            <button onClick={handleImportData} className="btn btn-secondary w-full">
              <Upload className="w-4 h-4" />
              Import Data
            </button>
            <button onClick={handleClearAll} className="btn btn-danger w-full">
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
          </div>
        </div>

        {/* About */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            About aeroCheck
          </h2>

          <div className="space-y-3 text-sm text-zinc-400">
            <div className="flex justify-between">
              <span>Version</span>
              <span className="font-mono">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Built with</span>
              <span>React + TypeScript + Vite</span>
            </div>
            <div className="flex justify-between">
              <span>Weather API</span>
              <span>Open-Meteo (free)</span>
            </div>
            <div className="flex justify-between">
              <span>Storage</span>
              <span>IndexedDB</span>
            </div>
          </div>

          <p className="text-sm text-zinc-500 mt-6">
            aeroCheck is a comprehensive flight planning tool for hobbyist RC pilots.
            It combines advanced aircraft physics calculations with real-time weather data
            to help you plan safe and enjoyable flights.
          </p>
        </div>
      </div>
    </div>
  );
}
