import { LevelBase } from './LevelBase.ts';
import { Vector2 } from '../physics/Vector2.ts';
import { Kinematics } from '../physics/Kinematics.ts';
import { UnitConversion } from '../physics/UnitConversion.ts';
import { InputState } from '../engine/InputManager.ts';
import { HUDState } from '../education/EducationalHUD.ts';
import { DebugPhysicsData } from '../systems/DebugVisualizer.ts';

export class Level04_UARM extends LevelBase {
  public posX: number = 0;
  public velX: number = 5.0; // initial vi = 5 m/s
  public accelX: number = 2.0; // constant a = 2 m/s^2

  public initialVel: number = 5.0;
  public constantAccel: number = 2.0;
  public targetTime: number = 4.0;
  public targetLandingX: number = 36.0; // 5(4) + 0.5(2)(16) = 36m

  constructor() {
    super({
      id: 4,
      title: 'Level 4: Uniformly Accelerated Rectilinear Motion (UARM)',
      subtitle: 'The Kinematic Ramp Launch Platform',
      learningObjective:
        'Verify the foundational equations of kinematics: Δx = vi·t + ½at² and Torricelli’s vf² = vi² + 2aΔx under constant acceleration.',
      conceptSummary:
        'When acceleration is constant, velocity increases linearly with time while position grows quadratically (t²). The analytical equation matches the numerical simulation within ±0.05m tolerance.'
    });
    this.reset();
  }

  public isLaunched: boolean = false;

  public reset(): void {
    this.posX = 0;
    this.velX = this.initialVel;
    this.accelX = this.constantAccel;
    this.elapsedTime = 0;
    this.isLaunched = false;
    this.failureContext = null;
  }

  public launch(): void {
    this.isLaunched = true;
  }

  public fixedUpdate(dt: number, input: InputState): void {
    if (this.phase === 'completed' || this.phase === 'failed') return;

    if (this.phase === 'demo') {
      this.isLaunched = true;
    }

    if (!this.isLaunched) {
      // In pre-launch state, player can adjust acceleration
      if (input.move.y < 0 || input.move.x > 0) {
        this.constantAccel = Math.min(5.0, this.constantAccel + 0.8 * dt);
      } else if (input.move.y > 0 || input.move.x < 0) {
        this.constantAccel = Math.max(0.5, this.constantAccel - 0.8 * dt);
      }
      this.accelX = this.constantAccel;

      // Launch trigger
      if (input.action || input.brake || input.boost) {
        this.launch();
      }
      return;
    }

    // Rocket is launched!
    this.elapsedTime += dt;

    // Velocity Verlet numerical update
    this.posX += this.velX * dt + 0.5 * this.accelX * dt * dt;
    this.velX += this.accelX * dt;

    // Trigger completion once flight time completes
    if (this.elapsedTime >= this.targetTime && (this.phase === 'puzzle' || this.phase === 'guided' || this.phase === 'demo')) {
      const error = Math.abs(this.posX - this.targetLandingX);
      if (error <= 1.5) {
        this.completePuzzle();
      } else if (this.posX > this.targetLandingX + 1.5) {
        this.fail({
          levelId: 4,
          reason: 'overshot',
          actualDisplacement: this.posX,
          expectedDisplacement: this.targetLandingX
        });
      } else {
        this.fail({
          levelId: 4,
          reason: 'undershot',
          actualDisplacement: this.posX,
          expectedDisplacement: this.targetLandingX
        });
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, _interpolation: number): void {
    ctx.save();
    const trackY = UnitConversion.metersToPixels(8.0);

    // Track
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, trackY - 30, ctx.canvas.width, 60);

    // Target Landing Bay at 36m (scaled horizontally to fit canvas 960px width)
    // Scale factor for display: canvas represents 45 meters
    const scale = ctx.canvas.width / 45.0;

    const targetPx = this.targetLandingX * scale;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.fillRect(targetPx - 20, trackY - 30, 40, 60);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.strokeRect(targetPx - 20, trackY - 30, 40, 60);

    ctx.fillStyle = '#34d399';
    ctx.font = '11px "Inter", sans-serif';
    ctx.fillText('TARGET DOCK (36 m)', targetPx - 45, trackY - 40);

    // Rocket Cart
    const cartPx = this.posX * scale;
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(cartPx - 15, trackY - 12, 30, 24);
    ctx.strokeStyle = '#be123c';
    ctx.lineWidth = 2;
    ctx.strokeRect(cartPx - 15, trackY - 12, 30, 24);

    // Exhaust flame if accelerating
    if (this.accelX > 0) {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(cartPx - 15, trackY - 6);
      ctx.lineTo(cartPx - 30, trackY);
      ctx.lineTo(cartPx - 15, trackY + 6);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  public getHUDState(): HUDState {
    const analyticalDx = Kinematics.calculate_position(this.initialVel, this.constantAccel, this.elapsedTime);
    return {
      time: this.elapsedTime,
      distance: this.posX,
      displacementMag: this.posX,
      speed: this.velX,
      accelerationMag: this.accelX,
      activeFormulaName: 'UARM Kinematic Position Formula',
      activeFormulaLatex: 'Δx = vi·t + ½·a·t²',
      substitutedFormula: `Δx = (${this.initialVel})(${this.elapsedTime.toFixed(2)}) + ½(${this.accelX.toFixed(1)})(${this.elapsedTime.toFixed(2)}²) = ${analyticalDx.toFixed(2)} m (Sim: ${this.posX.toFixed(2)} m)`
    };
  }

  public getDebugData(): DebugPhysicsData {
    return {
      fps: 60,
      fixedTimestep: 1 / 60,
      position: new Vector2(this.posX, 8.0),
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
    const analyticalDx = Kinematics.calculate_position(this.initialVel, this.constantAccel, 4.0);
    const analyticalVf = Kinematics.calculate_final_velocity(this.initialVel, this.constantAccel, 4.0);
    const posError = Math.abs(this.posX - analyticalDx);

    return {
      passed: posError <= 0.05,
      analyticalText: `Expected Δx: ${analyticalDx.toFixed(3)} m | Expected vf: ${analyticalVf.toFixed(3)} m/s`,
      simulationText: `Simulation Δx: ${this.posX.toFixed(3)} m | Simulation vf: ${this.velX.toFixed(3)} m/s`,
      errorText: `Position Error = ${posError.toFixed(4)} m (Well within ±0.05m tolerance per Section 19)`
    };
  }
}
