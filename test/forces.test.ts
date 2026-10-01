import { describe, it, expect } from 'vitest';
import { Forces } from '../src/physics/Forces.ts';
import { Vector2 } from '../src/physics/Vector2.ts';

describe('Forces Suite (Level 8 Verification)', () => {
  it('verifies syllabus benchmark: m = 2 kg, v = 10 m/s, r = 5 m -> Fc = 40 N', () => {
    const fc = Forces.calculate_centripetal_force(2, 10, 5);
    expect(fc).toBe(40);
  });

  it('verifies prompt hint 3 example: m = 2 kg, v = 4 m/s, r = 2 m -> Fc = 16 N', () => {
    const fc = Forces.calculate_centripetal_force(2, 4, 2);
    expect(fc).toBe(16);
  });

  it('calculates centripetal force from angular speed: Fc = m * r * omega^2', () => {
    const m = 2;
    const r = 5;
    const omega = 2;
    const fc = Forces.calculate_centripetal_force_from_omega(m, r, omega);
    expect(fc).toBe(40);
  });

  it('verifies centripetal force vector points inward along negative radial direction', () => {
    const pos = new Vector2(0, 5); // Object directly below center (0,0) or at (0,5)
    const m = 2;
    const v = 10;
    const fcVector = Forces.calculate_centripetal_force_vector(m, pos, v);

    // Inward direction from (0,5) to (0,0) is (0, -1)
    expect(fcVector.x).toBe(0);
    expect(fcVector.y).toBe(-40);
    expect(fcVector.magnitude()).toBe(40);
  });

  it('calculates net force via Newton Second Law', () => {
    const m = 3;
    const accel = new Vector2(4, -2);
    const fNet = Forces.calculate_net_force(m, accel);
    expect(fNet.x).toBe(12);
    expect(fNet.y).toBe(-6);
  });
});
