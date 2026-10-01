import { Vector2 } from '../physics/Vector2.ts';
import { UnitConversion } from '../physics/UnitConversion.ts';

export interface DebugPhysicsData {
  fps: number;
  fixedTimestep: number;
  position: Vector2; // meters
  velocity: Vector2; // m/s
  acceleration: Vector2; // m/s^2
  force: Vector2; // N
  mass?: number; // kg
  frictionCoeff?: number;
  normalForce?: number; // N
  tangentialVelocity?: Vector2;
  centripetalAcceleration?: Vector2;
  centripetalForce?: Vector2;
  center?: Vector2; // center for circular motion
  collisionCount?: number;
}

export class DebugVisualizer {
  public static draw(ctx: CanvasRenderingContext2D, data: DebugPhysicsData): void {
    ctx.save();

    // 1. Draw vectors in world space
    const originPx = UnitConversion.metersVectorToPixels(data.position);

    // Velocity vector (Cyan)
    if (data.velocity && data.velocity.magnitudeSquared() > 0.001) {
      this.drawArrow(
        ctx,
        originPx,
        originPx.add(UnitConversion.metersVectorToPixels(data.velocity)),
        '#00f0ff',
        'v'
      );
    }

    // Acceleration vector (Magenta/Amber)
    if (data.acceleration && data.acceleration.magnitudeSquared() > 0.001) {
      this.drawArrow(
        ctx,
        originPx,
        originPx.add(UnitConversion.metersVectorToPixels(data.acceleration).multiply(0.5)),
        '#ff0077',
        'a'
      );
    }

    // Centripetal acceleration (Inward Green/Yellow)
    if (data.centripetalAcceleration && data.centripetalAcceleration.magnitudeSquared() > 0.001) {
      this.drawArrow(
        ctx,
        originPx,
        originPx.add(UnitConversion.metersVectorToPixels(data.centripetalAcceleration).multiply(0.4)),
        '#39ff14',
        'a_c (inward)'
      );
    }

    // Centripetal force vector (Gold)
    if (data.centripetalForce && data.centripetalForce.magnitudeSquared() > 0.001) {
      this.drawArrow(
        ctx,
        originPx,
        originPx.add(UnitConversion.metersVectorToPixels(data.centripetalForce).multiply(0.15)),
        '#ffd700',
        'F_c'
      );
    }

    // Center marker if circular motion
    if (data.center) {
      const centerPx = UnitConversion.metersVectorToPixels(data.center);
      ctx.strokeStyle = '#39ff14';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(originPx.x, originPx.y);
      ctx.lineTo(centerPx.x, centerPx.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Center crosshair
      ctx.beginPath();
      ctx.arc(centerPx.x, centerPx.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#39ff14';
      ctx.fill();
    }

    // 2. HUD Telemetry Overlay (Top Left corner)
    ctx.restore();
    ctx.save();
    ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.fillRect(10, 10, 280, 210);
    ctx.strokeRect(10, 10, 280, 210);

    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('⚡ PHYSICS DEBUG TELEMETRY', 20, 28);

    ctx.fillStyle = '#e2e8f0';
    let y = 46;
    const dy = 15;

    ctx.fillText(`FPS: ${data.fps} | dt: ${(data.fixedTimestep * 1000).toFixed(1)}ms (60Hz)`, 20, y);
    y += dy;
    ctx.fillText(`Pos: (${data.position.x.toFixed(2)}, ${data.position.y.toFixed(2)}) m`, 20, y);
    y += dy;
    ctx.fillText(
      `Vel: (${data.velocity.x.toFixed(2)}, ${data.velocity.y.toFixed(2)}) m/s [${data.velocity.magnitude().toFixed(2)}]`,
      20,
      y
    );
    y += dy;
    ctx.fillText(
      `Accel: (${data.acceleration.x.toFixed(2)}, ${data.acceleration.y.toFixed(2)}) m/s²`,
      20,
      y
    );
    y += dy;

    if (data.centripetalAcceleration) {
      ctx.fillText(
        `Centripetal Accel: ${data.centripetalAcceleration.magnitude().toFixed(2)} m/s²`,
        20,
        y
      );
      y += dy;
    }
    if (data.centripetalForce) {
      ctx.fillText(`Centripetal Force: ${data.centripetalForce.magnitude().toFixed(2)} N`, 20, y);
      y += dy;
    }
    if (data.mass !== undefined) {
      ctx.fillText(`Mass: ${data.mass.toFixed(1)} kg | μ: ${data.frictionCoeff ?? 0}`, 20, y);
      y += dy;
    }
    if (data.collisionCount !== undefined) {
      ctx.fillText(`Active Collisions: ${data.collisionCount}`, 20, y);
      y += dy;
    }

    ctx.restore();
  }

  private static drawArrow(
    ctx: CanvasRenderingContext2D,
    from: Vector2,
    to: Vector2,
    color: string,
    label: string
  ): void {
    const headLength = 10;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    const mag = Math.sqrt(dx * dx + dy * dy);

    if (mag < 2) return;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - headLength * Math.cos(angle - Math.PI / 6),
      to.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      to.x - headLength * Math.cos(angle + Math.PI / 6),
      to.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.font = '10px "JetBrains Mono", sans-serif';
    ctx.fillText(label, to.x + 6, to.y - 4);
  }
}
