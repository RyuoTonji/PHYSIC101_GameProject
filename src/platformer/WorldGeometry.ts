import { Vector2 } from '../physics/Vector2.ts';

export interface SolidBox {
  x: number; // meters (left)
  y: number; // meters (top)
  w: number; // meters (width)
  h: number; // meters (height)
  type?: 'ground' | 'metal' | 'wall' | 'bridge';
  friction?: number; // coefficient of friction
}

export interface RampSlope {
  x1: number; // left x
  y1: number; // left y
  x2: number; // right x
  y2: number; // right y
  friction?: number;
}

export interface CollisionResult {
  collided: boolean;
  normal: Vector2;
  penetration: number;
}

export class WorldGeometry {
  public static checkAABB(
    box1: { x: number; y: number; w: number; h: number },
    box2: { x: number; y: number; w: number; h: number }
  ): boolean {
    return (
      box1.x < box2.x + box2.w &&
      box1.x + box1.w > box2.x &&
      box1.y < box2.y + box2.h &&
      box1.y + box1.h > box2.y
    );
  }

  /**
   * Resolves collision of a moving bounding box with solid boxes.
   * Returns corrected position and contact flags.
   */
  public static resolveBoxCollision(
    pos: Vector2,
    size: Vector2,
    vel: Vector2,
    solids: SolidBox[],
    dt: number
  ): { pos: Vector2; vel: Vector2; onGround: boolean; onCeiling: boolean; onWall: boolean } {
    let newX = pos.x + vel.x * dt;
    let newY = pos.y + vel.y * dt;
    let onGround = false;
    let onCeiling = false;
    let onWall = false;

    // Horizontal pass
    const boxX = { x: newX, y: pos.y, w: size.x, h: size.y };
    for (const solid of solids) {
      if (this.checkAABB(boxX, solid)) {
        if (vel.x > 0) {
          // moving right into solid
          newX = solid.x - size.x;
          vel.x = 0;
          onWall = true;
        } else if (vel.x < 0) {
          // moving left into solid
          newX = solid.x + solid.w;
          vel.x = 0;
          onWall = true;
        }
        boxX.x = newX;
      }
    }

    // Vertical pass
    const boxY = { x: newX, y: newY, w: size.x, h: size.y };
    for (const solid of solids) {
      if (this.checkAABB(boxY, solid)) {
        if (vel.y > 0) {
          // falling onto ground
          newY = solid.y - size.y;
          vel.y = 0;
          onGround = true;
        } else if (vel.y < 0) {
          // hitting ceiling
          newY = solid.y + solid.h;
          vel.y = 0;
          onCeiling = true;
        }
        boxY.y = newY;
      }
    }

    return {
      pos: new Vector2(newX, newY),
      vel,
      onGround,
      onCeiling,
      onWall
    };
  }

  /**
   * Resolves collision with sloped ramps.
   */
  public static resolveRampCollision(
    pos: Vector2,
    size: Vector2,
    vel: Vector2,
    ramps: RampSlope[]
  ): { pos: Vector2; vel: Vector2; onRamp: boolean; slopeAngle: number } {
    let onRamp = false;
    let slopeAngle = 0;

    const footX = pos.x + size.x * 0.5;
    const footY = pos.y + size.y;

    for (const ramp of ramps) {
      const minX = Math.min(ramp.x1, ramp.x2);
      const maxX = Math.max(ramp.x1, ramp.x2);

      if (footX >= minX && footX <= maxX) {
        // Calculate Y on the ramp surface at footX
        const t = (footX - ramp.x1) / (ramp.x2 - ramp.x1);
        const surfaceY = ramp.y1 + t * (ramp.y2 - ramp.y1);

        // If foot is penetrating or close to surface while moving downward/horizontal
        if (footY >= surfaceY - 0.25 && footY <= surfaceY + 0.6 && vel.y >= -1.0) {
          pos.y = surfaceY - size.y;
          vel.y = 0;
          onRamp = true;
          slopeAngle = Math.atan2(ramp.y2 - ramp.y1, ramp.x2 - ramp.x1);
          break;
        }
      }
    }

    return { pos, vel, onRamp, slopeAngle };
  }
}
