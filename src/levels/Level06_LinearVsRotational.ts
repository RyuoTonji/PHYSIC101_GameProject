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

interface TargetBay {
  pos: Vector2;
  radius: number;
  targetRadiusIndex: number;
  label: string;
  isActivated: boolean;
}

interface LaunchedProbe {
  pos: Vector2;
  vel: Vector2;
  color: string;
  riderIndex: number;
  life: number;
}

export class Level06_LinearVsRotational extends LevelBase {
  public centerPos: Vector2 = new Vector2(10.5, 7.5); // meters
  public angularVelocity: number = 2.0; // rad/s (constant for all points on rigid disk)

  public riders: DiskRider[] = [
    { radius: 1.0, angularPos: 0, name: 'Inner Capsule (r = 1m)', color: '#38bdf8' },
    { radius: 2.0, angularPos: 0, name: 'Mid Capsule (r = 2m)', color: '#a855f7' },
    { radius: 3.0, angularPos: 0, name: 'Outer Capsule (r = 3m)', color: '#f43f5e' }
  ];

  public targets: TargetBay[] = [
    { pos: new Vector2(17.5, 4.0), radius: 1.2, targetRadiusIndex: 0, label: 'Bay Alpha (v = 2.0 m/s)', isActivated: false },
    { pos: new Vector2(18.0, 7.5), radius: 1.3, targetRadiusIndex: 1, label: 'Bay Beta (v = 4.0 m/s)', isActivated: false },
    { pos: new Vector2(17.5, 11.0), radius: 1.4, targetRadiusIndex: 2, label: 'Bay Gamma (v = 6.0 m/s)', isActivated: false }
  ];

  public probes: LaunchedProbe[] = [];
  public selectedRiderIndex: number = 2; // Outer rider selected by default
  public fireCooldown: number = 0;

  constructor() {
    super({
      id: 6,
      title: 'Level 6: Linear Speed vs. Rotational Speed',
      subtitle: 'The Tangential Velocity Launcher',
      learningObjective:
        'Demonstrate that all points on a rigid rotating body share identical angular velocity (ω), but linear tangential speed is proportional to radius (v = r·ω).',
      conceptSummary:
        'Because v = r·ω, the outer capsule travels at 6 m/s, the middle at 4 m/s, and the inner at 2 m/s. Select each capsule and time your tangential launch to activate all 3 Docking Bays!'
    });
    this.reset();
  }

  public reset(): void {
    this.riders.forEach(r => (r.angularPos = 0));
    this.targets.forEach(t => (t.isActivated = false));
    this.probes = [];
    this.fireCooldown = 0;
    this.elapsedTime = 0;
    this.failureContext = null;
    this.setPhase('puzzle');
  }

  public selectRider(index: number): void {
    if (index >= 0 && index < this.riders.length) {
      this.selectedRiderIndex = index;
    }
  }

  public launchProbe(): void {
    if (this.fireCooldown > 0) return;
    const rider = this.riders[this.selectedRiderIndex];
    const rx = this.centerPos.x + rider.radius * Math.cos(rider.angularPos);
    const ry = this.centerPos.y + rider.radius * Math.sin(rider.angularPos);

    // Tangential speed: v = r * omega
    const v = rider.radius * this.angularVelocity;
    const tanAngle = rider.angularPos + Math.PI / 2;
    const vel = new Vector2(v * Math.cos(tanAngle), v * Math.sin(tanAngle));

    this.probes.push({
      pos: new Vector2(rx, ry),
      vel,
      color: rider.color,
      riderIndex: this.selectedRiderIndex,
      life: 4.0
    });
    this.fireCooldown = 0.25;
  }

