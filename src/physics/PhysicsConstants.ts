/**
 * Standard physics constants and numerical simulation parameters.
 */
export const PHYSICS_CONSTANTS = {
  /**
   * Deterministic physics simulation update step: 60Hz = 1/60s.
   */
  FIXED_TIMESTEP: 1 / 60, // 0.016666666666666666 seconds

  /**
   * Standard gravitational acceleration magnitude on Earth surface (m/s^2).
   */
  STANDARD_GRAVITY: 9.80665,

  /**
   * Analytical tolerance for floating point calculations.
   */
  ANALYTICAL_TOLERANCE: 1e-5,

  /**
   * Simulation vs analytical benchmark tolerance (per prompt: ±0.05).
   */
  SIMULATION_POSITION_TOLERANCE: 0.05, // meters
  SIMULATION_VELOCITY_TOLERANCE: 0.05, // m/s
  SIMULATION_ACCELERATION_TOLERANCE: 0.05, // m/s^2

  /**
   * Maximum physics step accumulator time to prevent spiral of death.
   */
  MAX_ACCUMULATOR_STEP: 0.1
} as const;
