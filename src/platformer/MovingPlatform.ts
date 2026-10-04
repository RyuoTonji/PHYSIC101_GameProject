import { Vector2 } from '../physics/Vector2.ts';

export class MovingPlatform {
  public pos: Vector2;
  public size: Vector2;
  public startPos: Vector2;
  public endPos: Vector2;
  public speed: number; // m/s
  public progress: number = 0; // 0 to 1
  public direction: number = 1; // 1 or -1
  public pauseTimer: number = 0;
  public pauseDuration: number = 0.6; // s
  public velocity: Vector2 = Vector2.ZERO;

  constructor(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    w: number = 3.0,
    h: number = 0.6,
    speed: number = 2.5
  ) {
    this.startPos = new Vector2(x1, y1);
    this.endPos = new Vector2(x2, y2);
    this.pos = new Vector2(x1, y1);
    this.size = new Vector2(w, h);
    this.speed = speed;
  }

  public update(dt: number): void {
    if (this.pauseTimer > 0) {
      this.pauseTimer -= dt;
      this.velocity = Vector2.ZERO;
      return;
    }

    const totalDist = this.startPos.distanceTo(this.endPos);
    if (totalDist < 0.001) {
      this.velocity = Vector2.ZERO;
      return;
    }

    const step = (this.speed * dt) / totalDist;
    this.progress += step * this.direction;

    if (this.progress >= 1.0) {
      this.progress = 1.0;
      this.direction = -1;
      this.pauseTimer = this.pauseDuration;
    } else if (this.progress <= 0.0) {
      this.progress = 0.0;
      this.direction = 1;
      this.pauseTimer = this.pauseDuration;
    }

    // Smooth sinusoidal ease
    const smoothT = (1 - Math.cos(this.progress * Math.PI)) / 2;
    const oldPos = new Vector2(this.pos.x, this.pos.y);
    this.pos = this.startPos.multiply(1 - smoothT).add(this.endPos.multiply(smoothT));

    this.velocity = this.pos.subtract(oldPos).multiply(1 / Math.max(0.0001, dt));
  }

  /**
   * Checks if an entity foot is resting on the platform.
   */
  public isEntityOnTop(entityPos: Vector2, entitySize: Vector2): boolean {
    const footX = entityPos.x + entitySize.x * 0.5;
    const footY = entityPos.y + entitySize.y;

    const onX = footX >= this.pos.x && footX <= this.pos.x + this.size.x;
    const onY = footY >= this.pos.y - 0.15 && footY <= this.pos.y + 0.35;
    return onX && onY;
  }
}
