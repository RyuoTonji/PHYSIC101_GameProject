import { Vector2 } from '../physics/Vector2.ts';
import { SolidBox, RampSlope, WorldGeometry } from './WorldGeometry.ts';
import { MovingPlatform } from './MovingPlatform.ts';
import { PhysicsCrate } from './PhysicsCrate.ts';

export interface AxelState {
  pos: Vector2;
  vel: Vector2;
  facing: 1 | -1;
  isGrounded: boolean;
  isSprinting: boolean;
  isCarrying: boolean;
  carriedCrate: PhysicsCrate | null;
  hearts: number;
  maxHearts: number;
  lastCheckpoint: Vector2;
}

export class Axel {
  public pos: Vector2;
  public vel: Vector2 = Vector2.ZERO;
  public size: Vector2 = new Vector2(0.8, 1.4); // width 0.8m, height 1.4m (~26px x 45px)
  public mass: number = 30.0; // kg

  public facing: 1 | -1 = 1;
  public isGrounded: boolean = false;
  public isSprinting: boolean = false;
  public onMovingPlatform: MovingPlatform | null = null;

  // Jump tuning
  public jumpStrength: number = -12.5; // m/s (~3.0m comfortable athletic jump)
  public gravity: number = 26.0; // m/s^2 snappy athletic gravity
  public coyoteTimer: number = 0;
  public jumpBufferTimer: number = 0;
  private readonly COYOTE_TIME: number = 0.15;
  private readonly JUMP_BUFFER: number = 0.15;

  // Run tuning
  public walkSpeed: number = 6.4; // m/s
  public runSpeed: number = 9.4; // m/s
  public groundAccel: number = 52.0; // m/s^2
  public groundDecel: number = 42.0; // m/s^2
  public airAccel: number = 28.0; // m/s^2

  // Carrying & Interaction
  public carriedCrate: PhysicsCrate | null = null;
  public canInteract: boolean = false;
  public interactionTargetName: string = '';
  public interactCooldown: number = 0;

  // Health & Respawn
  public hearts: number = 3;
  public maxHearts: number = 3;
  public lastCheckpoint: Vector2;
  public respawnTimer: number = 0;

