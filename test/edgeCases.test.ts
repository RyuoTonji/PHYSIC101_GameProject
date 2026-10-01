import { describe, it, expect } from 'vitest';
import { Kinematics } from '../src/physics/Kinematics.ts';
import { CircularMotion } from '../src/physics/CircularMotion.ts';
import { Forces } from '../src/physics/Forces.ts';
import { Vector2 } from '../src/physics/Vector2.ts';
import {
  PhysicsDivisionByZeroError,
  PhysicsSingularityError,
  InvalidPhysicsValueError
} from '../src/physics/PhysicsErrors.ts';

describe('Physics Edge Cases and Robustness Suite', () => {
  describe('Zero and Singularity Guards', () => {
    it('throws on zero time for average speed and velocity', () => {
      expect(() => Kinematics.calculate_average_speed(10, 0)).toThrow(PhysicsDivisionByZeroError);
      expect(() => Kinematics.calculate_average_velocity(10, 0)).toThrow(PhysicsDivisionByZeroError);
      expect(() => Kinematics.calculate_average_velocity_vector(new Vector2(10, 5), 0)).toThrow(
        PhysicsDivisionByZeroError
      );
    });

    it('throws on zero time for acceleration', () => {
      expect(() => Kinematics.calculate_acceleration(5, 10, 0)).toThrow(PhysicsDivisionByZeroError);
      expect(() =>
        Kinematics.calculate_acceleration_vector(new Vector2(0, 0), new Vector2(10, 0), 0)
      ).toThrow(PhysicsDivisionByZeroError);
    });

    it('throws on zero cycles for period', () => {
      expect(() => CircularMotion.calculate_period(10, 0)).toThrow(PhysicsDivisionByZeroError);
    });

    it('throws on zero period for frequency and angular speed', () => {
      expect(() => CircularMotion.calculate_frequency_from_period(0)).toThrow(PhysicsDivisionByZeroError);
      expect(() => CircularMotion.calculate_angular_speed_from_period(0)).toThrow(PhysicsDivisionByZeroError);
    });

    it('throws on zero radius for centripetal acceleration and force', () => {
      expect(() => CircularMotion.calculate_centripetal_acceleration(10, 0)).toThrow(
        PhysicsSingularityError
      );
      expect(() => Forces.calculate_centripetal_force(2, 10, 0)).toThrow(PhysicsSingularityError);
    });
  });

  describe('Zero Quantities Handling', () => {
    it('handles zero distance with positive time cleanly (zero speed)', () => {
      expect(Kinematics.calculate_average_speed(0, 5)).toBe(0);
    });

    it('handles zero displacement with positive time cleanly (zero velocity)', () => {
      expect(Kinematics.calculate_average_velocity(0, 5)).toBe(0);
    });

    it('handles zero velocity and zero acceleration', () => {
      expect(Kinematics.calculate_position(0, 0, 10)).toBe(0);
      expect(Kinematics.calculate_final_velocity(0, 0, 10)).toBe(0);
    });
  });

  describe('Negative Inputs and Physical Constraints', () => {
    it('throws on negative time', () => {
      expect(() => Kinematics.calculate_average_speed(10, -2)).toThrow(InvalidPhysicsValueError);
      expect(() => Kinematics.calculate_position(5, 2, -1)).toThrow(InvalidPhysicsValueError);
    });

    it('throws on negative distance', () => {
      expect(() => Kinematics.calculate_average_speed(-10, 2)).toThrow(InvalidPhysicsValueError);
    });

    it('throws on non-positive mass', () => {
      expect(() => Forces.calculate_centripetal_force(0, 10, 5)).toThrow(InvalidPhysicsValueError);
      expect(() => Forces.calculate_centripetal_force(-2, 10, 5)).toThrow(InvalidPhysicsValueError);
    });

    it('correctly processes negative velocity and negative acceleration (1D vectors)', () => {
      // Car moving backward at -10 m/s accelerates backward at -2 m/s^2 for 3s
      const vf = Kinematics.calculate_final_velocity(-10, -2, 3);
      expect(vf).toBe(-16);
      const dx = Kinematics.calculate_position(-10, -2, 3);
      expect(dx).toBe(-10 * 3 + 0.5 * (-2) * 9); // -30 - 9 = -39 m
    });
  });

  describe('Scale Invariance: Very Large and Very Small Numbers', () => {
    it('computes planetary/astronomical scales without overflow', () => {
      // Earth orbit approx: r = 1.496e11 m, v = 2.978e4 m/s
      const r = 1.496e11;
      const v = 2.978e4;
      const ac = CircularMotion.calculate_centripetal_acceleration(v, r);
      expect(ac).toBeCloseTo(0.005928, 4);
    });

    it('computes microscopic/sub-atomic scales without underflow', () => {
      const r = 5.29e-11; // Bohr radius
      const v = 2.18e6;
      const ac = CircularMotion.calculate_centripetal_acceleration(v, r);
      expect(ac).toBeGreaterThan(0);
      expect(Number.isFinite(ac)).toBe(true);
    });
  });
});
