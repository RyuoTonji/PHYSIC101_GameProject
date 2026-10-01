import { describe, it, expect } from 'vitest';
import { Vector2 } from '../src/physics/Vector2.ts';
import { PhysicsDivisionByZeroError } from '../src/physics/PhysicsErrors.ts';

describe('Vector2 Euclidean Math & Properties', () => {
  it('correctly creates vectors and zero vector', () => {
    const v = new Vector2(3, 4);
    expect(v.x).toBe(3);
    expect(v.y).toBe(4);
    expect(Vector2.ZERO.x).toBe(0);
    expect(Vector2.ZERO.y).toBe(0);
  });

  it('computes magnitude and magnitude squared', () => {
    const v = new Vector2(3, 4);
    expect(v.magnitude()).toBe(5);
    expect(v.magnitudeSquared()).toBe(25);
  });

  it('performs vector addition and subtraction', () => {
    const a = new Vector2(10, 5);
    const b = new Vector2(4, -2);
    const sum = a.add(b);
    const diff = a.subtract(b);
    expect(sum.x).toBe(14);
    expect(sum.y).toBe(3);
    expect(diff.x).toBe(6);
    expect(diff.y).toBe(7);
  });

  it('performs scalar multiplication and division', () => {
    const v = new Vector2(6, -8);
    const scaled = v.multiply(0.5);
    expect(scaled.x).toBe(3);
    expect(scaled.y).toBe(-4);

    const div = v.divide(2);
    expect(div.x).toBe(3);
    expect(div.y).toBe(-4);
  });

  it('throws PhysicsDivisionByZeroError when dividing vector by zero', () => {
    const v = new Vector2(10, 20);
    expect(() => v.divide(0)).toThrow(PhysicsDivisionByZeroError);
  });

  it('calculates dot product correctly', () => {
    const a = new Vector2(1, 0);
    const b = new Vector2(0, 1);
    expect(a.dot(b)).toBe(0); // Orthogonal vectors

    const c = new Vector2(3, 4);
    const d = new Vector2(2, 5);
    expect(c.dot(d)).toBe(3 * 2 + 4 * 5); // 26
  });

  it('calculates 2D cross product (determinant)', () => {
    const a = new Vector2(1, 0);
    const b = new Vector2(0, 1);
    expect(a.cross(b)).toBe(1); // Standard right-hand CCW
    expect(b.cross(a)).toBe(-1);
  });

  it('normalizes non-zero vectors and handles zero vectors safely', () => {
    const v = new Vector2(0, 10);
    const unit = v.normalize();
    expect(unit.x).toBe(0);
    expect(unit.y).toBe(1);
    expect(unit.magnitude()).toBeCloseTo(1.0, 6);

    const zeroNormalized = Vector2.ZERO.normalize();
    expect(zeroNormalized.x).toBe(0);
    expect(zeroNormalized.y).toBe(0);
  });

  it('calculates perpendicular vector (tangent)', () => {
    const radial = new Vector2(1, 0);
    const tangent = radial.perpendicular();
    expect(tangent.x).toBe(0);
    expect(tangent.y).toBe(1);
    expect(radial.dot(tangent)).toBe(0); // Strictly perpendicular
  });

  it('calculates distance between two vectors', () => {
    const a = new Vector2(0, 0);
    const b = new Vector2(6, 8);
    expect(a.distanceTo(b)).toBe(10);
  });
});
