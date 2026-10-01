import { Vector2 } from './Vector2.ts';
import {
  PhysicsDivisionByZeroError,
  PhysicsSingularityError,
  InvalidPhysicsValueError
} from './PhysicsErrors.ts';

/**
 * Pure physics calculations for circular motion, rotation, revolution, and centripetal dynamics.
 */
export class CircularMotion {
  /**
   * Calculates Period: T = time / cycles (seconds).
   * @throws PhysicsDivisionByZeroError if cycles is zero.
   * @throws InvalidPhysicsValueError if cycles or time is negative.
   */
  public static calculate_period(time: number, cycles: number): number {
    if (cycles === 0) {
      throw new PhysicsDivisionByZeroError('cycles', 'calculate_period');
    }
    if (cycles < 0) {
      throw new InvalidPhysicsValueError('cycles', cycles, 'number of cycles must be positive');
    }
    if (time < 0) {
      throw new InvalidPhysicsValueError('time', time, 'time must be non-negative');
    }
    return time / cycles;
  }

  /**
   * Calculates Frequency: f = cycles / time (Hertz / s^-1).
   * @throws PhysicsDivisionByZeroError if time is zero.
   */
  public static calculate_frequency(time: number, cycles: number): number {
    if (time === 0) {
      throw new PhysicsDivisionByZeroError('time', 'calculate_frequency');
    }
    if (time < 0) {
      throw new InvalidPhysicsValueError('time', time, 'time must be positive');
    }
    if (cycles < 0) {
      throw new InvalidPhysicsValueError('cycles', cycles, 'number of cycles must be non-negative');
    }
    return cycles / time;
  }

  /**
   * Frequency from Period: f = 1 / T (Hz).
   */
  public static calculate_frequency_from_period(period: number): number {
    if (period <= 0) {
      throw new PhysicsDivisionByZeroError('period', 'calculate_frequency_from_period');
    }
    return 1 / period;
  }

  /**
   * Calculates Angular Velocity: omega = Delta theta / time (rad/s).
   * @param deltaTheta Angular displacement in radians.
   * @param time Elapsed time in seconds.
   */
  public static calculate_angular_velocity(deltaTheta: number, time: number): number {
    if (time === 0) {
      throw new PhysicsDivisionByZeroError('time', 'calculate_angular_velocity');
    }
    if (time < 0) {
      throw new InvalidPhysicsValueError('time', time, 'time must be positive');
    }
    return deltaTheta / time;
  }

  /**
   * Angular speed from period: omega = 2 * PI / T (rad/s).
   */
  public static calculate_angular_speed_from_period(period: number): number {
    if (period <= 0) {
      throw new PhysicsDivisionByZeroError('period', 'calculate_angular_speed_from_period');
    }
    return (2 * Math.PI) / period;
  }

  /**
   * Calculates Tangential / Linear Speed: v = r * omega (m/s).
   * @param radius Radial distance in meters (r >= 0).
   * @param angularVelocity Angular speed in rad/s.
   */
  public static calculate_linear_speed(radius: number, angularVelocity: number): number {
    if (radius < 0) {
      throw new InvalidPhysicsValueError('radius', radius, 'radius must be non-negative');
    }
    return radius * Math.abs(angularVelocity);
  }

  /**
   * Calculates Centripetal Acceleration Magnitude: a_c = v^2 / r (m/s^2).
   * @throws PhysicsSingularityError if radius is zero (division by zero at center of rotation).
   */
  public static calculate_centripetal_acceleration(v: number, radius: number): number {
    if (radius <= 0) {
      throw new PhysicsSingularityError(
        'radius',
        'Centripetal acceleration is undefined at radius r <= 0'
      );
    }
    return (v * v) / radius;
  }

  /**
   * Calculates Centripetal Acceleration Magnitude from angular speed: a_c = r * omega^2 (m/s^2).
   */
  public static calculate_centripetal_acceleration_from_omega(
    radius: number,
    omega: number
  ): number {
    if (radius < 0) {
      throw new InvalidPhysicsValueError('radius', radius, 'radius must be non-negative');
    }
    return radius * omega * omega;
  }

  /**
   * Calculates Centripetal Acceleration Vector:
   * a_c = -(v^2 / r) * r_hat (points radially inward toward center).
   * @param positionFromCenter Vector r pointing from circle center to object.
   * @param speed Linear speed magnitude v (m/s).
   */
  public static calculate_centripetal_acceleration_vector(
    positionFromCenter: Vector2,
    speed: number
  ): Vector2 {
    const r = positionFromCenter.magnitude();
    if (r <= 0) {
      throw new PhysicsSingularityError('positionFromCenter', 'Center singularity (r=0)');
    }
    const inwardUnit = positionFromCenter.normalize().multiply(-1);
    const acMagnitude = (speed * speed) / r;
    return inwardUnit.multiply(acMagnitude);
  }

  /**
   * Calculates Tangential Velocity Vector:
   * v_t is perpendicular to position vector r pointing in the direction of rotation.
   * For counter-clockwise rotation (omega > 0): v_t = omega * (-y, x).
   */
  public static calculate_tangential_velocity_vector(
    positionFromCenter: Vector2,
    angularVelocity: number
  ): Vector2 {
    const r = positionFromCenter.magnitude();
    if (r <= 0) {
      return Vector2.ZERO;
    }
    // Perpendicular vector (-y, x) represents CCW 90 degree rotation
    const tangentUnit = positionFromCenter.perpendicular().normalize();
    const speed = r * angularVelocity;
    return tangentUnit.multiply(speed);
  }
}
