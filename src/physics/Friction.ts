import { Vector2 } from './Vector2.ts';
import { InvalidPhysicsValueError } from './PhysicsErrors.ts';

/**
 * Standard Coulomb friction model (static and kinetic).
 */
export class Friction {
  /**
   * Maximum static friction force magnitude: fs_max = mu_s * Fn (Newtons).
   */
  public static calculate_max_static_friction(muStatic: number, normalForce: number): number {
    if (muStatic < 0) {
      throw new InvalidPhysicsValueError('muStatic', muStatic, 'friction coefficient cannot be negative');
    }
    if (normalForce < 0) {
      throw new InvalidPhysicsValueError('normalForce', normalForce, 'normal force magnitude cannot be negative');
    }
    return muStatic * normalForce;
  }

  /**
   * Kinetic friction force magnitude: fk = mu_k * Fn (Newtons).
   */
  public static calculate_kinetic_friction(muKinetic: number, normalForce: number): number {
    if (muKinetic < 0) {
      throw new InvalidPhysicsValueError('muKinetic', muKinetic, 'friction coefficient cannot be negative');
    }
    if (normalForce < 0) {
      throw new InvalidPhysicsValueError('normalForce', normalForce, 'normal force magnitude cannot be negative');
    }
    return muKinetic * normalForce;
  }

  /**
   * Kinetic friction vector opposes relative velocity: F_k = -mu_k * Fn * (v / ||v||).
   */
  public static calculate_kinetic_friction_vector(
    muKinetic: number,
    normalForce: number,
    velocity: Vector2
  ): Vector2 {
    const speed = velocity.magnitude();
    if (speed === 0) {
      return Vector2.ZERO;
    }
    const fkMag = this.calculate_kinetic_friction(muKinetic, normalForce);
    return velocity.normalize().multiply(-fkMag);
  }
}
