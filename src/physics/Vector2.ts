import { PhysicsDivisionByZeroError } from './PhysicsErrors.ts';

/**
 * Robust 2D Vector representation for physical quantities (displacement, velocity, acceleration, force).
 * Provides immutable operations to guarantee mathematical determinism.
 */
export class Vector2 {
  public x: number;
  public y: number;

  public static get ZERO(): Vector2 {
    return new Vector2(0, 0);
  }
  public static get UP(): Vector2 {
    return new Vector2(0, -1);
  }
  public static get DOWN(): Vector2 {
    return new Vector2(0, 1);
  }
  public static get LEFT(): Vector2 {
    return new Vector2(-1, 0);
  }
  public static get RIGHT(): Vector2 {
    return new Vector2(1, 0);
  }

  constructor(x: number = 0, y: number = 0) {
    this.x = Number.isFinite(x) ? (Object.is(x, -0) || x === 0 ? 0 : x) : 0;
    this.y = Number.isFinite(y) ? (Object.is(y, -0) || y === 0 ? 0 : y) : 0;
  }

  public add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  public subtract(other: Vector2): Vector2 {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  public multiply(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  public divide(scalar: number): Vector2 {
    if (scalar === 0 || !Number.isFinite(scalar)) {
      throw new PhysicsDivisionByZeroError('scalar', 'Vector2.divide');
    }
    return new Vector2(this.x / scalar, this.y / scalar);
  }

  public dot(other: Vector2): number {
    return this.x * other.x + this.y * other.y;
  }

  /**
   * 2D pseudo-cross product (determinant / perpendicular dot product).
   * a.cross(b) = ax * by - ay * bx
   * Positive if 'other' is counterclockwise relative to 'this'.
   */
  public cross(other: Vector2): number {
    return this.x * other.y - this.y * other.x;
  }

  public magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  public magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public normalize(): Vector2 {
    const mag = this.magnitude();
    if (mag === 0) {
      return Vector2.ZERO;
    }
    return new Vector2(this.x / mag, this.y / mag);
  }

  public distanceTo(other: Vector2): number {
    return this.subtract(other).magnitude();
  }

  /**
   * Angle in radians relative to positive X-axis [-PI, +PI].
   */
  public angle(): number {
    return Math.atan2(this.y, this.x);
  }

  /**
   * Angle in degrees [0, 360).
   */
  public angleDegrees(): number {
    let deg = (Math.atan2(this.y, this.x) * 180) / Math.PI;
    if (deg < 0) deg += 360;
    return deg;
  }

  /**
   * Returns a 90-degree counterclockwise perpendicular vector (tangent).
   */
  public perpendicular(): Vector2 {
    return new Vector2(-this.y, this.x);
  }

  public equals(other: Vector2, tolerance: number = 1e-6): boolean {
    return (
      Math.abs(this.x - other.x) <= tolerance &&
      Math.abs(this.y - other.y) <= tolerance
    );
  }

  public static fromAngle(radians: number, length: number = 1): Vector2 {
    return new Vector2(Math.cos(radians) * length, Math.sin(radians) * length);
  }

  public toString(precision: number = 2): string {
    return `(${this.x.toFixed(precision)}, ${this.y.toFixed(precision)})`;
  }
}
