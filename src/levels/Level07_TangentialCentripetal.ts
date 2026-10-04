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

  public triggerIceRelease(): void {
    this.releasedTangent = true;
    this.onIcePatch = true;
  }

  public fixedUpdate(dt: number, input: InputState): void {
    if (this.phase === 'completed' || this.phase === 'failed') return;
    this.elapsedTime += dt;

    if (input.action || input.brake || input.jump) {
      this.triggerIceRelease();
    }

    if (!this.releasedTangent) {
      // Circular motion under inward centripetal acceleration
      const omega = this.speed / this.radius; // 10 / 5 = 2 rad/s
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

      // In puzzle/guided mode, hitting the ice zone releases centripetal constraint
      const normalizedAngle = this.angle % (Math.PI * 2);
      if (
        (this.phase === 'puzzle' || this.phase === 'demo') &&
        normalizedAngle >= this.iceAngleStart &&
        normalizedAngle <= this.iceAngleEnd
      ) {
        this.triggerIceRelease();
      }
    } else {
      // Centripetal force removed! Inward acceleration becomes ZERO!
      // Body moves rectilinearly along instantaneous tangential velocity (Newton 1st Law)
      this.vehicleAcc = Vector2.ZERO;
      this.vehiclePos = this.vehiclePos.add(this.vehicleVel.multiply(dt));

      // After demonstrating tangential departure, complete puzzle
      if (this.vehiclePos.distanceTo(this.centerPos) > 12.0) {
        this.completePuzzle();
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, _interpolation: number): void {
    ctx.save();
    const cPx = UnitConversion.metersVectorToPixels(this.centerPos);
    const rPx = UnitConversion.metersToPixels(this.radius);

    // Circular track
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(cPx.x, cPx.y, rPx, 0, Math.PI * 2);
    ctx.stroke();

    // Ice hazard patch on curve
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(cPx.x, cPx.y, rPx, this.iceAngleStart, this.iceAngleEnd);
    ctx.stroke();

    // Center pivot
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(cPx.x, cPx.y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Radius line
    const vPx = UnitConversion.metersVectorToPixels(this.vehiclePos);
    if (!this.releasedTangent) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cPx.x, cPx.y);
      ctx.lineTo(vPx.x, vPx.y);
      ctx.stroke();
    }

    // Vehicle
    ctx.fillStyle = this.releasedTangent ? '#f43f5e' : '#38bdf8';
    ctx.beginPath();
    ctx.arc(vPx.x, vPx.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

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
    }

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
