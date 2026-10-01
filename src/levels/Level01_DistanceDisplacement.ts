import { LevelBase } from './LevelBase.ts';
import { Vector2 } from '../physics/Vector2.ts';
import { Kinematics } from '../physics/Kinematics.ts';
import { UnitConversion } from '../physics/UnitConversion.ts';
import { InputState } from '../engine/InputManager.ts';
import { HUDState } from '../education/EducationalHUD.ts';
import { DebugPhysicsData } from '../systems/DebugVisualizer.ts';

interface Obstacle {
  x: number; // meters
  y: number;
  width: number;
  height: number;
  name: string;
}

export class Level01_DistanceDisplacement extends LevelBase {
  public startPos: Vector2 = new Vector2(3.0, 11.0);
  public dronePos: Vector2 = new Vector2(3.0, 11.0);
  public droneVel: Vector2 = Vector2.ZERO;
  public droneRadius: number = 0.45; // meters
  public targetPos: Vector2 = new Vector2(18.0, 4.0);
  public targetRadius: number = 1.0; // meters

  public distanceTraveled: number = 0;
  public pathHistory: Vector2[] = [];
  public lastSamplePos: Vector2 = new Vector2(3.0, 11.0);

  public obstacles: Obstacle[] = [
    { x: 7.0, y: 3.0, width: 2.0, height: 7.0, name: 'Pylon Alpha' },
    { x: 12.0, y: 7.0, width: 2.0, height: 8.0, name: 'Pylon Beta' },
    { x: 10.0, y: 1.0, width: 6.0, height: 2.0, name: 'Barrier Top' }
  ];

  constructor() {
    super({
      id: 1,
      title: 'Level 1: Distance vs. Displacement',
      subtitle: 'The Drone Delivery Navigation Challenge',
      learningObjective:
        'Understand that distance is scalar total path length, while displacement is the vector change from initial to final position.',
      conceptSummary:
        'Distance depends entirely on the winding trajectory taken (d = Σ Δs). Displacement depends only on endpoints (Δr⃗ = r⃗f - r⃗i). Magnitude |Δr⃗| ≤ d always!'
    });
    this.reset();
  }

  public reset(): void {
    this.dronePos = new Vector2(this.startPos.x, this.startPos.y);
    this.droneVel = Vector2.ZERO;
    this.distanceTraveled = 0;
    this.pathHistory = [new Vector2(this.startPos.x, this.startPos.y)];
    this.lastSamplePos = new Vector2(this.startPos.x, this.startPos.y);
    this.elapsedTime = 0;
    this.failureContext = null;
  }

