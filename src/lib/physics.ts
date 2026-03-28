import { AircraftType, CalculationResult, SimulatorState } from '../types';

// Standard atmosphere constants
const RHO_SEA_LEVEL = 1.225; // kg/m³
const G = 9.81; // m/s²
const ISA_LAPSE_RATE = 0.0065; // °C/m
const ISA_TEMP_SEA = 288.15; // K

/**
 * Calculate air density at altitude using ISA model
 */
export function calculateAirDensity(altitudeM: number, temperatureC: number): number {
  const isaTemp = ISA_TEMP_SEA - ISA_LAPSE_RATE * altitudeM;
  const actualTemp = temperatureC + 273.15;
  const sigma = Math.pow(isaTemp / actualTemp, 4.14);
  return RHO_SEA_LEVEL * sigma;
}

/**
 * Calculate density altitude (feet)
 */
export function calculateDensityAltitude(
  pressureAltitude: number,
  temperatureC: number
): number {
  const isaTemp = 15 - (pressureAltitude / 1000) * 2;
  const deltaT = temperatureC - isaTemp;
  return (pressureAltitude + deltaT * 120) * 3.281;
}

/**
 * Calculate lift coefficient at angle of attack
 */
export function calculateLiftCoefficient(
  clMax: number,
  aoa: number = 0,
  cl0: number = 0.2
): number {
  const clAlpha = clMax / 15; // approximate lift curve slope
  return Math.min(clMax, cl0 + clAlpha * aoa);
}

/**
 * Calculate drag coefficient (polar)
 */
export function calculateDragCoefficient(
  cd0: number,
  cl: number,
  Oswald: number,
  aspectRatio: number
): number {
  const k = 1 / (Math.PI * Oswald * aspectRatio); // induced drag factor
  return cd0 + k * cl * cl;
}

/**
 * Calculate stall speed (km/h)
 */
export function calculateStallSpeed(
  weightN: number,
  wingAreaM2: number,
  rho: number,
  clMax: number
): number {
  const vs = Math.sqrt((2 * weightN) / (rho * wingAreaM2 * clMax));
  return vs * 3.6; // m/s to km/h
}

/**
 * Calculate cruise speed (km/h)
 */
export function calculateCruiseSpeed(
  weightN: number,
  wingAreaM2: number,
  rho: number,
  cl: number
): number {
  const vc = Math.sqrt((2 * weightN) / (rho * wingAreaM2 * cl));
  return vc * 3.6;
}

/**
 * Calculate rate of climb (m/s)
 */
export function calculateRateOfClimb(
  thrustN: number,
  dragN: number,
  weightN: number,
  velocityMS: number
): number {
  const excessPower = (thrustN - dragN) * velocityMS;
  return Math.max(0, excessPower / weightN);
}

/**
 * Calculate glide ratio
 */
export function calculateGlideRatio(
  Oswald: number,
  aspectRatio: number,
  cd0: number
): number {
  const k = 1 / (Math.PI * Oswald * aspectRatio);
  const clOpt = Math.sqrt(cd0 / k);
  const cdMin = 2 * cd0;
  return clOpt / cdMin;
}

/**
 * Calculate turn radius (m)
 */
export function calculateTurnRadius(
  velocityMS: number,
  bankAngleDeg: number
): number {
  const bankRad = (bankAngleDeg * Math.PI) / 180;
  return (velocityMS * velocityMS) / (G * Math.tan(bankRad));
}

/**
 * Calculate turn rate (°/s)
 */
export function calculateTurnRate(
  velocityMS: number,
  bankAngleDeg: number
): number {
  const bankRad = (bankAngleDeg * Math.PI) / 180;
  const rate = (G * Math.tan(bankRad)) / velocityMS;
  return (rate * 180) / Math.PI;
}

/**
 * Calculate endurance (minutes)
 */
export function calculateEndurance(
  batteryMAh: number,
  motorWatts: number,
  voltage: number,
  efficiency: number = 0.7
): number {
  if (voltage === 0) return 0;
  const capacityAh = batteryMAh / 1000;
  const currentDraw = motorWatts / voltage;
  return (capacityAh / currentDraw) * 60 * efficiency;
}

