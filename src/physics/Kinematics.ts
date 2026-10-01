import { Vector2 } from './Vector2.ts';
import { PhysicsDivisionByZeroError, InvalidPhysicsValueError } from './PhysicsErrors.ts';

/**
 * Kinematics calculations adhering strictly to authoritative physics principles.
 * Covers 1D and 2D displacement, speed, velocity, acceleration, and UARM equations.
 */
export class Kinematics {
  /**
   * Calculates 1D displacement: Delta x = xf - xi (meters).
   */
  public static calculate_displacement(xi: number, xf: number): number {
    return xf - xi;
  }

  /**
   * Calculates 2D vector displacement: Delta r = rf - ri (meters).
   */
  public static calculate_displacement_vector(ri: Vector2, rf: Vector2): Vector2 {
    return rf.subtract(ri);
  }

  /**
   * Calculates scalar average speed: v_avg = distance / time (m/s).
   * @throws PhysicsDivisionByZeroError if time is zero.
   * @throws InvalidPhysicsValueError if time or distance is negative.
   */
  public static calculate_average_speed(distance: number, time: number): number {
    if (time === 0) {
      throw new PhysicsDivisionByZeroError('time', 'calculate_average_speed');
    }
    if (time < 0) {
      throw new InvalidPhysicsValueError('time', time, 'time must be positive');
    }
    if (distance < 0) {
      throw new InvalidPhysicsValueError('distance', distance, 'distance cannot be negative');
    }
    return distance / time;
  }

  /**
   * Calculates 1D average velocity: v_avg = Delta x / time (m/s).
   * @throws PhysicsDivisionByZeroError if time is zero.
   */
  public static calculate_average_velocity(displacement: number, time: number): number {
    if (time === 0) {
      throw new PhysicsDivisionByZeroError('time', 'calculate_average_velocity');
    }
    if (time < 0) {
      throw new InvalidPhysicsValueError('time', time, 'time must be positive');
    }
    return displacement / time;
  }

  /**
   * Calculates 2D vector average velocity: v_avg = Delta r / time (m/s).
   * @throws PhysicsDivisionByZeroError if time is zero.
   */
  public static calculate_average_velocity_vector(displacement: Vector2, time: number): Vector2 {
    if (time === 0) {
      throw new PhysicsDivisionByZeroError('time', 'calculate_average_velocity_vector');
    }
    if (time < 0) {
      throw new InvalidPhysicsValueError('time', time, 'time must be positive');
    }
    return displacement.divide(time);
  }

  /**
   * Calculates 1D average acceleration: a = Delta v / time = (vf - vi) / time (m/s^2).
   * @throws PhysicsDivisionByZeroError if time is zero.
   */
  public static calculate_acceleration(vi: number, vf: number, time: number): number {
    if (time === 0) {
      throw new PhysicsDivisionByZeroError('time', 'calculate_acceleration');
    }
    if (time < 0) {
      throw new InvalidPhysicsValueError('time', time, 'time must be positive');
    }
    return (vf - vi) / time;
  }

  /**
   * Calculates 2D vector average acceleration: a = Delta v / time (m/s^2).
   * @throws PhysicsDivisionByZeroError if time is zero.
   */
  public static calculate_acceleration_vector(vi: Vector2, vf: Vector2, time: number): Vector2 {
    if (time === 0) {
      throw new PhysicsDivisionByZeroError('time', 'calculate_acceleration_vector');
    }
    if (time < 0) {
      throw new InvalidPhysicsValueError('time', time, 'time must be positive');
    }
    return vf.subtract(vi).divide(time);
  }

  /**
   * Uniformly Accelerated Rectilinear Motion (UARM) Eq 1:
   * vf = vi + a * t (m/s).
   */
  public static calculate_final_velocity(vi: number, a: number, t: number): number {
    if (t < 0) {
      throw new InvalidPhysicsValueError('t', t, 'elapsed time must be non-negative');
    }
    return vi + a * t;
  }

  /**
   * UARM Eq 2:
   * Delta x = vi * t + 0.5 * a * t^2 (m).
   * If initial position xi is provided, returns xf = xi + Delta x.
   */
  public static calculate_position(vi: number, a: number, t: number, xi: number = 0): number {
    if (t < 0) {
      throw new InvalidPhysicsValueError('t', t, 'elapsed time must be non-negative');
    }
    const deltaX = vi * t + 0.5 * a * t * t;
    return xi + deltaX;
  }

  /**
   * UARM 2D Vector Position:
   * rf = ri + vi * t + 0.5 * a * t^2 (m).
   */
  public static calculate_position_vector(
    vi: Vector2,
    a: Vector2,
    t: number,
    ri: Vector2 = Vector2.ZERO
  ): Vector2 {
    if (t < 0) {
      throw new InvalidPhysicsValueError('t', t, 'elapsed time must be non-negative');
    }
    const displacement = vi.multiply(t).add(a.multiply(0.5 * t * t));
    return ri.add(displacement);
  }

  /**
   * UARM Eq 3 (Torricelli equation):
   * vf^2 = vi^2 + 2 * a * Delta x
   * Resolves final velocity vf (m/s).
   * @param directionSign Optional explicitly specified sign (+1 or -1). Defaults to sign of (vi + a*dx) or +1.
   */
  public static calculate_final_velocity_torricelli(
    vi: number,
    a: number,
    dx: number,
    directionSign?: number
  ): number {
    const vfSquared = vi * vi + 2 * a * dx;
    if (vfSquared < -1e-7) {
      throw new InvalidPhysicsValueError(
        'vf^2',
        vfSquared,
        'Cannot be negative (physically unreachable position under given deceleration)'
      );
    }
    const speed = Math.sqrt(Math.max(0, vfSquared));
    if (directionSign !== undefined) {
      return speed * Math.sign(directionSign);
    }
    // Default sign matches vi if not zero, or acceleration direction
    const sign = vi !== 0 ? Math.sign(vi) : Math.sign(a) || 1;
    return speed * sign;
  }

  /**
   * UARM Eq 4 (Mean Speed / Average Velocity formula):
   * Delta x = ((vi + vf) / 2) * t
   */
  public static calculate_displacement_from_average_velocity(
    vi: number,
    vf: number,
    t: number
  ): number {
    if (t < 0) {
      throw new InvalidPhysicsValueError('t', t, 'elapsed time must be non-negative');
    }
    return ((vi + vf) / 2) * t;
  }
}
