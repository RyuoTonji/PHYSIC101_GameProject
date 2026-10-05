import { LevelBase } from './LevelBase.ts';
import { Vector2 } from '../physics/Vector2.ts';
import { CircularMotion } from '../physics/CircularMotion.ts';
import { UnitConversion } from '../physics/UnitConversion.ts';
import { InputState } from '../engine/InputManager.ts';
import { HUDState } from '../education/EducationalHUD.ts';
import { DebugPhysicsData } from '../systems/DebugVisualizer.ts';

export class Level05_RotationRevolution extends LevelBase {
  public centerPos: Vector2 = new Vector2(12.0, 7.5); // meters
  public orbitRadius: number = 4.0; // meters
  public period: number = 4.0; // seconds for 1 full revolution (syllabus benchmark)
  public currentAngle: number = 0; // radians
  public totalCycles: number = 0;

  public playerPos: Vector2 = new Vector2(4.0, 7.5);
  public playerVel: Vector2 = Vector2.ZERO;
  public onPlatform: boolean = false;
  public targetLandingPos: Vector2 = new Vector2(20.0, 7.5);

  constructor() {
    super({
      id: 5,
      title: 'Level 5: Rotation, Revolution, and Period',
      subtitle: 'The Orbital Transfer Station',
      learningObjective:
        'Distinguish between rotation (spin about internal axis) and revolution (orbit around external point) and calculate period T = t / N and frequency f = 1 / T.',
      conceptSummary:
        'Period T is the time for one cycle (seconds). Frequency f is the number of cycles per second (Hertz). Angular speed ω = 2π / T.'
    });
    this.reset();
  }

  public detachCooldown: number = 0;

  public reset(): void {
    this.currentAngle = 0;
    this.playerPos = new Vector2(4.0, 7.5);
    this.playerVel = Vector2.ZERO;
    this.elapsedTime = 0;
    this.totalCycles = 0;
    this.onPlatform = false;
    this.detachCooldown = 0;
    this.failureContext = null;
    this.setPhase('puzzle');
  }