/**
 * Calculate propeller efficiency
 */
export function calculatePropellerEfficiency(
  advanceRatio: number,
  bladeAreaRatio: number
): number {
  // Simplified propeller efficiency model
  const j = Math.max(0.1, Math.min(1.5, advanceRatio));
  const kt = 0.15 * bladeAreaRatio;
  return Math.min(0.85, kt * (1 - j) + 0.5);
}

/**
 * Calculate CG position (% MAC)
 */
export function calculateCGPosition(
  wingChord: number,
  wingRoot: number,
  wingTip: number,
  batteryPosition: number,
  motorPosition: number
): number {
  // Simplified CG calculation based on component positions
  const meanChord = (wingRoot + wingTip) / 2;
  const acPosition = 0.25; // 25% MAC aerodynamic center
  const cgOffset = (batteryPosition - motorPosition) * 0.1;
  return 25 + cgOffset * 100;
}

/**
 * Calculate stability factor
 */
export function calculateStabilityFactor(
  aspectRatio: number,
  Oswald: number,
  cl: number,
  alphaStab: number = 0
): number {
  // Longitudinal stability derivative
  const CmAlpha = -0.05 * (1 - 2 * alphaStab);
  const staticMargin = 0.05;
  const stability = (CmAlpha * aspectRatio) / (1 + aspectRatio) + staticMargin;
  return Math.max(-1, Math.min(1, stability));
}

/**
 * Calculate service ceiling (m)
 */
export function calculateServiceCeiling(
  maxThrustN: number,
  weightN: number,
  wingAreaM2: number,
  rho0: number,
  cd0: number,
  Oswald: number,
  aspectRatio: number
): number {
  const k = 1 / (Math.PI * Oswald * aspectRatio);
  const clCruise = Math.sqrt(cd0 / k);
  let ceiling = 0;
  
  for (let alt = 0; alt < 10000; alt += 100) {
    const rho = rho0 * Math.pow(1 - ISA_LAPSE_RATE * alt / ISA_TEMP_SEA, 4.14);
    const dragMin = 0.5 * rho * 50 * 50 * wingAreaM2 * cd0;
    const availableROC = (maxThrustN - dragMin) * 50 / weightN;
    
    if (availableROC < 0.5) {
      ceiling = alt;
      break;
    }
  }
  
  return ceiling;
}

/**
 * Main calculation function for aircraft performance
 */
