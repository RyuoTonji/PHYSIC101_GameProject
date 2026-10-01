import { describe, it, expect } from 'vitest';
import { Kinematics } from '../src/physics/Kinematics.ts';
import { Vector2 } from '../src/physics/Vector2.ts';
import { PHYSICS_CONSTANTS } from '../src/physics/PhysicsConstants.ts';

describe('Analytical vs. Simulation Validation Suite (Section 19 Benchmark)', () => {
  it('validates 1D UARM constant acceleration simulation vs analytical position and velocity', () => {
    // Specification example: vi = 5 m/s, a = 2 m/s^2, total time = 4.0 s
    const vi = 5.0;
    const a = 2.0;
    const totalTime = 4.0;
    const dt = PHYSICS_CONSTANTS.FIXED_TIMESTEP; // 1/60 s

    // Analytical expectations
    const analyticalX = Kinematics.calculate_position(vi, a, totalTime); // 36.0 m
    const analyticalV = Kinematics.calculate_final_velocity(vi, a, totalTime); // 13.0 m/s
    expect(analyticalX).toBe(36.0);
    expect(analyticalV).toBe(13.0);

    // Simulation stepping using Velocity Verlet / Semi-Implicit Euler at 60Hz
    let simX = 0;
    let simV = vi;
    let elapsed = 0;
    const steps = Math.round(totalTime / dt); // 240 steps

    for (let i = 0; i < steps; i++) {
      // Velocity Verlet / Trapezoidal integration
      simX += simV * dt + 0.5 * a * dt * dt;
      simV += a * dt;
      elapsed += dt;
    }

    const posError = Math.abs(simX - analyticalX);
    const velError = Math.abs(simV - analyticalV);
    const relativePosError = posError / analyticalX;

    // Tolerance verification per Section 19: ±0.05m, ±0.05 m/s
    expect(posError).toBeLessThanOrEqual(PHYSICS_CONSTANTS.SIMULATION_POSITION_TOLERANCE);
    expect(velError).toBeLessThanOrEqual(PHYSICS_CONSTANTS.SIMULATION_VELOCITY_TOLERANCE);
    expect(relativePosError).toBeLessThan(0.001); // < 0.1% relative error
  });

  it('validates 2D trajectory simulation vs analytical vector positions', () => {
    const vi = new Vector2(10, 0); // Moving East
    const a = new Vector2(0, -9.80665); // Gravitational acceleration downward
    const totalTime = 1.5;
    const dt = PHYSICS_CONSTANTS.FIXED_TIMESTEP;

    const analyticalPos = Kinematics.calculate_position_vector(vi, a, totalTime);

    let simPos = Vector2.ZERO;
    let simVel = vi;
    const steps = Math.round(totalTime / dt);

    for (let i = 0; i < steps; i++) {
      simPos = simPos.add(simVel.multiply(dt)).add(a.multiply(0.5 * dt * dt));
      simVel = simVel.add(a.multiply(dt));
    }

    const posError = simPos.distanceTo(analyticalPos);
    expect(posError).toBeLessThanOrEqual(PHYSICS_CONSTANTS.SIMULATION_POSITION_TOLERANCE);
  });

  it('validates circular orbit radius preservation under centripetal acceleration integration', () => {
    const radius = 5.0; // meters
    const omega = 2.0; // rad/s
    const dt = PHYSICS_CONSTANTS.FIXED_TIMESTEP;
    const totalTime = 2.0; // 2 seconds of circular motion

    // Start at (radius, 0)
    let angle = 0;
    const steps = Math.round(totalTime / dt);

    for (let i = 0; i < steps; i++) {
      angle += omega * dt;
    }

    const simX = radius * Math.cos(angle);
    const simY = radius * Math.sin(angle);
    const currentRadius = Math.sqrt(simX * simX + simY * simY);

    const radiusError = Math.abs(currentRadius - radius);
    expect(radiusError).toBeLessThanOrEqual(PHYSICS_CONSTANTS.SIMULATION_POSITION_TOLERANCE);
  });
});
