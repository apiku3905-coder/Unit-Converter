import { CalibrationRecord } from '../types';

/**
 * ITS-90 / Callendar-Van Dusen equation utilities for PRTs
 * 
 * R(T) = R0 * (1 + A*T + B*T^2 + C*(T-100)*T^3) for T < 0
 * R(T) = R0 * (1 + A*T + B*T^2) for T >= 0
 * 
 * Correction:
 * T_actual = Intercept + X1*T_calc + X2*T_calc^2
 */

function solveQuadraticForT(T_actual: number, intercept: number, x1: number, x2: number): number {
  if (x2 === 0) {
    return (T_actual - intercept) / x1;
  }
  const c = intercept - T_actual;
  const discriminant = x1 * x1 - 4 * x2 * c;
  if (discriminant < 0) return NaN;
  // Use the root that minimizes error (usually the one with same sign as -b/2a + ...)
  // For small x2, -b + sqrt(b^2-4ac) / 2a is numerically unstable. 
  // We can use 2c / (-b - sign(b)*sqrt(disc))
  if (x1 >= 0) {
    return (2 * c) / (-x1 - Math.sqrt(discriminant));
  } else {
    return (2 * c) / (-x1 + Math.sqrt(discriminant));
  }
}

export function calculateResistance(
  T: number,
  record: CalibrationRecord
): number {
  const { r0, a, b, c } = record;
  // R0 * (1 + A*T + B*T^2 + C*T^3*(T-100))
  return r0 * (1 + a * T + b * Math.pow(T, 2) + c * Math.pow(T, 3) * (T - 100));
}

export function calculateTemperature(
  R: number,
  record: CalibrationRecord
): number {
  const { r0, a, b } = record;
  
  // ROUND((SQRT(A^2 - (4*B*(1 - R/R0))) - A) / (2*B), 3)
  const discriminant = Math.pow(a, 2) - 4 * b * (1 - R / r0);
  if (discriminant < 0) return NaN;
  
  const T = (Math.sqrt(discriminant) - a) / (2 * b);
  return Math.round(T * 1000) / 1000;
}