  // Visual & Animation state
  public animTime: number = 0;
  public isLandingSquish: number = 0;
  public particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string }> = [];

  constructor(x: number, y: number) {
    this.pos = new Vector2(x, y);
    this.lastCheckpoint = new Vector2(x, y);
  }

  public update(
    dt: number,
    input: {
      left: boolean;
      right: boolean;
      down?: boolean;
      jumpPressed: boolean;
      jumpHeld: boolean;
      sprint: boolean;
      interactPressed: boolean;
    },
    solids: SolidBox[],
    ramps: RampSlope[],
    platforms: MovingPlatform[],
    crates: PhysicsCrate[]
  ): { jumped: boolean; landed: boolean; threwCrate: boolean; placedCrate: boolean; pickedUpCrate: boolean } {
    const events = {
      jumped: false,
      landed: false,
      threwCrate: false,
      placedCrate: false,
      pickedUpCrate: false
    };

    this.animTime += dt;
    this.interactCooldown = Math.max(0, this.interactCooldown - dt);
    if (this.isLandingSquish > 0) this.isLandingSquish -= dt * 6;

    // Update particle lifetimes
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 1. Moving Platform tracking
    let currentPlatform: MovingPlatform | null = null;
    for (const plat of platforms) {
      if (plat.isEntityOnTop(this.pos, this.size)) {
        currentPlatform = plat;
        break;
      }
    }

    if (currentPlatform) {
      this.pos.x += currentPlatform.velocity.x * dt;
      this.pos.y = currentPlatform.pos.y - this.size.y;
      this.vel.y = 0;
      this.isGrounded = true;
      this.onMovingPlatform = currentPlatform;
    } else {
      this.onMovingPlatform = null;
    }

    // 2. Horizontal Movement
    this.isSprinting = input.sprint;
    const targetSpeed = this.isSprinting ? this.runSpeed : this.walkSpeed;
    let moveDir = 0;
    if (input.left) moveDir -= 1;
    if (input.right) moveDir += 1;

    if (moveDir !== 0) {
      this.facing = moveDir > 0 ? 1 : -1;
      const targetVx = moveDir * targetSpeed;
      const accel = this.isGrounded ? this.groundAccel : this.airAccel;
      const diff = targetVx - this.vel.x;
      this.vel.x += Math.sign(diff) * Math.min(Math.abs(diff), accel * dt);
    } else {
      // Decelerate
      if (this.isGrounded) {
        const decel = this.groundDecel * dt;
        if (Math.abs(this.vel.x) <= decel) {
          this.vel.x = 0;
        } else {
          this.vel.x -= Math.sign(this.vel.x) * decel;
        }
      } else {
        // Light air drag
        this.vel.x *= Math.pow(0.96, dt * 60);
      }
    }

    // 3. Gravity & Jumping (with Coyote Time & Jump Buffering)
    if (this.isGrounded) {
      this.coyoteTimer = this.COYOTE_TIME;
    } else {
      this.coyoteTimer -= dt;
    }

    if (input.jumpPressed) {
      this.jumpBufferTimer = this.JUMP_BUFFER;
    } else {
      this.jumpBufferTimer -= dt;
    }

    // Execute jump if buffer and coyote are active
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      this.vel.y = this.jumpStrength;
      // Inherit moving platform momentum!
      if (this.onMovingPlatform) {
        this.vel.x += this.onMovingPlatform.velocity.x * 0.8;
      }
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.isGrounded = false;
      events.jumped = true;
      this.spawnJumpDust();
    }

    // Variable jump height: cut jump velocity if player releases button early while moving upward
    if (!input.jumpHeld && this.vel.y < -3.0) {
      this.vel.y *= 0.55;
    }

    // Apply gravity
    this.vel.y += this.gravity * dt;

    // Clamp terminal falling velocity
    if (this.vel.y > 22.0) this.vel.y = 22.0;

    // 4. Resolve Solid Collisions
    const wasGrounded = this.isGrounded;
    const colResult = WorldGeometry.resolveBoxCollision(
      this.pos,
      this.size,
      this.vel,
      solids,
      dt
    );
    this.pos = colResult.pos;
    this.vel = colResult.vel;

    if (colResult.onGround) {
      this.isGrounded = true;
      if (!wasGrounded) {
        events.landed = true;
        this.isLandingSquish = 1.0;
        this.spawnLandingDust();
      }
    } else if (!currentPlatform) {
      this.isGrounded = false;
    }

    // 5. Resolve Ramp / Slope Collisions & Momentum
    const rampResult = WorldGeometry.resolveRampCollision(
      this.pos,
      this.size,
      this.vel,
      ramps
    );
    if (rampResult.onRamp) {
      this.pos = rampResult.pos;
      this.isGrounded = true;
      // Sliding down a ramp adds kinetic boost!
      const theta = rampResult.slopeAngle;
      const slopeForce = this.gravity * Math.sin(theta);
      this.vel.x += slopeForce * Math.cos(theta) * dt;
    }

    // 6. Push & Crate Interactions
    for (const crate of crates) {
      if (crate === this.carriedCrate) continue;

      // Check horizontal contact for pushing
      const isOverlappingY =
        this.pos.y + this.size.y > crate.pos.y + 0.1 &&
        this.pos.y < crate.pos.y + crate.size.y - 0.1;

      if (isOverlappingY) {
        // Pushing right
        if (
          this.pos.x + this.size.x >= crate.pos.x &&
          this.pos.x < crate.pos.x &&
          this.vel.x > 0
        ) {
          crate.pos.x = this.pos.x + this.size.x;
          crate.vel.x = this.vel.x * (this.mass / (this.mass + crate.mass));
          this.vel.x *= 0.85; // resistance from pushing
        }
        // Pushing left
        else if (
          this.pos.x <= crate.pos.x + crate.size.x &&
          this.pos.x + this.size.x > crate.pos.x + crate.size.x &&
          this.vel.x < 0
        ) {
          crate.pos.x = this.pos.x - crate.size.x;
          crate.vel.x = this.vel.x * (this.mass / (this.mass + crate.mass));
          this.vel.x *= 0.85;
        }
      }
    }

    // 7. Carry / Drop / Throw Crates with E key (Debounced to prevent oscillation glitch)
    if (input.interactPressed && this.interactCooldown <= 0) {
      if (this.carriedCrate) {
        const wantsThrow = Boolean(input.sprint || input.jumpHeld || (input.right && this.facing > 0) || (input.left && this.facing < 0));
        const wantsPlace = Boolean(input.down) || !wantsThrow;

        this.carriedCrate.isCarried = false;
        this.interactCooldown = 0.12;
        if (wantsPlace) {
          // Gently PLACE crate down onto the floor/platform right at Axel's feet with zero velocity
          const placeX = this.pos.x + (this.facing > 0 ? this.size.x + 0.15 : -this.carriedCrate.size.x - 0.15);
          const placeY = this.pos.y + this.size.y - this.carriedCrate.size.y;
          this.carriedCrate.pos = new Vector2(placeX, placeY);
          this.carriedCrate.vel = new Vector2(this.facing * 0.4, 0);
          this.carriedCrate.isGrounded = this.isGrounded;
          this.carriedCrate = null;
          events.placedCrate = true;
          events.threwCrate = false;
        } else {
          // Throw carried crate with forward/upward impulse arc
          const throwDirection = new Vector2(this.facing, input.jumpHeld ? -0.7 : -0.2).normalize();
          const throwImpulse = throwDirection.multiply(8.5).add(this.vel.multiply(0.5));

          this.carriedCrate.pos = new Vector2(
            this.pos.x + (this.facing > 0 ? this.size.x + 0.2 : -this.carriedCrate.size.x - 0.2),
            this.pos.y - 0.2
          );
          this.carriedCrate.vel = throwImpulse;
          this.carriedCrate = null;
          events.threwCrate = true;
        }
      } else {
        // Pick up nearby crate
        const pickupReach = 1.6;
        for (const crate of crates) {
          if (!crate.isCarried && this.pos.distanceTo(crate.pos) < pickupReach) {
            this.carriedCrate = crate;
            crate.isCarried = true;
            this.interactCooldown = 0.12;
            events.pickedUpCrate = true;
            break;
          }
        }
      }
    }

    // Keep carried crate positioned above Axel's head
    if (this.carriedCrate) {
      this.carriedCrate.pos.x = this.pos.x + (this.size.x - this.carriedCrate.size.x) * 0.5;
      this.carriedCrate.pos.y = this.pos.y - this.carriedCrate.size.y - 0.1;
      this.carriedCrate.vel = new Vector2(this.vel.x, this.vel.y);
    }

    return events;
  }

  public takeDamage(): boolean {
    this.hearts = Math.max(0, this.hearts - 1);
    this.respawnAtCheckpoint();
    return this.hearts <= 0;
  }

  public resetHealth(): void {
    this.hearts = this.maxHearts;
  }

  public respawnAtCheckpoint(): void {
    this.pos = new Vector2(this.lastCheckpoint.x, this.lastCheckpoint.y);
    this.vel = Vector2.ZERO;
    if (this.carriedCrate) {
      this.carriedCrate.isCarried = false;
      this.carriedCrate = null;
    }
    // Spawn respawn quantum burst
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x: this.pos.x + this.size.x * 0.5,
        y: this.pos.y + this.size.y * 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.6,
        maxLife: 0.6,
        color: '#00f0ff'
      });
    }
  }

  private spawnJumpDust(): void {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: this.pos.x + this.size.x * 0.5 + (Math.random() - 0.5) * 0.4,
        y: this.pos.y + this.size.y,
        vx: (Math.random() - 0.5) * 3,
        vy: -0.5 - Math.random() * 1.5,
        life: 0.35,
        maxLife: 0.35,
        color: 'rgba(255, 255, 255, 0.4)'
      });
    }
  }

  private spawnLandingDust(): void {
    for (let i = 0; i < 8; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      this.particles.push({
        x: this.pos.x + this.size.x * 0.5,
        y: this.pos.y + this.size.y,
        vx: dir * (1.5 + Math.random() * 3),
        vy: -0.3 - Math.random() * 1.2,
        life: 0.4,
        maxLife: 0.4,
        color: 'rgba(168, 85, 247, 0.5)'
      });
    }
  }
}
