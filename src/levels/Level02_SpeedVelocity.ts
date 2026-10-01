import { LevelBase } from './LevelBase.ts';
import { Vector2 } from '../physics/Vector2.ts';
import { Kinematics } from '../physics/Kinematics.ts';
import { UnitConversion } from '../physics/UnitConversion.ts';
import { InputState } from '../engine/InputManager.ts';
import { HUDState } from '../education/EducationalHUD.ts';
import { DebugPhysicsData } from '../systems/DebugVisualizer.ts';

export class Level02_SpeedVelocity extends LevelBase {
  public vehiclePos: Vector2 = new Vector2(2.0, 7.5);
  public startPos: Vector2 = new Vector2(2.0, 7.5);
  public vehicleVel: Vector2 = Vector2.ZERO;
  public totalDistance: number = 0;
  public lastPos: Vector2 = new Vector2(2.0, 7.5);

  public finishLineX: number = 20.0;
  public returnLoopActive: boolean = false;
  public gate1Time: number = 0;
  public gate2Time: number = 0;

  constructor() {
    super({
      id: 2,
      title: 'Level 2: Average Speed vs. Average Velocity',
      subtitle: 'The Velocity Vector Circuit',
      learningObjective:
        'Differentiate between scalar average speed (distance/time) and vector average velocity (displacement/time).',
      conceptSummary:
        'Average speed = total distance / total time (scalar). Average velocity = net displacement / total time (vector). If you run around a track and return to start, your average velocity is 0 m/s!'
    });
    this.reset();
  }

  public reset(): void {
    this.vehiclePos = new Vector2(2.0, 7.5);
    this.startPos = new Vector2(2.0, 7.5);
    this.vehicleVel = Vector2.ZERO;
    this.totalDistance = 0;
    this.lastPos = new Vector2(2.0, 7.5);
    this.elapsedTime = 0;
    this.returnLoopActive = false;
  }

  public fixedUpdate(dt: number, input: InputState): void {
    if (this.phase === 'completed' || this.phase === 'failed') return;
    this.elapsedTime += dt;

    if (this.phase === 'demo') {
      // Demo: Travels 15m East in 3s (speed 5 m/s), then 5m West in 1s
      if (this.elapsedTime < 3.0) {
        this.vehicleVel = new Vector2(5.0, 0);
      } else if (this.elapsedTime < 4.0) {
        this.vehicleVel = new Vector2(-5.0, 0);
      } else {
        this.vehicleVel = Vector2.ZERO;
      }
    } else {
      const driveSpeed = 6.0;
      if (input.move.x !== 0) {
        this.vehicleVel = new Vector2(input.move.x * driveSpeed, 0);
      } else {
        this.vehicleVel = this.vehicleVel.multiply(0.9);
      }
    }

    const step = this.vehicleVel.multiply(dt);
    this.vehiclePos = this.vehiclePos.add(step);

    // Track distance
    const d = this.vehiclePos.distanceTo(this.lastPos);
    this.totalDistance += d;
    this.lastPos = new Vector2(this.vehiclePos.x, this.vehiclePos.y);

    // Win condition: reach finish gate (or complete loop)
    if (this.vehiclePos.x >= this.finishLineX && (this.phase === 'puzzle' || this.phase === 'guided')) {
      this.completePuzzle();
    }
  }

  public render(ctx: CanvasRenderingContext2D, _interpolation: number): void {
    ctx.save();

    // Track corridor
    const yTop = UnitConversion.metersToPixels(5.0);
    const yBot = UnitConversion.metersToPixels(10.0);
    ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
    ctx.fillRect(0, yTop, ctx.canvas.width, yBot - yTop);

    // Lane markings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([15, 10]);
    ctx.beginPath();
    ctx.moveTo(0, UnitConversion.metersToPixels(7.5));
    ctx.lineTo(ctx.canvas.width, UnitConversion.metersToPixels(7.5));
    ctx.stroke();
    ctx.setLineDash([]);

    // Start gate
    const startPx = UnitConversion.metersToPixels(this.startPos.x);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startPx, yTop);
    ctx.lineTo(startPx, yBot);
    ctx.stroke();
    ctx.fillStyle = '#60a5fa';
    ctx.font = '12px "Inter", sans-serif';
    ctx.fillText('START LINE', startPx - 25, yTop - 10);

    // Finish gate
    const finishPx = UnitConversion.metersToPixels(this.finishLineX);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(finishPx, yTop);
    ctx.lineTo(finishPx, yBot);
    ctx.stroke();
    ctx.fillStyle = '#34d399';
    ctx.fillText('FINISH LINE (GATE B)', finishPx - 45, yTop - 10);

    // Vehicle
    const vPx = UnitConversion.metersVectorToPixels(this.vehiclePos);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(vPx.x, vPx.y, UnitConversion.metersToPixels(0.5), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.stroke();

    ctx.restore();
  }

  public getHUDState(): HUDState {
    const disp = Kinematics.calculate_displacement(this.startPos.x, this.vehiclePos.x);
    const t = Math.max(0.001, this.elapsedTime);
    const avgSpeed = this.totalDistance / t;
    const avgVel = disp / t;

    return {
      time: this.elapsedTime,
      distance: this.totalDistance,
      displacementMag: Math.abs(disp),
      speed: avgSpeed,
      activeFormulaName: 'Average Speed vs. Average Velocity',
      activeFormulaLatex: 'v_avg = d / Δt    vs    v⃗_avg = Δr⃗ / Δt',
      substitutedFormula: `Speed = ${this.totalDistance.toFixed(2)}m / ${t.toFixed(1)}s = ${avgSpeed.toFixed(2)} m/s | Velocity = ${disp.toFixed(2)}m / ${t.toFixed(1)}s = ${avgVel.toFixed(2)} m/s`
    };
  }

  public getDebugData(): DebugPhysicsData {
    return {
      fps: 60,
      fixedTimestep: 1 / 60,
      position: this.vehiclePos,
      velocity: this.vehicleVel,
      acceleration: Vector2.ZERO,
      force: Vector2.ZERO
    };
  }

  public verifyAnalytical(): {
    passed: boolean;
    analyticalText: string;
    simulationText: string;
    errorText: string;
  } {
    const t = Math.max(0.001, this.elapsedTime);
    const analyticalSpeed = this.totalDistance / t;
    const analyticalVel = (this.vehiclePos.x - this.startPos.x) / t;

    return {
      passed: analyticalSpeed >= Math.abs(analyticalVel) - 1e-5,
      analyticalText: `Speed: ${analyticalSpeed.toFixed(3)} m/s | Velocity: ${analyticalVel.toFixed(3)} m/s`,
      simulationText: `Distance: ${this.totalDistance.toFixed(2)} m | Displacement: ${(this.vehiclePos.x - this.startPos.x).toFixed(2)} m`,
      errorText: `Scientific Invariant Verified: Average speed (${analyticalSpeed.toFixed(2)}) ≥ Average velocity magnitude (${Math.abs(analyticalVel).toFixed(2)})`
    };
  }
}
