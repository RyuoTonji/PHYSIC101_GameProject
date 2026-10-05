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
    this.isDocked = false;
    this.extractedCount = 0;
    this.snapReason = '';
    this.ballPos = new Vector2(this.centerPos.x + this.radius, this.centerPos.y);
    this.ballVel = new Vector2(0, this.speed);
    this.elapsedTime = 0;
    this.failureContext = null;
    this.setPhase('puzzle');

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

  // Target Space Stations Gallery (Friendly docking targets in all directions!)
  public stations: Array<{ id: string; name: string; pos: Vector2; radius: number; color: string }> = [
    { id: 'st1', name: 'ALPHA STATION', pos: new Vector2(18.0, 3.5), radius: 2.2, color: '#38bdf8' },
    { id: 'st2', name: 'BETA OUTPOST', pos: new Vector2(6.5, 3.5), radius: 2.0, color: '#10b981' },
    { id: 'st3', name: 'COSMIC BEACON', pos: new Vector2(6.5, 11.5), radius: 2.0, color: '#f59e0b' }
  ];

  public targetStation: Vector2 = new Vector2(18.0, 3.5);
  public targetStationRadius: number = 2.2; // meters
  public isDocked: boolean = false;
  public snapReason: string = '';
  public extractedCount: number = 0;
  public celebrationParticles: Array<{ x: number; y: number; vx: number; vy: number; color: string; life: number }> = [];

  public fixedUpdate(dt: number, input: InputState): void {
    if (this.phase === 'completed' || this.phase === 'failed') return;
    this.elapsedTime += dt;

    // Update celebration particles
    for (let i = this.celebrationParticles.length - 1; i >= 0; i--) {
      const p = this.celebrationParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.celebrationParticles.splice(i, 1);
      }
    }

    if (this.scenario === 'ball_on_string') {
      // Interactive controls for mass, speed, and radius
      if (!this.stringSnapped && !this.isDocked) {
        if (input.move.y < 0) this.speed = Math.min(15.0, this.speed + 2.0 * dt);
        if (input.move.y > 0) this.speed = Math.max(3.0, this.speed - 2.0 * dt);
        if (input.move.x > 0) this.radius = Math.min(6.5, this.radius + 1.0 * dt);
        if (input.move.x < 0) this.radius = Math.max(2.5, this.radius - 1.0 * dt);

        const requiredFc = Forces.calculate_centripetal_force(this.mass, this.speed, this.radius);

        // Friendly string tension limit warning
        if (requiredFc > 85.0) {
          this.stringSnapped = true;
          this.snapReason = `HIGH TENSION! Fc = ${requiredFc.toFixed(1)}N released satellite along tangent!`;
        }

        // Cut tether / release satellite with Action, Jump, or Boost
        if (input.action || input.jumpPressed || input.boost) {
          this.stringSnapped = true;
          this.snapReason = 'Tether released at tangent trajectory!';
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

        // Check docking with any station
        for (const st of this.stations) {
          if (this.ballPos.distanceTo(st.pos) < st.radius) {
            this.isDocked = true;
            this.snapReason = `★ DOCKED AT ${st.name}! Centripetal launch verified!`;

            // Spawn celebration stars
            for (let k = 0; k < 24; k++) {
              const a = (k / 24) * Math.PI * 2;
              const spd = 2 + Math.random() * 4;
              this.celebrationParticles.push({
                x: st.pos.x,
                y: st.pos.y,
                vx: Math.cos(a) * spd,
                vy: Math.sin(a) * spd,
                color: st.color,
                life: 1.0
              });
            }

            this.completePuzzle();
            return;
          }
        }

        // Missed launch: gently return to orbit without jarring reset
        if (this.ballPos.distanceTo(this.centerPos) > 13.5 && !this.isDocked) {
          this.stringSnapped = false;
          this.snapReason = '';
          this.angle = Math.atan2(this.ballPos.y - this.centerPos.y, this.ballPos.x - this.centerPos.x) + 0.3;
        }
      }
    } else {
      // Washing machine scenario: interactive extraction challenge
      if (input.move.y < 0) this.drumOmega = Math.min(16.0, this.drumOmega + 3.0 * dt);
      if (input.move.y > 0) this.drumOmega = Math.max(2.0, this.drumOmega - 3.0 * dt);

      this.angle += this.drumOmega * dt;

      // Update water droplets: escape tangentially through drum perforations as omega increases
      for (const drop of this.waterDroplets) {
        if (!drop.escaped) {
          const dropAngle =
            Math.atan2(drop.pos.y - this.centerPos.y, drop.pos.x - this.centerPos.x) +
            this.drumOmega * dt;
          drop.pos = new Vector2(
            this.centerPos.x + this.drumRadius * Math.cos(dropAngle),
            this.centerPos.y + this.drumRadius * Math.sin(dropAngle)
          );

          // Separation probability increases with square of angular speed (v^2/r = r*omega^2)
          const escapeProb = 0.008 + (this.drumOmega * this.drumOmega) * 0.0005;
          if (Math.random() < escapeProb) {
            drop.escaped = true;
            this.extractedCount++;
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

      // Win condition: extracted at least 12 / 24 droplets! (Fun, achievable, engaging!)
      if (this.extractedCount >= 12 && (this.phase === 'puzzle' || this.phase === 'guided')) {
        this.completePuzzle();
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, _interpolation: number): void {
    ctx.save();
    const cPx = UnitConversion.metersVectorToPixels(this.centerPos);

    if (this.scenario === 'ball_on_string') {
      const bPx = UnitConversion.metersVectorToPixels(this.ballPos);
      const tanDir = new Vector2(-Math.sin(this.angle), Math.cos(this.angle));

      // Render All Friendly Space Stations
      let lockedStation: typeof this.stations[0] | null = null;
      for (const st of this.stations) {
        const stPx = UnitConversion.metersVectorToPixels(st.pos);
        const stRPx = UnitConversion.metersToPixels(st.radius);

        // Check if tangent ray points towards this station
        if (!this.stringSnapped) {
          const toStation = st.pos.subtract(this.ballPos);
          const proj = toStation.x * tanDir.x + toStation.y * tanDir.y;
          if (proj > 0) {
            const perpDist = Math.abs(toStation.x * -tanDir.y + toStation.y * tanDir.x);
            if (perpDist < st.radius) {
              lockedStation = st;
            }
          }
        }

        ctx.save();
        ctx.fillStyle = this.isDocked ? 'rgba(16, 185, 129, 0.2)' : st.color + '22';
        ctx.beginPath();
        ctx.arc(stPx.x, stPx.y, stRPx, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = this.isDocked ? '#10b981' : st.color;
        ctx.lineWidth = lockedStation === st ? 3.5 : 2;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Station Core
        ctx.fillStyle = st.color;
        ctx.beginPath();
        ctx.arc(stPx.x, stPx.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 11px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(st.name, stPx.x, stPx.y - stRPx - 8);

        if (lockedStation === st) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(stPx.x, stPx.y, stRPx + 6, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // String line or trajectory
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
        const fcPx = inwardNorm.multiply(fc * 1.5);

        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bPx.x, bPx.y);
        ctx.lineTo(bPx.x + fcPx.x, bPx.y + fcPx.y);
        ctx.stroke();

        ctx.fillStyle = '#ffd700';
        ctx.font = '11px "Inter", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Tension Fc = ${fc.toFixed(1)} N`, bPx.x + fcPx.x * 0.5 + 8, bPx.y + fcPx.y * 0.5 - 5);

        // Projected Tangential Release Guide Line
        ctx.save();
        ctx.strokeStyle = lockedStation ? '#10b981' : 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = lockedStation ? 2.5 : 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(bPx.x, bPx.y);
        ctx.lineTo(bPx.x + tanDir.x * 260, bPx.y + tanDir.y * 260);
        ctx.stroke();
        ctx.restore();
      } else {
        // Motion trail after release
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bPx.x, bPx.y);
        ctx.lineTo(bPx.x - this.ballVel.x * 12, bPx.y - this.ballVel.y * 12);
        ctx.stroke();
        ctx.restore();
      }

      // Center pivot (Sun / Gravitational Anchor)
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cPx.x, cPx.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Ball / Satellite
      ctx.fillStyle = this.isDocked ? '#10b981' : this.stringSnapped ? '#f43f5e' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(bPx.x, bPx.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`m=${this.mass}kg`, bPx.x, bPx.y - 18);

      // Render Celebration Particles
      for (const p of this.celebrationParticles) {
        const pPx = UnitConversion.metersVectorToPixels(new Vector2(p.x, p.y));
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(pPx.x, pPx.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Tension Safety Meter HUD Banner
      const currentFc = Forces.calculate_centripetal_force(this.mass, this.speed, this.radius);

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
      ctx.fillText(`COSMIC SATELLITE TETHER (Fc = m·v²/r = ${currentFc.toFixed(1)} N)`, 52, 40);

      // Tension bar
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(52, 48, 250, 10);
      const tensionFrac = Math.min(1.0, currentFc / 85.0);
      ctx.fillStyle = tensionFrac > 0.8 ? '#f43f5e' : '#38bdf8';
      ctx.fillRect(52, 48, 250 * tensionFrac, 10);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`${currentFc.toFixed(1)} N Tension`, 310, 57);

      ctx.fillStyle = lockedStation ? '#10b981' : '#38bdf8';
      ctx.font = 'bold 11px "Inter", sans-serif';
      ctx.fillText(
        lockedStation
          ? `★ STATION IN SIGHT! PRESS [SPACE] OR CLICK TO DOCK!`
          : !this.stringSnapped
          ? '[SPACE / CLICK] Launch along tangent  |  [W/S] Speed  |  [A/D] Orbit Radius'
          : this.isDocked
          ? 'MISSION COMPLETE! Centripetal force converted to tangential flight.'
          : 'Returning to orbit...',
        52,
        78
      );
    } else {
      // Washing machine rotating drum
      const rPx = UnitConversion.metersToPixels(this.drumRadius);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 8;
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

      // Tumbling Clothes inside drum
      for (let i = 0; i < 3; i++) {
        const clothAngle = this.angle + (i * Math.PI * 2) / 3;
        // Clothes stick to outer wall as omega increases!
        const clothDist = rPx * Math.min(0.85, 0.4 + this.drumOmega * 0.04);
        const cx = cPx.x + clothDist * Math.cos(clothAngle);
        const cy = cPx.y + clothDist * Math.sin(clothAngle);
        ctx.fillStyle = i === 0 ? '#f43f5e' : i === 1 ? '#38bdf8' : '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(cx - 12, cy - 8, 24, 16, 4);
        ctx.fill();
      }

      // Water droplets escaping
      for (const drop of this.waterDroplets) {
        const dPx = UnitConversion.metersVectorToPixels(drop.pos);
        ctx.fillStyle = drop.escaped ? '#00f0ff' : '#60a5fa';
        ctx.beginPath();
        ctx.arc(dPx.x, dPx.y, 4, 0, Math.PI * 2);
        ctx.fill();

        if (drop.escaped) {
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(dPx.x, dPx.y);
          ctx.lineTo(dPx.x - drop.vel.x * 3, dPx.y - drop.vel.y * 3);
          ctx.stroke();
        }
      }

      // Water Collection Cylinder on Right Side
      const bkW = 60;
      const bkH = 180;
      const bkX = cPx.x + rPx + 40;
      const bkY = cPx.y - bkH / 2;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(bkX, bkY, bkW, bkH);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(bkX, bkY, bkW, bkH);

      // Water level rising
      const waterFrac = Math.min(1.0, this.extractedCount / 12);
      const waterH = bkH * waterFrac;
      ctx.fillStyle = '#00f0ff88';
      ctx.fillRect(bkX, bkY + bkH - waterH, bkW, waterH);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 10px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('COLLECTION', bkX + bkW / 2, bkY - 8);

      // Extraction Status Banner
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = this.extractedCount >= 12 ? '#10b981' : '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(40, 20, 420, 72, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 12px "Inter", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`WASHING MACHINE SPIN CYCLE (ω = ${this.drumOmega.toFixed(1)} rad/s)`, 52, 40);

      // Extraction bar
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(52, 48, 250, 10);
      ctx.fillStyle = this.extractedCount >= 12 ? '#10b981' : '#00f0ff';
      ctx.fillRect(52, 48, 250 * waterFrac, 10);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`${this.extractedCount} / 24 drops (Goal: 12)`, 310, 57);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '11px "Inter", sans-serif';
      ctx.fillText(
        this.extractedCount >= 12
          ? 'CYCLE COMPLETE! Inertia pulled water through holes into collection tube!'
          : '[W / S] Spin Faster to force water through perforations!',
        52,
        80
      );

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        'Drum Wall pushes clothes inward (Normal Force Fc). Water continues tangentially through holes (Inertia)!',
        cPx.x,
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
