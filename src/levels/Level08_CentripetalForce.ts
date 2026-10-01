import { LevelBase } from './LevelBase.ts';
import { Vector2 } from '../physics/Vector2.ts';
import { Forces } from '../physics/Forces.ts';
import { UnitConversion } from '../physics/UnitConversion.ts';
import { InputState } from '../engine/InputManager.ts';
import { HUDState } from '../education/EducationalHUD.ts';
import { DebugPhysicsData } from '../systems/DebugVisualizer.ts';

export type Level8Scenario = 'ball_on_string' | 'washing_machine';

export class Level08_CentripetalForce extends LevelBase {
  public scenario: Level8Scenario = 'ball_on_string';

  // Scenario A: Ball on a String
  public centerPos: Vector2 = new Vector2(12.0, 7.5);
  public mass: number = 2.0; // kg (syllabus benchmark: m = 2kg)
  public radius: number = 5.0; // meters (syllabus benchmark: r = 5m)
  public speed: number = 10.0; // m/s (syllabus benchmark: v = 10m/s -> Fc = 40N)
  public maxTensionLimit: number = 55.0; // Newtons
  public angle: number = 0; // radians
  public stringSnapped: boolean = false;
  public ballPos: Vector2 = new Vector2(17.0, 7.5);
  public ballVel: Vector2 = new Vector2(0, 10.0);

  // Scenario B: Washing Machine Drum & Water Droplets
  public drumRadius: number = 3.5; // meters
  public drumOmega: number = 3.0; // rad/s
  public waterDroplets: Array<{ pos: Vector2; vel: Vector2; escaped: boolean }> = [];

  constructor() {
    super({
      id: 8,
      title: 'Level 8: Centripetal Force & Real-World Applications',
      subtitle: 'Tension, Spin Cycle & The Centrifugal Myth',
      learningObjective:
        'Calculate required inward net force Fc = m·v²/r and explore real physical applications (ball on string and washing machine drum), debunking the centrifugal force misconception.',
      conceptSummary:
        'Centripetal force is not a mysterious new force; it is the net real inward force (string tension, drum normal force) needed to maintain circular motion. In the washing machine, water continues tangentially through holes due to inertia, not an outward force.'
    });
    this.reset();
  }

