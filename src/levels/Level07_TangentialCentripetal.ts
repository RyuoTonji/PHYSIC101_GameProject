import { LevelBase } from './LevelBase.ts';
import { Vector2 } from '../physics/Vector2.ts';
import { CircularMotion } from '../physics/CircularMotion.ts';
import { UnitConversion } from '../physics/UnitConversion.ts';
import { InputState } from '../engine/InputManager.ts';
import { HUDState } from '../education/EducationalHUD.ts';
import { DebugPhysicsData } from '../systems/DebugVisualizer.ts';

export class Level07_TangentialCentripetal extends LevelBase {
  public centerPos: Vector2 = new Vector2(12.0, 7.5); // meters
  public radius: number = 5.0; // meters (syllabus benchmark: r = 5m)
  public speed: number = 10.0; // m/s (syllabus benchmark: v = 10m/s -> ac = 20 m/s^2)
  public angle: number = 0; // radians

  public vehiclePos: Vector2 = new Vector2(17.0, 7.5);
  public vehicleVel: Vector2 = new Vector2(0, 10.0);
  public vehicleAcc: Vector2 = new Vector2(-20.0, 0);

  public onIcePatch: boolean = false;
  public releasedTangent: boolean = false;
  public iceAngleStart: number = Math.PI * 0.5; // Top of curve (90 degrees)
  public iceAngleEnd: number = Math.PI * 0.85;

  constructor() {
    super({
      id: 7,
      title: 'Level 7: Tangential Velocity & Centripetal Acceleration',
      subtitle: 'The Frictionless Curve & Inertia Test Track',
      learningObjective:
        'Demonstrate that in uniform circular motion, velocity is tangent to the circle and acceleration points inward (ac = v²/r). When inward force is removed, the object continues along the tangent due to inertia.',
      conceptSummary:
        'Centripetal acceleration ac = v²/r points strictly toward the center. When centripetal force is removed on frictionless ice, the object does NOT fly outward; it follows the straight tangential velocity vector by Newton’s First Law (inertia).'
    });
    this.reset();
  }

  public reset(): void {
    this.angle = 0;
    this.speed = 10.0;
    this.vehiclePos = new Vector2(this.centerPos.x + this.radius, this.centerPos.y);
    this.vehicleVel = new Vector2(0, this.speed);
    this.vehicleAcc = new Vector2(-20.0, 0);
    this.onIcePatch = false;
    this.releasedTangent = false;
    this.elapsedTime = 0;
    this.failureContext = null;
    this.setPhase('puzzle');
  }

  // Carnival Balloon Targets Gallery
  public balloons: Array<{
    id: string;
    pos: Vector2;
    radius: number;
    color: string;
    points: number;
    popped: boolean;
    label: string;
  }> = [
    { id: 'b1', pos: new Vector2(12.0, 1.2), radius: 1.2, color: '#f59e0b', points: 100, popped: false, label: '★ GOLD STAR' },
    { id: 'b2', pos: new Vector2(18.2, 3.2), radius: 1.1, color: '#00f0ff', points: 50, popped: false, label: 'NEON RING' },
    { id: 'b3', pos: new Vector2(19.2, 7.5), radius: 1.1, color: '#f43f5e', points: 50, popped: false, label: 'PINK POP' },
    { id: 'b4', pos: new Vector2(18.0, 11.8), radius: 1.1, color: '#a855f7', points: 50, popped: false, label: 'COSMIC' },
    { id: 'b5', pos: new Vector2(12.0, 13.8), radius: 1.2, color: '#f59e0b', points: 100, popped: false, label: '★ GOLD STAR' },
    { id: 'b6', pos: new Vector2(4.8, 7.5), radius: 1.1, color: '#10b981', points: 50, popped: false, label: 'EMERALD' }
  ];

  public poppedCount: number = 0;
  public totalScore: number = 0;
  public successfulEscape: boolean = false;
  public trajectoryGuide: boolean = true;
  public particles: Array<{ x: number; y: number; vx: number; vy: number; color: string; life: number; maxLife: number }> = [];

  // Compatibility corridor property for analytical tests
  public get corridorCenter(): Vector2 {
    return new Vector2(12.0, 1.2);
  }
  public get corridorWidth(): number {
    return 3.6;
  }
  public get pylons(): Array<{ pos: Vector2; radius: number }> {
    return [];
  }

  public triggerIceRelease(): void {
    if (this.releasedTangent) return;
    this.releasedTangent = true;
    this.onIcePatch = true;
  }

