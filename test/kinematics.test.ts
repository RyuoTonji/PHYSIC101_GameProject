import { describe, it, expect } from 'vitest';
import { Kinematics } from '../src/physics/Kinematics.ts';
import { Vector2 } from '../src/physics/Vector2.ts';

describe('Kinematics Suite (Levels 1-4 Verification)', () => {
  describe('Level 1: Distance and Displacement', () => {
    it('calculates 1D displacement', () => {
      expect(Kinematics.calculate_displacement(5, 15)).toBe(10);
      expect(Kinematics.calculate_displacement(20, 5)).toBe(-15);
    });

    it('calculates 2D vector displacement for (0,0) to (3,4)', () => {
      const ri = new Vector2(0, 0);
      const rf = new Vector2(3, 4);
      const disp = Kinematics.calculate_displacement_vector(ri, rf);
      expect(disp.x).toBe(3);
      expect(disp.y).toBe(4);
      expect(disp.magnitude()).toBe(5);
    });

    it('verifies 10m East and 10m North example from syllabus (Page 6-7)', () => {
      const ri = new Vector2(0, 0);
      const rf = new Vector2(10, 10);
      const disp = Kinematics.calculate_displacement_vector(ri, rf);
      const distance = 10 + 10; // 20m
      expect(distance).toBe(20);
      expect(disp.magnitude()).toBeCloseTo(14.142136, 4);
      // Invariant: Distance and displacement magnitude must NOT be equal for non-linear path
      expect(distance).not.toBe(disp.magnitude());
      expect(distance).toBeGreaterThan(disp.magnitude());
    });
  });

  describe('Level 2: Average Speed vs. Average Velocity', () => {
    it('verifies syllabus benchmark: 100m distance in 20s -> 5 m/s', () => {
      const speed = Kinematics.calculate_average_speed(100, 20);
      expect(speed).toBe(5);
    });

    it('verifies syllabus benchmark: 60m East displacement in 20s -> 3 m/s East', () => {
      const vel = Kinematics.calculate_average_velocity(60, 20);
      expect(vel).toBe(3);

      const disp2D = new Vector2(60, 0);
      const vel2D = Kinematics.calculate_average_velocity_vector(disp2D, 20);
      expect(vel2D.x).toBe(3);
      expect(vel2D.y).toBe(0);
      expect(vel2D.magnitude()).toBe(3);
    });

    it('verifies out-and-back path: speed is positive while average velocity is zero', () => {
      const distance = 80;
      const time = 20;
      const displacement = 0;
      expect(Kinematics.calculate_average_speed(distance, time)).toBe(4);
      expect(Kinematics.calculate_average_velocity(displacement, time)).toBe(0);
    });
  });

  describe('Level 3: Acceleration', () => {
    it('verifies syllabus benchmark: vi=0 m/s, vf=20 m/s, t=5 s -> a=4 m/s^2', () => {
      const a = Kinematics.calculate_acceleration(0, 20, 5);
      expect(a).toBe(4);
    });

    it('verifies syllabus benchmark 2: vi=5 m/s, vf=15 m/s, t=2 s -> a=5 m/s^2', () => {
      const a = Kinematics.calculate_acceleration(5, 15, 2);
      expect(a).toBe(5);
    });

    it('calculates negative acceleration (braking)', () => {
      const a = Kinematics.calculate_acceleration(25, 5, 4);
      expect(a).toBe(-5);
    });

    it('calculates 2D vector acceleration', () => {
      const vi = new Vector2(10, 0);
      const vf = new Vector2(10, 20);
      const a = Kinematics.calculate_acceleration_vector(vi, vf, 4);
      expect(a.x).toBe(0);
      expect(a.y).toBe(5);
    });
  });

  describe('Level 4: UARM Kinematic Equations', () => {
    it('verifies syllabus benchmark: vi=5 m/s, a=2 m/s^2, t=4 s -> dx=36 m, vf=13 m/s', () => {
      const vi = 5;
      const a = 2;
      const t = 4;
      const dx = Kinematics.calculate_position(vi, a, t);
      const vf = Kinematics.calculate_final_velocity(vi, a, t);
      expect(dx).toBe(36);
      expect(vf).toBe(13);

      // Verify Torricelli
      const vfTorricelli = Kinematics.calculate_final_velocity_torricelli(vi, a, dx);
      expect(vfTorricelli).toBe(13);

      // Verify mean speed formulation
      const dxMean = Kinematics.calculate_displacement_from_average_velocity(vi, vf, t);
      expect(dxMean).toBe(36);
    });

    it('calculates stopping distance and deceleration', () => {
      // Car moving at 20 m/s brakes at -4 m/s^2 to stop (vf = 0)
      const vi = 20;
      const a = -4;
      const t = 5; // (0 - 20) / -4 = 5s
      const dx = Kinematics.calculate_position(vi, a, t);
      expect(dx).toBe(50);
      const vf = Kinematics.calculate_final_velocity(vi, a, t);
      expect(vf).toBe(0);
    });

    it('calculates 2D vector position under acceleration', () => {
      const vi = new Vector2(5, 0);
      const a = new Vector2(0, 2);
      const t = 4;
      const pos = Kinematics.calculate_position_vector(vi, a, t);
      expect(pos.x).toBe(20); // 5 * 4
      expect(pos.y).toBe(16); // 0.5 * 2 * 16
    });
  });
});