  public fixedUpdate(dt: number, input: InputState): void {
    if (this.phase === 'completed' || this.phase === 'failed') return;
    this.elapsedTime += dt;

    if (this.phase === 'demo') {
      // Scripted demo: Drone flies 10m East, then 10m North (syllabus benchmark)
      const demoSpeed = 4.0; // m/s
      if (this.elapsedTime < 2.5) {
        // Fly East: 4 m/s * 2.5s = 10m East
        this.droneVel = new Vector2(demoSpeed, 0);
      } else if (this.elapsedTime < 5.0) {
        // Fly North (up in Cartesian, -y in canvas): 4 m/s * 2.5s = 10m North
        this.droneVel = new Vector2(0, -demoSpeed);
      } else {
        this.droneVel = Vector2.ZERO;
      }
    } else {
      // Player manual control with responsive thruster acceleration
      const thrustForce = input.boost ? 26.0 : 18.0; // m/s^2 acceleration
      const maxSpeed = input.boost ? 10.0 : 7.5; // m/s
      const damping = 0.95; // atmospheric drag

      if (input.move.magnitudeSquared() > 0) {
        const accel = input.move.multiply(thrustForce * dt);
        this.droneVel = this.droneVel.add(accel);
        if (this.droneVel.magnitude() > maxSpeed) {
          this.droneVel = this.droneVel.normalize().multiply(maxSpeed);
        }
      } else {
        this.droneVel = this.droneVel.multiply(damping);
      }

      if (input.brake) {
        this.droneVel = this.droneVel.multiply(0.80);
      }
    }

    // Step position
    const nextPos = this.dronePos.add(this.droneVel.multiply(dt));

    // Collision check against level boundaries (0 to 24m X, 0 to 15m Y)
    const clampedX = Math.max(0.5, Math.min(23.5, nextPos.x));
    const clampedY = Math.max(0.5, Math.min(14.5, nextPos.y));
    this.dronePos = new Vector2(clampedX, clampedY);

    // Collision check with obstacles
    for (const obs of this.obstacles) {
      if (
        this.dronePos.x + this.droneRadius > obs.x &&
        this.dronePos.x - this.droneRadius < obs.x + obs.width &&
        this.dronePos.y + this.droneRadius > obs.y &&
        this.dronePos.y - this.droneRadius < obs.y + obs.height
      ) {
        // Elastic rebound
        this.droneVel = this.droneVel.multiply(-0.5);
      }
    }

    // Accumulate path length (Distance)
    const stepDist = this.dronePos.distanceTo(this.lastSamplePos);
    if (stepDist >= 0.05) {
      this.distanceTraveled += stepDist;
      this.lastSamplePos = new Vector2(this.dronePos.x, this.dronePos.y);
      this.pathHistory.push(new Vector2(this.dronePos.x, this.dronePos.y));
      if (this.pathHistory.length > 500) {
        this.pathHistory.shift();
      }
    }

    // Check target docking (in puzzle / challenge mode)
    if (this.phase === 'puzzle' || this.phase === 'challenge' || this.phase === 'guided') {
      const distToDock = this.dronePos.distanceTo(this.targetPos);
      if (distToDock <= this.targetRadius + 0.3 && this.droneVel.magnitude() < 2.5) {
        this.completePuzzle();
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, _interpolation: number): void {
    ctx.save();

    // 1. Grid background (1m grid)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 24; x++) {
      const px = UnitConversion.metersToPixels(x);
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, UnitConversion.metersToPixels(15));
      ctx.stroke();
    }
    for (let y = 0; y <= 15; y++) {
      const py = UnitConversion.metersToPixels(y);
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(UnitConversion.metersToPixels(24), py);
      ctx.stroke();
    }

    // 2. Obstacles
    for (const obs of this.obstacles) {
      const ox = UnitConversion.metersToPixels(obs.x);
      const oy = UnitConversion.metersToPixels(obs.y);
      const ow = UnitConversion.metersToPixels(obs.width);
      const oh = UnitConversion.metersToPixels(obs.height);

      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.lineWidth = 2;
      ctx.fillRect(ox, oy, ow, oh);
      ctx.strokeRect(ox, oy, ow, oh);

      // Warning stripes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '10px "Inter", sans-serif';
      ctx.fillText(obs.name, ox + 6, oy + 16);
    }

    // 3. Start Dock
    const sx = UnitConversion.metersToPixels(this.startPos.x);
    const sy = UnitConversion.metersToPixels(this.startPos.y);
    ctx.beginPath();
    ctx.arc(sx, sy, UnitConversion.metersToPixels(0.8), 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#60a5fa';
    ctx.font = '11px "Inter", sans-serif';
    ctx.fillText('START (ri)', sx - 22, sy + 25);

    // 4. Destination Dock
    const tx = UnitConversion.metersToPixels(this.targetPos.x);
    const ty = UnitConversion.metersToPixels(this.targetPos.y);
    ctx.beginPath();
    ctx.arc(tx, ty, UnitConversion.metersToPixels(this.targetRadius), 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 4]);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#34d399';
    ctx.fillText('TARGET DOCK (rf)', tx - 35, ty + 30);

    // 5. Winding Path Traveled (Distance trail)
    if (this.pathHistory.length > 1) {
      ctx.beginPath();
      const first = UnitConversion.metersVectorToPixels(this.pathHistory[0]);
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i < this.pathHistory.length; i++) {
        const pt = UnitConversion.metersVectorToPixels(this.pathHistory[i]);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.75)'; // Amber/Gold distance trail
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // 6. Direct Displacement Vector (Arrow from start to current drone pos)
    const curPx = UnitConversion.metersVectorToPixels(this.dronePos);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(curPx.x, curPx.y);
    ctx.strokeStyle = '#00f0ff'; // Cyan direct displacement
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw displacement arrowhead
    const dAngle = Math.atan2(curPx.y - sy, curPx.x - sx);
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(curPx.x, curPx.y);
    ctx.lineTo(curPx.x - 12 * Math.cos(dAngle - Math.PI / 6), curPx.y - 12 * Math.sin(dAngle - Math.PI / 6));
    ctx.lineTo(curPx.x - 12 * Math.cos(dAngle + Math.PI / 6), curPx.y - 12 * Math.sin(dAngle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // 7. Drone Quadcopter
    ctx.save();
    ctx.translate(curPx.x, curPx.y);
    const heading = this.droneVel.magnitude() > 0.1 ? this.droneVel.angle() : 0;
    ctx.rotate(heading);

    // Body
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, UnitConversion.metersToPixels(this.droneRadius), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rotors
    const rotorOffsets = [
      { x: 14, y: 14 },
      { x: -14, y: 14 },
      { x: 14, y: -14 },
      { x: -14, y: -14 }
    ];
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    rotorOffsets.forEach(ro => {
      ctx.beginPath();
      ctx.arc(ro.x, ro.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
    ctx.restore();
  }

  public getHUDState(): HUDState {
    const disp = Kinematics.calculate_displacement_vector(this.startPos, this.dronePos);
    const dispMag = disp.magnitude();
    // Angle in standard Cartesian (counterclockwise from East)
    const dispAngle = UnitConversion.radiansToDegrees(Math.atan2(-disp.y, disp.x));

    return {
      time: this.elapsedTime,
      distance: this.distanceTraveled,
      displacement: disp,
      displacementMag: dispMag,
      displacementAngle: dispAngle < 0 ? dispAngle + 360 : dispAngle,
      speed: this.droneVel.magnitude(),
      activeFormulaName: 'Displacement Vector & Magnitude',
      activeFormulaLatex: '|Δr⃗| = √[(xf - xi)² + (yf - yi)²]',
      substitutedFormula: `|Δr⃗| = √[(${this.dronePos.x.toFixed(1)} - ${this.startPos.x.toFixed(1)})² + (${this.dronePos.y.toFixed(1)} - ${this.startPos.y.toFixed(1)})²] = ${dispMag.toFixed(2)} m (Distance = ${this.distanceTraveled.toFixed(2)} m)`
    };
  }

  public getDebugData(): DebugPhysicsData {
    return {
      fps: 60,
      fixedTimestep: 1 / 60,
      position: this.dronePos,
      velocity: this.droneVel,
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
    const disp = Kinematics.calculate_displacement_vector(this.startPos, this.dronePos);
    const analyticalDispMag = Math.sqrt(
      Math.pow(this.dronePos.x - this.startPos.x, 2) +
      Math.pow(this.dronePos.y - this.startPos.y, 2)
    );
    const measuredDispMag = disp.magnitude();
    const error = Math.abs(measuredDispMag - analyticalDispMag);

    return {
      passed: error < 1e-5 && this.distanceTraveled >= measuredDispMag - 1e-5,
      analyticalText: `Analytical |Δr⃗| = ${analyticalDispMag.toFixed(4)} m`,
      simulationText: `Simulation |Δr⃗| = ${measuredDispMag.toFixed(4)} m | Distance = ${this.distanceTraveled.toFixed(4)} m`,
      errorText: `Displacement Error = ${error.toFixed(6)} m. Invariant Verified: Distance (${this.distanceTraveled.toFixed(2)} m) ≥ Displacement (${measuredDispMag.toFixed(2)} m)`
    };
  }
}