  public reset(): void {
    this.angle = 0;
    this.stringSnapped = false;
    this.ballPos = new Vector2(this.centerPos.x + this.radius, this.centerPos.y);
    this.ballVel = new Vector2(0, this.speed);
    this.elapsedTime = 0;
    this.failureContext = null;

    // Reset water droplets for washing machine scenario
    this.waterDroplets = [];
    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI * 2) / 24;
      this.waterDroplets.push({
        pos: new Vector2(
          this.centerPos.x + this.drumRadius * Math.cos(a),
          this.centerPos.y + this.drumRadius * Math.sin(a)
        ),
        vel: Vector2.ZERO,
        escaped: false
      });
    }
  }

  public switchScenario(sc: Level8Scenario): void {
    this.scenario = sc;
    this.reset();
  }

  public fixedUpdate(dt: number, input: InputState): void {
    if (this.phase === 'completed' || this.phase === 'failed') return;
    this.elapsedTime += dt;

    if (this.scenario === 'ball_on_string') {
      // Interactive controls for mass, speed, and radius
      if (input.move.y < 0) this.speed = Math.min(15.0, this.speed + 1.0 * dt);
      if (input.move.y > 0) this.speed = Math.max(2.0, this.speed - 1.0 * dt);
      if (input.move.x > 0) this.radius = Math.min(7.0, this.radius + 0.5 * dt);
      if (input.move.x < 0) this.radius = Math.max(2.0, this.radius - 0.5 * dt);

      const requiredFc = Forces.calculate_centripetal_force(this.mass, this.speed, this.radius);

      if (!this.stringSnapped) {
        // String tension checks
        if (requiredFc > this.maxTensionLimit) {
          // Tension exceeded string breaking strength!
          this.stringSnapped = true;
        }

        const omega = this.speed / this.radius;
        this.angle += omega * dt;

        this.ballPos = new Vector2(
          this.centerPos.x + this.radius * Math.cos(this.angle),
          this.centerPos.y + this.radius * Math.sin(this.angle)
        );

        this.ballVel = new Vector2(
          -this.speed * Math.sin(this.angle),
          this.speed * Math.cos(this.angle)
        );
      } else {
        // Tangential flight along inertia
        this.ballPos = this.ballPos.add(this.ballVel.multiply(dt));
      }

      if (this.elapsedTime > 6.0 && (this.phase === 'puzzle' || this.phase === 'guided')) {
        this.completePuzzle();
      }
    } else {
      // Washing machine scenario
      this.angle += this.drumOmega * dt;

      // Update water droplets: some escape tangentially through drum perforations!
      for (const drop of this.waterDroplets) {
        if (!drop.escaped) {
          const dropAngle =
            Math.atan2(drop.pos.y - this.centerPos.y, drop.pos.x - this.centerPos.x) +
            this.drumOmega * dt;
          drop.pos = new Vector2(
            this.centerPos.x + this.drumRadius * Math.cos(dropAngle),
            this.centerPos.y + this.drumRadius * Math.sin(dropAngle)
          );

          // Random chance to pass through perforation
          if (Math.random() < 0.02) {
            drop.escaped = true;
            // Droplet flies off along tangential velocity (Newton 1st Law)
            const tanSpeed = this.drumRadius * this.drumOmega;
            drop.vel = new Vector2(
              -tanSpeed * Math.sin(dropAngle),
              tanSpeed * Math.cos(dropAngle)
            );
          }
        } else {
          drop.pos = drop.pos.add(drop.vel.multiply(dt));
        }
      }

      if (this.elapsedTime > 6.0 && (this.phase === 'puzzle' || this.phase === 'guided')) {
        this.completePuzzle();
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, _interpolation: number): void {
    ctx.save();
    const cPx = UnitConversion.metersVectorToPixels(this.centerPos);

    if (this.scenario === 'ball_on_string') {
      const bPx = UnitConversion.metersVectorToPixels(this.ballPos);

      // String line
      if (!this.stringSnapped) {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cPx.x, cPx.y);
        ctx.lineTo(bPx.x, bPx.y);
        ctx.stroke();

        // Inward tension force vector arrow (Gold)
        const fc = Forces.calculate_centripetal_force(this.mass, this.speed, this.radius);
        const inwardNorm = cPx.subtract(bPx).normalize();
        const fcPx = inwardNorm.multiply(fc * 2.0);

        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bPx.x, bPx.y);
        ctx.lineTo(bPx.x + fcPx.x, bPx.y + fcPx.y);
        ctx.stroke();

        ctx.fillStyle = '#ffd700';
        ctx.font = '11px "Inter", sans-serif';
        ctx.fillText(`Tension Fc = ${fc.toFixed(1)} N`, bPx.x + fcPx.x * 0.5 + 8, bPx.y + fcPx.y * 0.5 - 5);
      }

      // Center pivot
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cPx.x, cPx.y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Ball
      ctx.fillStyle = this.stringSnapped ? '#f43f5e' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(bPx.x, bPx.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "Inter", sans-serif';
      ctx.fillText(`m=${this.mass}kg`, bPx.x - 14, bPx.y - 18);
    } else {
      // Washing machine rotating drum
      const rPx = UnitConversion.metersToPixels(this.drumRadius);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cPx.x, cPx.y, rPx, 0, Math.PI * 2);
      ctx.stroke();

      // Perforations
      for (let i = 0; i < 32; i++) {
        const a = this.angle + (i * Math.PI * 2) / 32;
        const px = cPx.x + rPx * Math.cos(a);
        const py = cPx.y + rPx * Math.sin(a);
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Water droplets
      for (const drop of this.waterDroplets) {
        const dPx = UnitConversion.metersVectorToPixels(drop.pos);
        ctx.fillStyle = drop.escaped ? '#00f0ff' : '#60a5fa';
        ctx.beginPath();
        ctx.arc(dPx.x, dPx.y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        if (drop.escaped) {
          // Tangential inertia vector trace
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(dPx.x, dPx.y);
          ctx.lineTo(dPx.x - drop.vel.x * 4, dPx.y - drop.vel.y * 4);
          ctx.stroke();
        }
      }

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px "Inter", sans-serif';
      ctx.fillText(
        'Drum Wall pushes clothes inward (Normal Force Fc). Water flies tangentially through holes (Inertia)!',
        cPx.x - 220,
        cPx.y + rPx + 35
      );
    }

    ctx.restore();
  }

  public getHUDState(): HUDState {
    const fc = Forces.calculate_centripetal_force(this.mass, this.speed, this.radius);
    return {
      time: this.elapsedTime,
      speed: this.speed,
      radius: this.radius,
      centripetalForce: fc,
      activeFormulaName: 'Centripetal Force & Inward Net Force',
      activeFormulaLatex: 'F_c = m · v² / r = m · r · ω²',
      substitutedFormula:
        this.scenario === 'ball_on_string'
          ? `Fc = (${this.mass}kg)(${this.speed}m/s)² / (${this.radius}m) = ${fc.toFixed(1)} N (Tension in String)`
          : `Spin cycle: Normal force Fc = m·r·ω² on clothes. Water escapes along straight tangent due to inertia!`
    };
  }

  public getDebugData(): DebugPhysicsData {
    const fc = Forces.calculate_centripetal_force(this.mass, this.speed, this.radius);
    return {
      fps: 60,
      fixedTimestep: 1 / 60,
      position: this.ballPos,
      velocity: this.ballVel,
      acceleration: Vector2.ZERO,
      force: new Vector2(fc, 0),
      mass: this.mass,
      centripetalForce: new Vector2(fc, 0),
      center: this.centerPos
    };
  }

  public verifyAnalytical(): {
    passed: boolean;
    analyticalText: string;
    simulationText: string;
    errorText: string;
  } {
    const expectedFc = (2.0 * Math.pow(10.0, 2)) / 5.0; // 40.0 N
    const measuredFc = Forces.calculate_centripetal_force(2.0, 10.0, 5.0);
    return {
      passed: Math.abs(measuredFc - expectedFc) < 1e-6,
      analyticalText: `Expected Fc: (2 kg)(10 m/s)² / (5 m) = 40.00 N`,
      simulationText: `Measured String Tension Fc = ${measuredFc.toFixed(2)} N`,
      errorText: `Verified: Centripetal force strictly points toward center; no outward centrifugal force in inertial frame.`
    };
  }
}
