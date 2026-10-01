import { describe, it, expect } from 'vitest';
import { CircularMotion } from '../src/physics/CircularMotion.ts';
import { Vector2 } from '../src/physics/Vector2.ts';

describe('Circular Motion Suite (Levels 5-7 Verification)', () => {
  describe('Level 5: Rotation, Revolution, and Period', () => {
    it('verifies syllabus benchmark: 12 s for 3 cycles -> T = 4 s', () => {
      const period = CircularMotion.calculate_period(12, 3);
      expect(period).toBe(4);
    });

    it('calculates frequency from time and cycles', () => {
      const freq = CircularMotion.calculate_frequency(12, 3);
      expect(freq).toBe(0.25);
    });

    it('verifies inverse relationship: f = 1 / T', () => {
      const period = 4;
      const freq = CircularMotion.calculate_frequency_from_period(period);
      expect(freq).toBe(0.25);
      expect(freq * period).toBe(1);
    });

    it('calculates angular speed from period', () => {
      const T = 4;
      const omega = CircularMotion.calculate_angular_speed_from_period(T);
      expect(omega).toBeCloseTo(Math.PI / 2, 6);
    });
  });

  describe('Level 6: Linear Speed vs. Rotational Speed', () => {
    it('verifies syllabus benchmark: omega = 2 rad/s across different radii', () => {
      const omega = 2; // rad/s
      const v1 = CircularMotion.calculate_linear_speed(1, omega);
      const v2 = CircularMotion.calculate_linear_speed(2, omega);
      const v3 = CircularMotion.calculate_linear_speed(3, omega);

      expect(v1).toBe(2);
      expect(v2).toBe(4);
      expect(v3).toBe(6);

      // Invariant: Larger radius on rigid body yields larger linear speed
      expect(v3).toBeGreaterThan(v2);
      expect(v2).toBeGreaterThan(v1);
    });
  });

  describe('Level 7: Tangential Velocity and Centripetal Acceleration', () => {
    it('verifies syllabus benchmark: v = 10 m/s, r = 5 m -> ac = 20 m/s^2', () => {
      const ac = CircularMotion.calculate_centripetal_acceleration(10, 5);
      expect(ac).toBe(20);
    });

    it('verifies equivalence between v^2/r and r*omega^2', () => {
      const r = 5;
      const omega = 2; // v = r * omega = 10 m/s
      const acFromV = CircularMotion.calculate_centripetal_acceleration(10, r);
      const acFromOmega = CircularMotion.calculate_centripetal_acceleration_from_omega(r, omega);
      expect(acFromV).toBe(20);
      expect(acFromOmega).toBe(20);
    });

    it('verifies centripetal acceleration vector points strictly towards center', () => {
      // Object at (5, 0) relative to center, speed 10 m/s
      const pos = new Vector2(5, 0);
      const acVector = CircularMotion.calculate_centripetal_acceleration_vector(pos, 10);
      // Center is at (0,0), so inward direction is (-1, 0)
      expect(acVector.x).toBe(-20);
      expect(acVector.y).toBe(0);
      expect(acVector.magnitude()).toBe(20);
    });

    it('verifies tangential velocity is strictly perpendicular to radial vector', () => {
      const pos = new Vector2(3, 4); // r = 5
      const omega = 2; // rad/s
      const vt = CircularMotion.calculate_tangential_velocity_vector(pos, omega);

      // Radial vector dot tangential velocity vector must be exactly zero
      expect(pos.dot(vt)).toBe(0);
      // Tangential speed magnitude must equal r * omega = 5 * 2 = 10 m/s
      expect(vt.magnitude()).toBeCloseTo(10, 6);
    });
  });
});
