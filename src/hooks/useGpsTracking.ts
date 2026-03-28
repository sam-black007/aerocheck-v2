import { useState, useEffect, useRef, useCallback } from 'react';
import { GpsPoint } from '../types';

interface UseGpsTrackingOptions {
  enableGForce?: boolean;
  onPositionUpdate?: (point: GpsPoint) => void;
}

interface GpsState {
  isTracking: boolean;
  route: GpsPoint[];
  maxSpeed: number;
  maxAltitude: number;
  averageGForce: number;
  error: string | null;
}

export function useGpsTracking(options: UseGpsTrackingOptions = {}) {
  const { enableGForce = true, onPositionUpdate } = options;
  const [state, setState] = useState<GpsState>({
    isTracking: false,
    route: [],
    maxSpeed: 0,
    maxAltitude: 0,
    averageGForce: 1,
    error: null,
  });

  const watchIdRef = useRef<number | null>(null);
  const gForceHistory = useRef<number[]>([]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation not supported' }));
      return;
    }

    setState(prev => ({
      ...prev,
      isTracking: true,
      route: [],
      maxSpeed: 0,
      maxAltitude: 0,
      averageGForce: 1,
      error: null,
    }));

    gForceHistory.current = [];

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const point: GpsPoint = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          alt: position.coords.altitude || 0,
          timestamp: Date.now(),
          speed: position.coords.speed ? position.coords.speed * 3.6 : undefined, // m/s to km/h
        };

        setState(prev => {
          const newRoute = [...prev.route, point];
          const speeds = newRoute.filter(p => p.speed).map(p => p.speed!);
          const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;
          const maxAltitude = Math.max(...newRoute.map(p => p.alt), 0);

          return {
            ...prev,
            route: newRoute,
            maxSpeed: Math.max(prev.maxSpeed, maxSpeed),
            maxAltitude: Math.max(prev.maxAltitude, maxAltitude),
          };
        });

        onPositionUpdate?.(point);
      },
      (error) => {
        setState(prev => ({ ...prev, error: error.message }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    // G-force tracking using DeviceMotion API
    if (enableGForce && 'DeviceMotionEvent' in window) {
      const handleMotion = (event: DeviceMotionEvent) => {
        if (event.accelerationIncludingGravity) {
          const x = event.accelerationIncludingGravity.x || 0;
          const y = event.accelerationIncludingGravity.y || 0;
          const z = event.accelerationIncludingGravity.z || 0;
          
          // Calculate total acceleration
          const gForce = Math.sqrt(x * x + y * y + z * z) / 9.81;
          gForceHistory.current.push(gForce);
          
          // Calculate rolling average
          const avg = gForceHistory.current.slice(-20)
            .reduce((a, b) => a + b, 0) / Math.min(gForceHistory.current.length, 20);
          
          setState(prev => ({ ...prev, averageGForce: avg }));
        }
      };

      window.addEventListener('devicemotion', handleMotion);
    }
  }, [enableGForce, onPositionUpdate]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState(prev => ({ ...prev, isTracking: false }));
  }, []);

  const clearRoute = useCallback(() => {
    setState(prev => ({
      ...prev,
      route: [],
      maxSpeed: 0,
      maxAltitude: 0,
      averageGForce: 1,
    }));
    gForceHistory.current = [];
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startTracking,
    stopTracking,
    clearRoute,
  };
}

/**
 * Calculate distance between two GPS points (Haversine formula)
 */
export function calculateDistance(point1: GpsPoint, point2: GpsPoint): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lon - point1.lon);
  const lat1 = toRad(point1.lat);
  const lat2 = toRad(point2.lat);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calculate total route distance
 */
export function calculateTotalDistance(route: GpsPoint[]): number {
  if (route.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    total += calculateDistance(route[i - 1], route[i]);
  }
  return total;
}
