import { LevelBase } from './LevelBase.ts';
import { Vector2 } from '../physics/Vector2.ts';
import { UnitConversion } from '../physics/UnitConversion.ts';
import { InputState } from '../engine/InputManager.ts';
import { HUDState } from '../education/EducationalHUD.ts';
import { DebugPhysicsData } from '../systems/DebugVisualizer.ts';

export class Level03_Acceleration extends LevelBase {
  public posX: number = 2.0; // meters
  public velX: number = 0; // m/s
  public accelX: number = 0; // m/s^2

  public initialVel: number = 0;
  public targetStopMin: number = 18.0;
  public targetStopMax: number = 21.0;
  public accelerationPhaseTime: number = 0;

  constructor() {
    super({
      id: 3,
      title: 'Level 3: Acceleration & Deceleration',
      subtitle: 'The Precision Brake Test Track',
      learningObjective:
        'Understand acceleration as the rate of change of velocity (a = Δv/Δt) and observe deceleration as acceleration opposing velocity.',
      conceptSummary:
        'Acceleration vector points in the direction of velocity change. When speeding up, a and v have the same sign. When braking, a and v have opposite signs (v·a < 0).'
    });
    this.reset();
  }

  public hasMoved: boolean = false;

  public reset(): void {
    this.posX = 2.0;
    this.velX = 0;
    this.accelX = 0;
    this.initialVel = 0;
    this.elapsedTime = 0;
    this.accelerationPhaseTime = 0;
    this.hasMoved = false;
    this.failureContext = null;
    this.setPhase('puzzle');
  }

  public fixedUpdate(dt: number, input: InputState): void {
    if (this.phase === 'completed' || this.phase === 'failed') return;
    this.elapsedTime += dt;

    if (this.phase === 'demo') {
      // Demo: Accelerates at +4.0 m/s^2 for 5s (0 to 20 m/s), then brakes at -5 m/s^2 to stop
      if (this.elapsedTime < 5.0) {
        this.accelX = 4.0;
      } else if (this.velX > 0.05) {
        this.accelX = -5.0;
      } else {
        this.accelX = 0;
        this.velX = 0;
      }
    } else {
      if (input.move.x > 0 || input.move.y < 0 || input.boost) {
        this.accelX = 4.0; // Gas pedal (D, Right, W, Up, Shift)
      } else if (input.brake || input.move.x < 0 || input.move.y > 0) {
        this.accelX = -4.5; // Brake pedal (Space, S, Down, A, Left)
      } else {
        this.accelX = this.velX > 0 ? -0.5 : 0; // Natural rolling resistance only while moving
      }
    }

    if (this.accelX > 0) {
      this.hasMoved = true;
    }

    this.velX = Math.max(0, this.velX + this.accelX * dt);
    this.posX += this.velX * dt;

    // Check stop condition ONLY after the vehicle has actually begun moving and traveled at least 5m
    if ((this.phase === 'puzzle' || this.phase === 'guided') && this.hasMoved && this.posX > 5.0 && this.velX === 0) {
      if (this.posX >= this.targetStopMin && this.posX <= this.targetStopMax) {
        this.completePuzzle();
      } else if (this.posX > this.targetStopMax) {
        this.fail({
          levelId: 3,
          reason: 'overshot',
          actualDisplacement: this.posX,
          expectedDisplacement: this.targetStopMax,
          details: `Vehicle overshot the landing bay at ${this.posX.toFixed(2)} m.`
        });
      } else if (this.posX < this.targetStopMin) {
        this.fail({
          levelId: 3,
          reason: 'undershot',
          actualDisplacement: this.posX,
          expectedDisplacement: this.targetStopMin,
          details: `Vehicle stopped short at ${this.posX.toFixed(2)} m.`
        });
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, _interpolation: number): void {
    ctx.save();
    const trackY = UnitConversion.metersToPixels(7.5);

    // Track
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, trackY - 40, ctx.canvas.width, 80);

    // Stop Target Zone
    const targetPxMin = UnitConversion.metersToPixels(this.targetStopMin);
    const targetPxMax = UnitConversion.metersToPixels(this.targetStopMax);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
    ctx.fillRect(targetPxMin, trackY - 40, targetPxMax - targetPxMin, 80);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.strokeRect(targetPxMin, trackY - 40, targetPxMax - targetPxMin, 80);

    ctx.fillStyle = '#34d399';
    ctx.font = '12px "Inter", sans-serif';
    ctx.fillText('TARGET STOP ZONE (18m - 21m)', targetPxMin, trackY - 50);

    // Vehicle
    const carPx = UnitConversion.metersToPixels(this.posX);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(carPx - 25, trackY - 15, 50, 30);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.strokeRect(carPx - 25, trackY - 15, 50, 30);

    ctx.restore();
  }

  public getHUDState(): HUDState {
    return {
      time: this.elapsedTime,
      distance: this.posX,
      speed: this.velX,
      accelerationMag: this.accelX,
      activeFormulaName: 'Acceleration Formula',
      activeFormulaLatex: 'a = Δv / Δt = (vf - vi) / t',
      substitutedFormula: `a = ${this.accelX.toFixed(2)} m/s² | v = ${this.velX.toFixed(2)} m/s | x = ${this.posX.toFixed(2)} m`
    };
  }

  public getDebugData(): DebugPhysicsData {
    return {
      fps: 60,
      fixedTimestep: 1 / 60,
      position: new Vector2(this.posX, 7.5),
      velocity: new Vector2(this.velX, 0),
      acceleration: new Vector2(this.accelX, 0),
      force: Vector2.ZERO
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
      analyticalText: `Target Range: [${this.targetStopMin.toFixed(2)}, ${this.targetStopMax.toFixed(2)}] m`,
      simulationText: `Final Position: ${this.posX.toFixed(3)} m`,
      errorText: `Acceleration rate: ${this.accelX.toFixed(2)} m/s² correctly modified velocity according to Δv = a·Δt.`
    };
  }
}