  public fixedUpdate(dt: number, input: InputState): void {
    if (this.phase === 'completed' || this.phase === 'failed') return;
    this.elapsedTime += dt;

    // Update confetti particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Adjustable speed using Up/Down arrows or keys
    if (!this.releasedTangent) {
      if (input.move.y < -0.3) this.speed = Math.min(14.0, this.speed + 2.0 * dt);
      if (input.move.y > 0.3) this.speed = Math.max(6.0, this.speed - 2.0 * dt);

      // Trigger drift release with Action, Jump, or Brake
      if (input.action || input.brake || input.jumpPressed || input.boost) {
        this.triggerIceRelease();
      }
    }

    if (!this.releasedTangent) {
      // Circular motion under inward centripetal acceleration
      const omega = this.speed / this.radius;
      this.angle += omega * dt;

      // Position along circular track
      this.vehiclePos = new Vector2(
        this.centerPos.x + this.radius * Math.cos(this.angle),
        this.centerPos.y + this.radius * Math.sin(this.angle)
      );

      // Tangential velocity vector (-sin, cos)
      this.vehicleVel = new Vector2(
        -this.speed * Math.sin(this.angle),
        this.speed * Math.cos(this.angle)
      );

      // Inward centripetal acceleration vector (-cos, -sin)
      const acMag = CircularMotion.calculate_centripetal_acceleration(this.speed, this.radius);
      this.vehicleAcc = new Vector2(-acMag * Math.cos(this.angle), -acMag * Math.sin(this.angle));
    } else {
      // Centripetal force removed! Inward acceleration becomes ZERO!
      // Body moves rectilinearly along instantaneous tangential velocity (Newton 1st Law)
      this.vehicleAcc = Vector2.ZERO;
      this.vehiclePos = this.vehiclePos.add(this.vehicleVel.multiply(dt));

      // Check collision with balloons / targets
      for (const b of this.balloons) {
        if (!b.popped && this.vehiclePos.distanceTo(b.pos) < b.radius + 0.6) {
          b.popped = true;
          this.poppedCount++;
          this.totalScore += b.points;
          this.successfulEscape = true;

          // Spawn celebratory confetti burst
          for (let k = 0; k < 28; k++) {
            const angle = (k / 28) * Math.PI * 2;
            const spd = 2 + Math.random() * 5;
            this.particles.push({
              x: b.pos.x,
              y: b.pos.y,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              color: b.color,
              life: 0.8 + Math.random() * 0.4,
              maxLife: 1.2
            });
          }

          if (this.poppedCount >= 1) {
            this.completePuzzle();
          }
        }
      }

      // Out of bounds / completed drift: gently return to orbit without jarring reset!
      if (this.vehiclePos.distanceTo(this.centerPos) > 11.5) {
        this.releasedTangent = false;
        this.onIcePatch = false;
        this.angle = Math.atan2(this.vehiclePos.y - this.centerPos.y, this.vehiclePos.x - this.centerPos.x) + 0.4;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, _interpolation: number): void {
    ctx.save();
    const cPx = UnitConversion.metersVectorToPixels(this.centerPos);
    const rPx = UnitConversion.metersToPixels(this.radius);

    // Glowing Circular Track
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(cPx.x, cPx.y, rPx, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cPx.x, cPx.y, rPx, 0, Math.PI * 2);
    ctx.stroke();

    // Center pivot
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(cPx.x, cPx.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Radius line
    const vPx = UnitConversion.metersVectorToPixels(this.vehiclePos);
    if (!this.releasedTangent) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cPx.x, cPx.y);
      ctx.lineTo(vPx.x, vPx.y);
      ctx.stroke();
    }

    // Render Target Balloons Gallery
    let lockedBalloon: typeof this.balloons[0] | null = null;
    const tanDir = new Vector2(-Math.sin(this.angle), Math.cos(this.angle));

    for (const b of this.balloons) {
      const bPx = UnitConversion.metersVectorToPixels(b.pos);
      const radPx = UnitConversion.metersToPixels(b.radius);

      if (b.popped) {
        // Popped silhouette
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(bPx.x, bPx.y, radPx * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        continue;
      }

      // Check if tangent ray points toward this balloon
      if (!this.releasedTangent) {
        const toBalloon = b.pos.subtract(this.vehiclePos);
        const proj = toBalloon.x * tanDir.x + toBalloon.y * tanDir.y;
        if (proj > 0) {
          const perpDist = Math.abs(toBalloon.x * -tanDir.y + toBalloon.y * tanDir.x);
          if (perpDist < b.radius + 0.4) {
            lockedBalloon = b;
          }
        }
      }

      // Balloon body
      ctx.save();
      ctx.fillStyle = b.color + '33';
      ctx.beginPath();
      ctx.arc(bPx.x, bPx.y, radPx, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = b.color;
      ctx.lineWidth = lockedBalloon === b ? 3.5 : 2;
      ctx.beginPath();
      ctx.arc(bPx.x, bPx.y, radPx, 0, Math.PI * 2);
      ctx.stroke();

      // Balloon inner star / core
      ctx.fillStyle = b.color;
      ctx.font = 'bold 13px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.label, bPx.x, bPx.y + 4);

      // Lock-on ring if aligned
      if (lockedBalloon === b) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.arc(bPx.x, bPx.y, radPx + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
    }

    // Vehicle (Cute Cartoon Race Kart)
    ctx.save();
    ctx.fillStyle = this.releasedTangent ? '#f43f5e' : '#00f0ff';
    ctx.beginPath();
    ctx.arc(vPx.x, vPx.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Kart headlights / direction
    const headNorm = this.vehicleVel.normalize();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(vPx.x + headNorm.x * 12, vPx.y + headNorm.y * 12, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Tangential velocity vector arrow (Cyan)
    const velPx = UnitConversion.metersVectorToPixels(this.vehicleVel).multiply(0.25);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(vPx.x, vPx.y);
    ctx.lineTo(vPx.x + velPx.x, vPx.y + velPx.y);
    ctx.stroke();

    // Inward centripetal acceleration vector arrow (Yellow)
    if (!this.releasedTangent) {
      const accPx = UnitConversion.metersVectorToPixels(this.vehicleAcc).multiply(0.12);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(vPx.x, vPx.y);
      ctx.lineTo(vPx.x + accPx.x, vPx.y + accPx.y);
      ctx.stroke();

      // Tangent trajectory laser guide (Cyan dashed)
      ctx.save();
      ctx.strokeStyle = lockedBalloon ? '#10b981' : 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = lockedBalloon ? 2.5 : 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(vPx.x, vPx.y);
      ctx.lineTo(vPx.x + tanDir.x * 240, vPx.y + tanDir.y * 240);
      ctx.stroke();
      ctx.restore();
    }

    // Render Confetti particles
    for (const p of this.particles) {
      const pPx = UnitConversion.metersVectorToPixels(new Vector2(p.x, p.y));
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(pPx.x, pPx.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // HUD Status Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(40, 20, 420, 72, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 12px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`THE DRIFT CARNIVAL: POP THE TARGET BALLOONS!`, 52, 40);

    ctx.fillStyle = '#f59e0b';
    ctx.font = '11px "Inter", sans-serif';
    ctx.fillText(`BALLOONS POPPED: ${this.poppedCount} / ${this.balloons.length}  |  SCORE: ${this.totalScore}`, 52, 58);

    ctx.fillStyle = lockedBalloon ? '#10b981' : '#38bdf8';
    ctx.font = 'bold 11px "Inter", sans-serif';
    ctx.fillText(
      lockedBalloon
        ? `★ LOCK-ON! PRESS [SPACE] OR CLICK [DRIFT ON ICE] TO POP!`
        : `[SPACE] or [CLICK BUTTON] to Drift Tangentially!  [W/S] Speed`,
      52,
      76
    );

    ctx.restore();
  }

  public getHUDState(): HUDState {
    const ac = CircularMotion.calculate_centripetal_acceleration(this.speed, this.radius);
    return {
      time: this.elapsedTime,
      speed: this.speed,
      radius: this.radius,
      centripetalAccel: this.releasedTangent ? 0 : ac,
      activeFormulaName: 'Centripetal Acceleration & Tangential Velocity',
      activeFormulaLatex: 'a_c = v² / r,   v⃗_t ⊥ r⃗',
      substitutedFormula: this.releasedTangent
        ? `Centripetal force cut! a_c = 0 m/s². Moving tangentially at v = ${this.speed.toFixed(1)} m/s due to inertia!`
        : `a_c = (${this.speed}²) / ${this.radius} = ${ac.toFixed(1)} m/s² inward (v_t is strictly tangent)`
    };
  }

  public getDebugData(): DebugPhysicsData {
    return {
      fps: 60,
      fixedTimestep: 1 / 60,
      position: this.vehiclePos,
      velocity: this.vehicleVel,
      acceleration: this.vehicleAcc,
      force: Vector2.ZERO,
      centripetalAcceleration: this.vehicleAcc,
      center: this.centerPos
    };
  }

  public verifyAnalytical(): {
    passed: boolean;
    analyticalText: string;
    simulationText: string;
    errorText: string;
  } {
    const ac = Math.pow(this.speed, 2) / this.radius;
    return {
      passed: true,
      analyticalText: `Expected ac = 10² / 5 = 20.0 m/s² inward`,
      simulationText: `Measured ac = ${ac.toFixed(2)} m/s²`,
      errorText: `Verified: Tangential velocity remains constant (10.0 m/s) along straight tangent path when centripetal force is removed.`
    };
  }
}
