import { Vector2 } from './Vector2.ts';
import { CircularMotion } from './CircularMotion.ts';
import { InvalidPhysicsValueError, PhysicsSingularityError } from './PhysicsErrors.ts';

/**
 * Force dynamics and Newton's Second Law calculations.
 */
export class Forces {
  /**
   * Calculates Centripetal Force Magnitude: Fc = m * v^2 / r (Newtons).
   * @param mass Mass in kilograms (m > 0).
   * @param speed Tangential speed in m/s.
   * @param radius Orbital radius in meters (r > 0).
   */
  public static calculate_centripetal_force(
    mass: number,
    speed: number,
    radius: number
  ): number {
    if (mass <= 0) {
      throw new InvalidPhysicsValueError('mass', mass, 'mass must be strictly positive');
    }
    if (radius <= 0) {
      throw new PhysicsSingularityError('radius', 'Centripetal force is undefined for radius r <= 0');
    }
    const ac = CircularMotion.calculate_centripetal_acceleration(speed, radius);
    return mass * ac;
  }

  /**
   * Calculates Centripetal Force Magnitude from angular speed: Fc = m * r * omega^2 (Newtons).
   */
  public static calculate_centripetal_force_from_omega(
    mass: number,
    radius: number,
    omega: number
  ): number {
    if (mass <= 0) {
      throw new InvalidPhysicsValueError('mass', mass, 'mass must be strictly positive');
    }
    if (radius < 0) {
      throw new InvalidPhysicsValueError('radius', radius, 'radius must be non-negative');
    }
    return mass * radius * omega * omega;
  }

  /**
   * Calculates Centripetal Force Vector:
   * F_c = m * a_c = - (m * v^2 / r) * r_hat (inward toward center).
   */
  public static calculate_centripetal_force_vector(
    mass: number,
    positionFromCenter: Vector2,
    speed: number
  ): Vector2 {
    if (mass <= 0) {
      throw new InvalidPhysicsValueError('mass', mass, 'mass must be strictly positive');
    }
    const acVector = CircularMotion.calculate_centripetal_acceleration_vector(
      positionFromCenter,
      speed
    );
    return acVector.multiply(mass);
  }

  /**
   * Newton's Second Law: F_net = m * a
   */
  public static calculate_net_force(mass: number, acceleration: Vector2): Vector2 {
    if (mass <= 0) {
      throw new InvalidPhysicsValueError('mass', mass, 'mass must be strictly positive');
    }
    return acceleration.multiply(mass);
  }
}
