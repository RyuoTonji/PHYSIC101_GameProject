import { Vector2 } from '../physics/Vector2.ts';

export class Camera {
  public position: Vector2 = Vector2.ZERO; // Center of camera in world coords (meters)
  public viewportWidth: number = 960;
  public viewportHeight: number = 600;
  public pixelsPerMeter: number = 32; // 32 pixels = 1 meter

  public minBounds: Vector2 = new Vector2(0, 0);
  public maxBounds: Vector2 = new Vector2(60, 25);

  public lookaheadOffset: Vector2 = Vector2.ZERO;
  private shakeTimer: number = 0;
  private shakeMagnitude: number = 0;

  constructor(viewportWidth: number, viewportHeight: number, pixelsPerMeter: number = 32) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.pixelsPerMeter = pixelsPerMeter;
  }

  public update(targetPos: Vector2, targetVel: Vector2, dt: number): void {
    // Lookahead based on horizontal velocity
    const targetLookaheadX = Math.max(-3, Math.min(3, targetVel.x * 0.35));
    this.lookaheadOffset.x += (targetLookaheadX - this.lookaheadOffset.x) * 3.0 * dt;

    // Smooth lerp follow
    const desiredX = targetPos.x + this.lookaheadOffset.x;
    const desiredY = targetPos.y - 0.5; // slight upward framing for jump visibility

    const lerpFactor = 1.0 - Math.exp(-6.0 * dt);
    this.position.x += (desiredX - this.position.x) * lerpFactor;
    this.position.y += (desiredY - this.position.y) * lerpFactor;

    // Clamp within world bounds
    const halfViewW = (this.viewportWidth / this.pixelsPerMeter) / 2;
    const halfViewH = (this.viewportHeight / this.pixelsPerMeter) / 2;

    const minX = this.minBounds.x + halfViewW;
    const maxX = Math.max(minX, this.maxBounds.x - halfViewW);
    const minY = this.minBounds.y + halfViewH;
    const maxY = Math.max(minY, this.maxBounds.y - halfViewH);

    this.position.x = Math.max(minX, Math.min(maxX, this.position.x));
    this.position.y = Math.max(minY, Math.min(maxY, this.position.y));

    // Handle screen shake
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
    }
  }

  public triggerShake(magnitude: number = 0.2, duration: number = 0.2): void {
    this.shakeMagnitude = magnitude;
    this.shakeTimer = duration;
  }

  public worldToScreen(worldPos: Vector2): Vector2 {
    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeTimer > 0) {
      shakeX = (Math.random() - 0.5) * 2 * this.shakeMagnitude * this.pixelsPerMeter;
      shakeY = (Math.random() - 0.5) * 2 * this.shakeMagnitude * this.pixelsPerMeter;
    }

    const screenX = (worldPos.x - this.position.x) * this.pixelsPerMeter + this.viewportWidth / 2 + shakeX;
    const screenY = (worldPos.y - this.position.y) * this.pixelsPerMeter + this.viewportHeight / 2 + shakeY;
    return new Vector2(screenX, screenY);
  }

  public screenToWorld(screenPos: Vector2): Vector2 {
    const worldX = (screenPos.x - this.viewportWidth / 2) / this.pixelsPerMeter + this.position.x;
    const worldY = (screenPos.y - this.viewportHeight / 2) / this.pixelsPerMeter + this.position.y;
    return new Vector2(worldX, worldY);
  }
}
