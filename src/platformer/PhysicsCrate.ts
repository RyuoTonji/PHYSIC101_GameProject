import { Vector2 } from '../physics/Vector2.ts';
import { SolidBox, RampSlope, WorldGeometry } from './WorldGeometry.ts';
import { MovingPlatform } from './MovingPlatform.ts';

export class PhysicsCrate {
  public id: string;
  public pos: Vector2;
  public vel: Vector2 = Vector2.ZERO;
  public size: Vector2 = new Vector2(0.9, 0.9); // meters
  public mass: number = 20.0; // kg
  public isCarried: boolean = false;
  public isGrounded: boolean = false;
  public frictionCoeff: number = 0.35;
  public restitution: number = 0.2; // slight bounciness

  public spawnPos: Vector2;

  constructor(id: string, x: number, y: number, mass: number = 20.0) {
    this.id = id;
    this.pos = new Vector2(x, y);
    this.spawnPos = new Vector2(x, y);
    this.mass = mass;
  }

  public update(
    dt: number,
    gravity: number,
    solids: SolidBox[],
    ramps: RampSlope[],
    platforms: MovingPlatform[]
  ): void {
    if (this.isCarried) {
      this.vel = Vector2.ZERO;
      return;
    }

    // Auto-respawn if fallen below world boundary
    if (this.pos.y > 22.0) {
      this.pos = new Vector2(this.spawnPos.x, this.spawnPos.y);
      this.vel = Vector2.ZERO;
      return;
    }

    // Apply gravity
    this.vel.y += gravity * dt;

    // Check if on moving platform
    for (const plat of platforms) {
      if (plat.isEntityOnTop(this.pos, this.size)) {
        this.pos.x += plat.velocity.x * dt;
        this.pos.y = plat.pos.y - this.size.y;
        this.vel.y = 0;
        this.isGrounded = true;
      }
    }

    // Solve solid collisions
    const result = WorldGeometry.resolveBoxCollision(
      this.pos,
      this.size,
      this.vel,
      solids,
      dt
    );

    this.pos = result.pos;
    this.vel = result.vel;
    if (result.onGround) {
      this.isGrounded = true;
      // Apply kinetic friction on horizontal movement
      const frictionDecel = this.frictionCoeff * gravity * dt;
      if (Math.abs(this.vel.x) <= frictionDecel) {
        this.vel.x = 0;
      } else {
        this.vel.x -= Math.sign(this.vel.x) * frictionDecel;
      }
    } else {
      this.isGrounded = false;
      // Air drag
      this.vel.x *= Math.pow(0.98, dt * 60);
    }

    // Ramp collision & sliding
    const rampResult = WorldGeometry.resolveRampCollision(
      this.pos,
      this.size,
      this.vel,
      ramps
    );
    if (rampResult.onRamp) {
      this.pos = rampResult.pos;
      this.isGrounded = true;
      // Natural slide acceleration down the ramp: g * (sin theta - mu * cos theta)
      const theta = rampResult.slopeAngle;
      const slideAccel = gravity * (Math.sin(theta) - Math.sign(Math.sin(theta)) * this.frictionCoeff * Math.cos(theta));
      this.vel.x += slideAccel * Math.cos(theta) * dt;
      this.vel.y = 0;
    }
  }

  public applyImpulse(impulse: Vector2): void {
    if (this.isCarried) return;
    this.vel = this.vel.add(impulse.multiply(1 / this.mass));
  }
}