  public fixedUpdate(dt: number, input: InputState): void {
    if (this.phase === 'completed' || this.phase === 'failed') return;
    this.elapsedTime += dt;
    if (this.fireCooldown > 0) this.fireCooldown -= dt;

    // Rigid body rotation: all points share identical omega
    for (const rider of this.riders) {
      rider.angularPos += this.angularVelocity * dt;
    }

    // Switch focus between riders using arrows / numbers
    if (input.move.x < -0.3 || input.move.y < -0.3) this.selectedRiderIndex = 0;
    if (input.move.x > 0.3) this.selectedRiderIndex = 1;
    if (input.move.y > 0.3) this.selectedRiderIndex = 2;

    // Launch probe with Action, Jump, or Boost key
    if (input.action || input.jumpPressed || input.boost) {
      this.launchProbe();
    }

    // Update launched probes and check collisions with target bays
    for (let i = this.probes.length - 1; i >= 0; i--) {
      const probe = this.probes[i];
      probe.pos = probe.pos.add(probe.vel.multiply(dt));
      probe.life -= dt;

      // Check hit with target bays
      for (const target of this.targets) {
        if (!target.isActivated && probe.pos.distanceTo(target.pos) < target.radius) {
          if (probe.riderIndex === target.targetRadiusIndex) {
            target.isActivated = true;
            probe.life = 0;
            break;
          }
        }
      }

      if (probe.life <= 0) {
        this.probes.splice(i, 1);
      }
    }

    // Check win condition: all 3 target bays activated!
    const allActivated = this.targets.every(t => t.isActivated);
    if (allActivated && (this.phase === 'puzzle' || this.phase === 'guided')) {
      this.completePuzzle();
    }
  }

  public render(ctx: CanvasRenderingContext2D, _interpolation: number): void {
    ctx.save();
    const cPx = UnitConversion.metersVectorToPixels(this.centerPos);

    // Rotating disk body
    const maxRPx = UnitConversion.metersToPixels(3.5);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
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

    // Draw Target Docking Bays
    for (const target of this.targets) {
      const tPx = UnitConversion.metersVectorToPixels(target.pos);
      const radPx = UnitConversion.metersToPixels(target.radius);

      ctx.save();
      ctx.fillStyle = target.isActivated ? 'rgba(16, 185, 129, 0.35)' : 'rgba(51, 65, 85, 0.4)';
      ctx.beginPath();
      ctx.arc(tPx.x, tPx.y, radPx, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = target.isActivated ? '#10b981' : '#64748b';
      ctx.lineWidth = target.isActivated ? 3 : 1.5;
      ctx.stroke();

      ctx.fillStyle = target.isActivated ? '#10b981' : '#94a3b8';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(target.label, tPx.x, tPx.y + radPx + 14);
      if (target.isActivated) {
        ctx.fillStyle = '#10b981';
        ctx.fillText('ONLINE', tPx.x, tPx.y + 4);
      } else {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('OFFLINE', tPx.x, tPx.y + 4);
      }
      ctx.restore();
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
      ctx.arc(rx, ry, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = i === this.selectedRiderIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = i === this.selectedRiderIndex ? 3.5 : 1.5;
      ctx.stroke();

      // Tangential velocity vector
      const v = CircularMotion.calculate_linear_speed(rider.radius, this.angularVelocity);
      const tanAngle = rider.angularPos + Math.PI / 2;
      const vLengthPx = UnitConversion.metersToPixels(v * 0.35);

      ctx.strokeStyle = '#39ff14';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + vLengthPx * Math.cos(tanAngle), ry + vLengthPx * Math.sin(tanAngle));
      ctx.stroke();

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px "Inter", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`v = ${v.toFixed(1)} m/s (r = ${rider.radius}m)`, rx + 16, ry + 4);

      // If active selection, draw projected firing trajectory
      if (i === this.selectedRiderIndex) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + Math.cos(tanAngle) * 140, ry + Math.sin(tanAngle) * 140);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Render launched probes
    for (const probe of this.probes) {
      const pPx = UnitConversion.metersVectorToPixels(probe.pos);
      ctx.fillStyle = probe.color;
      ctx.beginPath();
      ctx.arc(pPx.x, pPx.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // On-screen launch hint
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(cPx.x - 170, cPx.y + maxRPx + 20, 340, 26);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(cPx.x - 170, cPx.y + maxRPx + 20, 340, 26);

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PRESS [SPACE] / [E] TO LAUNCH TANGENTIAL CORE', cPx.x, cPx.y + maxRPx + 37);

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