export function calculatePerformance(
  aircraft: AircraftType,
  temperatureC: number = 15,
  altitudeM: number = 0
): CalculationResult {
  // Convert units
  const b = aircraft.wingspan / 100; // m
  const S = aircraft.wingArea / 10000; // m²
  const W = (aircraft.weight / 1000) * G; // N
  const AR = aircraft.aspectRatio;
  const cd0 = aircraft.cd0;
  const clMax = aircraft.clMax;
  const e = aircraft.Oswald;
  const P = aircraft.motorPower;
  
  // Air density
  const rho = calculateAirDensity(altitudeM, temperatureC);
  const sigma = rho / RHO_SEA_LEVEL;
  
  // Wing loading (g/dm²)
  const wingLoading = (aircraft.weight / (aircraft.wingArea / 100)) * 10;
  
  // Stall speed
  const vs = calculateStallSpeed(W, S, rho, clMax);
  
  // Cruise speed (1.3x stall)
  const vc = vs * 1.3;
  
  // Max speed (motor limited)
  const pWattsPerKg = P / (aircraft.weight / 1000);
  const vmax = Math.min(vs * 2.5, 80 + pWattsPerKg * 2);
  
  // Thrust estimation
  const etaProp = 0.75;
  const thrust = (P * etaProp) / Math.max(vc / 3.6, 5);
  
  // Thrust-to-weight ratio
  const thrustWeight = thrust / W;
  
  // Drag at cruise
  const clCruise = (2 * W) / (rho * Math.pow(vc / 3.6, 2) * S);
  const cdCruise = calculateDragCoefficient(cd0, clCruise, e, AR);
  const drag = 0.5 * rho * Math.pow(vc / 3.6, 2) * S * cdCruise;
  
  // Rate of climb
  const roc = calculateRateOfClimb(thrust, drag, W, vc / 3.6);
  
  // Glide ratio
  const glideRatio = calculateGlideRatio(e, AR, cd0);
  
  // Turn performance (30° bank)
  const vTurn = vc * 1.2;
  const turnRadius = calculateTurnRadius(vTurn / 3.6, 30);
  const turnRate = calculateTurnRate(vTurn / 3.6, 30);
  
  // Endurance
  const endurance = calculateEndurance(
    aircraft.battery,
    aircraft.motorPower,
    aircraft.voltage
  );
  
  // Lift and drag coefficients at cruise
  const liftCoefficient = clCruise;
  const dragCoefficient = cdCruise;
  
  // Stability factor
  const stabilityFactor = calculateStabilityFactor(AR, e, clCruise);
  
  // CG position estimate
  const cgPosition = 28; // typical RC aircraft
  
  // Propeller efficiency
  const advanceRatio = (vc / 3.6) / (Math.sqrt(G * S / 2));
  const propellerEfficiency = calculatePropellerEfficiency(advanceRatio, 0.3);
  
  // Service ceiling
  const ceiling = calculateServiceCeiling(thrust, W, S, rho, cd0, e, AR);
  
  return {
    stallSpeed: Math.round(vs * 10) / 10,
    cruiseSpeed: Math.round(vc * 10) / 10,
    maxSpeed: Math.round(vmax * 10) / 10,
    rateOfClimb: Math.round(roc * 100) / 100,
    glideRatio: Math.round(glideRatio * 10) / 10,
    turnRadius: Math.round(turnRadius),
    turnRate: Math.round(turnRate * 10) / 10,
    endurance: Math.round(endurance),
    wingLoading: Math.round(wingLoading * 10) / 10,
    thrustWeight: Math.round(thrustWeight * 100) / 100,
    liftCoefficient: Math.round(liftCoefficient * 1000) / 1000,
    dragCoefficient: Math.round(dragCoefficient * 1000) / 1000,
    stabilityFactor: Math.round(stabilityFactor * 100) / 100,
    cgPosition: cgPosition,
    propellerEfficiency: Math.round(propellerEfficiency * 100) / 100,
    ceiling: ceiling,
  };
}

/**
 * Calculate simulator performance with weather adjustments
 */
export function calculateSimulatorPerformance(
  baseCalc: CalculationResult,
  simulator: SimulatorState
): CalculationResult {
  const sigma = simulator.airDensityRatio;
  
  return {
    ...baseCalc,
    stallSpeed: Math.round(baseCalc.stallSpeed / Math.sqrt(sigma)),
    cruiseSpeed: Math.round(baseCalc.cruiseSpeed * sigma),
    maxSpeed: Math.round(baseCalc.maxSpeed * sigma),
    rateOfClimb: Math.round(baseCalc.rateOfClimb * sigma * 100) / 100,
    endurance: Math.round(baseCalc.endurance * (1 - simulator.rocLoss / 200)),
  };
}

/**
 * Calculate suitability score (0-100)
 */
export function calculateSuitabilityScore(
  wingLoading: number,
  thrustWeight: number,
  windSpeed: number,
  visibility: number
): number {
  let score = 100;
  
  // Wing loading (ideal: 25-50 g/dm²)
  if (wingLoading < 20) score -= 15;
  else if (wingLoading > 80) score -= 30;
  else if (wingLoading > 60) score -= 15;
  
  // Thrust/weight (0.5+ is good)
  if (thrustWeight < 0.3) score -= 35;
  else if (thrustWeight < 0.5) score -= 20;
  else if (thrustWeight > 2) score -= 10;
  
  // Wind (10-20 km/h ideal)
  if (windSpeed > 25) score -= 40;
  else if (windSpeed > 18) score -= 20;
  else if (windSpeed > 12) score -= 10;
  
  // Visibility
  if (visibility < 2) score -= 30;
  else if (visibility < 5) score -= 15;
  
  return Math.max(0, Math.min(100, score));
}
