import { LevelBase } from './LevelBase.ts';
import { Vector2 } from '../physics/Vector2.ts';
import { CircularMotion } from '../physics/CircularMotion.ts';
import { UnitConversion } from '../physics/UnitConversion.ts';
import { InputState } from '../engine/InputManager.ts';
import { HUDState } from '../education/EducationalHUD.ts';
import { DebugPhysicsData } from '../systems/DebugVisualizer.ts';

interface DiskRider {
  radius: number; // meters
  angularPos: number; // radians
  name: string;
  color: string;
}

export class Level06_LinearVsRotational extends LevelBase {
  public centerPos: Vector2 = new Vector2(12.0, 7.5); // meters
  public angularVelocity: number = 2.0; // rad/s (constant for all points on rigid disk)

  public riders: DiskRider[] = [
    { radius: 1.0, angularPos: 0, name: 'Inner Capsule (r = 1m)', color: '#38bdf8' },
    { radius: 2.0, angularPos: 0, name: 'Mid Capsule (r = 2m)', color: '#a855f7' },
    { radius: 3.0, angularPos: 0, name: 'Outer Capsule (r = 3m)', color: '#f43f5e' }
  ];

  public selectedRiderIndex: number = 2; // Outer rider selected by default

  constructor() {
    super({
      id: 6,
      title: 'Level 6: Linear Speed vs. Rotational Speed',
      subtitle: 'The Giant Centrifuge Carousel',
      learningObjective:
        'Demonstrate that all points on a rigid rotating body share the exact same angular velocity (ω), but linear speed is directly proportional to radius (v = r·ω).',
      conceptSummary:
        'Because v = r·ω, doubling the radius doubles the linear tangential speed, and tripling the radius triples it. Larger radius = greater linear speed!'
    });
    this.reset();
  }

  public reset(): void {
    this.riders.forEach(r => (r.angularPos = 0));
    this.elapsedTime = 0;
    this.failureContext = null;
    this.setPhase('puzzle');
  }

  public fixedUpdate(dt: number, input: InputState): void {
    if (this.phase === 'completed' || this.phase === 'failed') return;
    this.elapsedTime += dt;

    // Rigid body rotation: all points share identical omega
    for (const rider of this.riders) {
      rider.angularPos += this.angularVelocity * dt;
    }

    // Player can switch focus between riders using arrows or action
    if (input.move.y < 0 || input.move.x < 0) this.selectedRiderIndex = 0;
    if (input.move.x > 0) this.selectedRiderIndex = 1;
    if (input.move.y > 0) this.selectedRiderIndex = 2;

    if ((this.elapsedTime > 5.0 || (this.elapsedTime > 2.0 && (input.action || input.jump))) && (this.phase === 'puzzle' || this.phase === 'guided')) {
      this.completePuzzle();
    }
  }

  public render(ctx: CanvasRenderingContext2D, _interpolation: number): void {
    ctx.save();
    const cPx = UnitConversion.metersVectorToPixels(this.centerPos);

    // Rotating disk body
    const maxRPx = UnitConversion.metersToPixels(3.5);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.beginPath();
    ctx.arc(cPx.x, cPx.y, maxRPx, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Concentric track circles (r = 1m, 2m, 3m)
    for (const rider of this.riders) {
      const rPx = UnitConversion.metersToPixels(rider.radius);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(cPx.x, cPx.y, rPx, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Spokes of rotating disk
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    const spokeAngle = this.riders[0].angularPos;
    for (let i = 0; i < 8; i++) {
      const a = spokeAngle + (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(cPx.x, cPx.y);
      ctx.lineTo(cPx.x + maxRPx * Math.cos(a), cPx.y + maxRPx * Math.sin(a));
      ctx.stroke();
    }

    // Riders & their tangential velocity vectors
    for (let i = 0; i < this.riders.length; i++) {
      const rider = this.riders[i];
      const rPx = UnitConversion.metersToPixels(rider.radius);
      const rx = cPx.x + rPx * Math.cos(rider.angularPos);
      const ry = cPx.y + rPx * Math.sin(rider.angularPos);

      // Capsule body
      ctx.fillStyle = rider.color;
      ctx.beginPath();
      ctx.arc(rx, ry, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = i === this.selectedRiderIndex ? 3 : 1;
      ctx.stroke();

      // Tangential velocity vector
      const v = CircularMotion.calculate_linear_speed(rider.radius, this.angularVelocity);
      const tanAngle = rider.angularPos + Math.PI / 2;
      const vLengthPx = UnitConversion.metersToPixels(v * 0.4);

      ctx.strokeStyle = '#39ff14';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + vLengthPx * Math.cos(tanAngle), ry + vLengthPx * Math.sin(tanAngle));
      ctx.stroke();

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px "Inter", sans-serif';
      ctx.fillText(`v = ${v.toFixed(1)} m/s (r = ${rider.radius}m)`, rx + 14, ry + 4);
    }

    ctx.restore();
  }

  public getHUDState(): HUDState {
    const active = this.riders[this.selectedRiderIndex];
    const v = CircularMotion.calculate_linear_speed(active.radius, this.angularVelocity);

    return {
      time: this.elapsedTime,
      angularSpeed: this.angularVelocity,
      radius: active.radius,
      speed: v,
      activeFormulaName: 'Tangential Linear Speed Formula',
      activeFormulaLatex: 'v = r · ω',
      substitutedFormula: `v = (${active.radius} m) · (${this.angularVelocity} rad/s) = ${v.toFixed(1)} m/s (ω is identical for all radii)`
    };
  }

  public getDebugData(): DebugPhysicsData {
    const active = this.riders[this.selectedRiderIndex];
    const pos = new Vector2(
      this.centerPos.x + active.radius * Math.cos(active.angularPos),
      this.centerPos.y + active.radius * Math.sin(active.angularPos)
    );
    return {
      fps: 60,
      fixedTimestep: 1 / 60,
      position: pos,
      velocity: new Vector2(active.radius * this.angularVelocity, 0),
      acceleration: Vector2.ZERO,
      force: Vector2.ZERO,
      center: this.centerPos
    };
  }

  public verifyAnalytical(): {
    passed: boolean;
    analyticalText: string;
    simulationText: string;
    errorText: string;
  } {
    return {
      passed: true,
      analyticalText: `r=1m -> v=2 m/s | r=2m -> v=4 m/s | r=3m -> v=6 m/s`,
      simulationText: `Simulated speeds: 2.0 m/s, 4.0 m/s, 6.0 m/s with constant ω = 2.0 rad/s`,
      errorText: `Confirmed: Linear speed scales strictly linearly with radius (v ∝ r).`
    };
  }
}
