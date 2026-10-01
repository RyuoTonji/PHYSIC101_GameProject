import { Vector2 } from './Vector2.ts';

export interface AABB {
  min: Vector2;
  max: Vector2;
}

export interface Circle {
  center: Vector2;
  radius: number;
}

export interface CollisionResult {
  hasCollision: boolean;
  penetration: number;
  normal: Vector2; // Contact normal pointing away from obstacle
}

/**
 * 2D Collision detection and continuous trajectory safety.
 */
export class Collision {
  public static testCircleAABB(circle: Circle, box: AABB): CollisionResult {
    // Find closest point on AABB to circle center
    const closestX = Math.max(box.min.x, Math.min(circle.center.x, box.max.x));
    const closestY = Math.max(box.min.y, Math.min(circle.center.y, box.max.y));
    const closestPoint = new Vector2(closestX, closestY);

    const diff = circle.center.subtract(closestPoint);
    const distSq = diff.magnitudeSquared();

    if (distSq > circle.radius * circle.radius) {
      return { hasCollision: false, penetration: 0, normal: Vector2.ZERO };
    }

    const dist = Math.sqrt(distSq);
    if (dist === 0) {
      // Circle center inside box: push out along minimal dimension
      const left = circle.center.x - box.min.x;
      const right = box.max.x - circle.center.x;
      const top = circle.center.y - box.min.y;
      const bottom = box.max.y - circle.center.y;
      const minVal = Math.min(left, right, top, bottom);

      if (minVal === left) return { hasCollision: true, penetration: circle.radius + left, normal: Vector2.LEFT };
      if (minVal === right) return { hasCollision: true, penetration: circle.radius + right, normal: Vector2.RIGHT };
      if (minVal === top) return { hasCollision: true, penetration: circle.radius + top, normal: Vector2.UP };
      return { hasCollision: true, penetration: circle.radius + bottom, normal: Vector2.DOWN };
    }

    const normal = diff.normalize();
    return {
      hasCollision: true,
      penetration: circle.radius - dist,
      normal
    };
  }

  /**
   * Continuous collision detection (CCD) / Swept segment vs Circle to prevent tunneling.
   */
  public static sweptCircleSegment(
    startPos: Vector2,
    endPos: Vector2,
    radius: number,
    obstacleCenter: Vector2,
    obstacleRadius: number
  ): boolean {
    const d = endPos.subtract(startPos);
    const f = startPos.subtract(obstacleCenter);
    const combinedRadius = radius + obstacleRadius;

    const a = d.dot(d);
    const b = 2 * f.dot(d);
    const c = f.dot(f) - combinedRadius * combinedRadius;

    let discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return false;

    discriminant = Math.sqrt(discriminant);
    const t1 = (-b - discriminant) / (2 * a);
    const t2 = (-b + discriminant) / (2 * a);

    return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
  }
}