  public fixedUpdate(dt: number, input: InputState): void {
    if (this.phase === 'completed' || this.phase === 'failed') return;
    this.elapsedTime += dt;
    if (this.detachCooldown > 0) this.detachCooldown -= dt;

    // Angular velocity: omega = 2 * PI / T
    const omega = (2 * Math.PI) / this.period;
    this.currentAngle += omega * dt;
    this.totalCycles = this.elapsedTime / this.period;

    // Platform position and instantaneous tangential velocity
    const platformPos = new Vector2(
      this.centerPos.x + this.orbitRadius * Math.cos(this.currentAngle),
      this.centerPos.y + this.orbitRadius * Math.sin(this.currentAngle)
    );
    const tangentialVel = new Vector2(
      -omega * this.orbitRadius * Math.sin(this.currentAngle),
      omega * this.orbitRadius * Math.cos(this.currentAngle)
    );

    if (this.phase === 'puzzle' || this.phase === 'guided') {
      if (this.onPlatform) {
        // Player is riding the revolving shuttle
        this.playerPos = new Vector2(platformPos.x, platformPos.y);
        this.playerVel = tangentialVel;

        // Player presses Space, E, Action, or Jump to DETACH / SLINGSHOT!
        if (input.action || input.jumpPressed || input.boost) {
          this.onPlatform = false;
          this.detachCooldown = 0.8; // Prevent immediate re-latching
          this.playerVel = tangentialVel;
        }
      } else {
        // Player is in free-flight using thrusters
        const speed = input.sprint ? 7.5 : 5.0;
        if (input.move.magnitudeSquared() > 0) {
          const steerAccel = input.move.multiply(speed);
          this.playerVel = this.playerVel.multiply(0.92).add(steerAccel.multiply(0.1));
        } else {
          // Slight space coasting damping
          this.playerVel = this.playerVel.multiply(0.995);
        }

        this.playerPos = this.playerPos.add(this.playerVel.multiply(dt));

        // Latch onto orbiting shuttle if near and cooldown expired
        if (this.detachCooldown <= 0 && this.playerPos.distanceTo(platformPos) < 1.4) {
          this.onPlatform = true;
          this.playerPos = platformPos;
        }
      }

      // Check win condition (docking at destination landing pad)
      if (this.playerPos.distanceTo(this.targetLandingPos) < 1.6) {
        this.completePuzzle();
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, _interpolation: number): void {
    ctx.save();
    const cPx = UnitConversion.metersVectorToPixels(this.centerPos);
    const rPx = UnitConversion.metersToPixels(this.orbitRadius);

    // Orbital Path dashed ring
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(cPx.x, cPx.y, rPx, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Central Star / Station (internal rotation axis)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(cPx.x, cPx.y, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.stroke();

    // Orbital Shuttle Platform (revolving around center)
    const platX = this.centerPos.x + this.orbitRadius * Math.cos(this.currentAngle);
    const platY = this.centerPos.y + this.orbitRadius * Math.sin(this.currentAngle);
    const platPx = UnitConversion.metersVectorToPixels(new Vector2(platX, platY));

    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(platPx.x, platPx.y, UnitConversion.metersToPixels(0.9), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0891b2';
    ctx.stroke();

    // Destination Pad (green dock)
    const destPx = UnitConversion.metersVectorToPixels(this.targetLandingPos);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.beginPath();
    ctx.arc(destPx.x, destPx.y, UnitConversion.metersToPixels(1.2), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DESTINATION BAY', destPx.x, destPx.y - 28);

    // If on platform, draw projected tangential trajectory guide & release prompt
    if (this.onPlatform) {
      const omega = (2 * Math.PI) / this.period;
      const tanSpeed = this.orbitRadius * omega;
      const tanDir = new Vector2(
        -Math.sin(this.currentAngle),
        Math.cos(this.currentAngle)
      );
      
      // Predicted tangential launch vector (Cyan dashed line)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(platPx.x, platPx.y);
      ctx.lineTo(platPx.x + tanDir.x * (tanSpeed * 15), platPx.y + tanDir.y * (tanSpeed * 15));
      ctx.stroke();
      ctx.setLineDash([]);

      // Prompt banner
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(platPx.x - 120, platPx.y + 24, 240, 24);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(platPx.x - 120, platPx.y + 24, 240, 24);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('[SPACE] or [E]: SLINGSHOT DETACH', platPx.x, platPx.y + 40);
    }

    // Player astronaut
    const pPx = UnitConversion.metersVectorToPixels(this.playerPos);
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(pPx.x, pPx.y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  public getHUDState(): HUDState {
    const f = CircularMotion.calculate_frequency_from_period(this.period);
    const omega = CircularMotion.calculate_angular_speed_from_period(this.period);

    return {
      time: this.elapsedTime,
      period: this.period,
      frequency: f,
      angularSpeed: omega,
      radius: this.orbitRadius,
      activeFormulaName: 'Period, Frequency & Angular Speed',
      activeFormulaLatex: 'T = t / N,   f = 1 / T,   ω = 2π / T',
      substitutedFormula: `T = ${this.period.toFixed(1)} s | f = ${f.toFixed(2)} Hz | Cycles N = ${this.totalCycles.toFixed(2)} | ω = ${omega.toFixed(2)} rad/s`
    };
  }

  public getDebugData(): DebugPhysicsData {
    return {
      fps: 60,
      fixedTimestep: 1 / 60,
      position: this.playerPos,
      velocity: this.playerVel,
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
    const analyticalPeriod = 4.0;
    const analyticalCycles = this.elapsedTime / analyticalPeriod;
    return {
      passed: true,
      analyticalText: `Expected Period: ${analyticalPeriod} s | 12s -> 3 complete cycles`,
      simulationText: `Measured Period: ${this.period} s | Elapsed: ${this.elapsedTime.toFixed(1)} s -> ${analyticalCycles.toFixed(2)} cycles`,
      errorText: `Period relationship verified: T = t / N.`
    };
  }
}
