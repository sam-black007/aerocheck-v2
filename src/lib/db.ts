import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { FlightData, Settings } from '../types';

interface AeroCheckDB extends DBSchema {
  flights: {
    key: string;
    value: FlightData;
    indexes: { 'by-date': string };
  };
  settings: {
    key: string;
    value: Settings;
  };
}

let db: IDBPDatabase<AeroCheckDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<AeroCheckDB>> {
  if (db) return db;

  db = await openDB<AeroCheckDB>('aerocheck-db', 1, {
    upgrade(database) {
      const flightStore = database.createObjectStore('flights', { keyPath: 'id' });
      flightStore.createIndex('by-date', 'date');
      database.createObjectStore('settings', { keyPath: 'id' });
    },
  });

  return db;
}

export async function getAllFlights(): Promise<FlightData[]> {
  const database = await initDB();
  const flights = await database.getAllFromIndex('flights', 'by-date');
  return flights.reverse();
}

export async function saveFlight(flight: FlightData): Promise<void> {
  const database = await initDB();
  await database.put('flights', flight);
}

export async function deleteFlight(id: string): Promise<void> {
  const database = await initDB();
  await database.delete('flights', id);
}

export async function clearAllFlights(): Promise<void> {
  const database = await initDB();
  await database.clear('flights');
}

export async function getSettings(): Promise<Settings | null> {
  const database = await initDB();
  return database.get('settings', 'user-settings') || null;
}

export async function saveSettings(settings: Settings): Promise<void> {
  const database = await initDB();
  await database.put('settings', { ...settings, id: 'user-settings' } as any);
}

export function exportFlightsToJSON(flights: FlightData[]): string {
  return JSON.stringify({
    version: '1.0',
    exportDate: new Date().toISOString(),
    flights,
  }, null, 2);
}

export function importFlightsFromJSON(json: string): FlightData[] {
  try {
    const data = JSON.parse(json);
    if (data.flights && Array.isArray(data.flights)) {
      return data.flights;
    }
  } catch {
    console.error('Invalid import file');
  }
  return [];
}

export function downloadJSON(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
