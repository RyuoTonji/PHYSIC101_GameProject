import { LevelBase } from './LevelBase.ts';
import { Vector2 } from '../physics/Vector2.ts';
import { InputState } from '../engine/InputManager.ts';
import { AudioFeedback } from '../engine/AudioFeedback.ts';
import { HUDState } from '../education/EducationalHUD.ts';
import { DebugPhysicsData } from '../systems/DebugVisualizer.ts';
import { Axel } from '../platformer/Axel.ts';
import { Camera } from '../platformer/Camera.ts';
import { SolidBox, RampSlope } from '../platformer/WorldGeometry.ts';
import { MovingPlatform } from '../platformer/MovingPlatform.ts';
import { PhysicsCrate } from '../platformer/PhysicsCrate.ts';
import {
  PressureSwitch,
  EnergyBarrier,
  QuantumHazard,
  PhysicsCoreCollectible,
  CheckpointBeacon,
  QuantumPortal,
  NPCCharacter
} from '../platformer/InteractiveElements.ts';
import { PlatformerRenderer } from '../platformer/PlatformerRenderer.ts';

export class Level01_DistanceDisplacement extends LevelBase {
  public axel: Axel;
  public camera: Camera;

  public worldWidth: number = 56; // meters
  public worldHeight: number = 22; // meters

  public startPos: Vector2 = new Vector2(3.0, 16.0);
  public summitPos: Vector2 = new Vector2(49.0, 6.0);
  public lastSamplePos: Vector2 = new Vector2(3.0, 16.0);
  public distanceTraveled: number = 0; // scalar distance (m)
  public pathHistory: Vector2[] = [];

  public solids: SolidBox[] = [];
  public ramps: RampSlope[] = [];
  public platforms: MovingPlatform[] = [];
  public crates: PhysicsCrate[] = [];
  public switches: PressureSwitch[] = [];
  public barriers: EnergyBarrier[] = [];
  public hazards: QuantumHazard[] = [];
  public cores: PhysicsCoreCollectible[] = [];
  public checkpoints: CheckpointBeacon[] = [];
  public portals: QuantumPortal[] = [];
  public npcs: NPCCharacter[] = [];

  // Victory celebration state
  public isCompleted: boolean = false;
  public victoryTimer: number = 0;
  public requestedLevelLoad: number | null = null;

  constructor() {
    super({
      id: 1,
      title: 'Level 1: The Wandering Path',
      subtitle: 'Distance vs. Displacement Adventure',
      learningObjective:
        'Discover that distance is total path length traveled (d = Σ Δs), while displacement is the direct straight-line vector from start to finish (Δr⃗ = r⃗f - r⃗i).',
      conceptSummary:
        'Distance is a scalar that accumulates every step, curve, and detour. Displacement is a vector that cares only about where you began and where you ended. Notice how taking the winding safe road results in high distance, while taking the dangerous chasm shortcut covers the exact same displacement!'
    });

    this.axel = new Axel(this.startPos.x, this.startPos.y);
    this.camera = new Camera(960, 600, 32);
    this.camera.minBounds = new Vector2(0, 0);
    this.camera.maxBounds = new Vector2(this.worldWidth, this.worldHeight);

    this.buildLevelGeometry();
    this.setPhase('puzzle');
  }

  public reset(): void {
    this.axel = new Axel(this.startPos.x, this.startPos.y);
    this.axel.resetHealth();
    this.camera.position = new Vector2(this.axel.pos.x, this.axel.pos.y);
    this.distanceTraveled = 0;
    this.lastSamplePos = new Vector2(this.startPos.x, this.startPos.y);
    this.pathHistory = [new Vector2(this.startPos.x, this.startPos.y)];
    this.isCompleted = false;
    this.victoryTimer = 0;
    this.requestedLevelLoad = null;
    this.elapsedTime = 0;
    this.setPhase('puzzle');
    this.buildLevelGeometry();
  }

  private buildLevelGeometry(): void {
    this.solids = [];
    this.ramps = [];
    this.platforms = [];
    this.crates = [];
    this.switches = [];
    this.barriers = [];
    this.hazards = [];
    this.cores = [];
    this.checkpoints = [];
    this.portals = [];
    this.npcs = [];

    // Outer Boundaries
    this.solids.push({ x: -1, y: 0, w: 1, h: 22, type: 'wall' });
    this.solids.push({ x: 56, y: 0, w: 1, h: 22, type: 'wall' });

    // Section 1: Base Camp Platform (x: 0 to 12, y: 18, w: 12, h: 4)
    this.solids.push({ x: 0, y: 18, w: 12, h: 4, type: 'ground' });

    // ROUTE A: The Safe Winding Path (Terraced Stepping Traverse)
    // Terrace 1: x: 12 to 17, y: 18.5, w: 5, h: 3.5
    this.solids.push({ x: 12, y: 18.5, w: 5, h: 3.5, type: 'ground' });
    // Terrace 2: x: 17 to 23, y: 19.0, w: 6, h: 3.0
    this.solids.push({ x: 17, y: 19.0, w: 6, h: 3.0, type: 'ground' });
    
    // Contained Chasm Gap (x: 23 to 27) with Stepping Platform in middle
    this.solids.push({ x: 24.2, y: 18.2, w: 1.8, h: 0.6, type: 'metal' });
    
    // Valley Floor continuation: x: 27 to 36, y: 18.5, w: 9, h: 3.5
    this.solids.push({ x: 27, y: 18.5, w: 9, h: 3.5, type: 'ground' });
    // Stepping Riser 1: x: 36 to 40, y: 16.0, w: 4, h: 6.0
    this.solids.push({ x: 36, y: 16.0, w: 4, h: 6.0, type: 'ground' });
    // Stepping Riser 2: x: 40 to 44, y: 13.5, w: 4, h: 8.5
    this.solids.push({ x: 40, y: 13.5, w: 4, h: 8.5, type: 'ground' });
    // Summit Approach Ramp (x: 44 to 48, y1: 13.5, y2: 10.0)
    this.ramps.push({ x1: 44, y1: 13.5, x2: 48, y2: 10.0 });
    // Summit Plateau (x: 48 to 56, y: 10.0, w: 8, h: 12.0)
    this.solids.push({ x: 48, y: 10.0, w: 8, h: 12.0, type: 'ground' });

    // ROUTE B: The Mag-Lev Chasm Shortcut (Upper Path)
    // Upper Starting Ledge: x: 8 to 14, y: 15.0, w: 6, h: 0.8 (easily reached by jumping from Base Camp)
    this.solids.push({ x: 8, y: 15.0, w: 6, h: 0.8, type: 'metal' });
    // Floating Pillar 1: x: 17, y: 13.5, w: 3.0, h: 0.8
    this.solids.push({ x: 17, y: 13.5, w: 3.0, h: 0.8, type: 'metal' });
    // Moving Platform over the Rift: translates between (22, 12.5) and (29, 12.5)
    this.platforms.push(new MovingPlatform(22.0, 12.5, 29.0, 12.5, 3.2, 0.6, 2.5));
    // Floating Pillar 2 (Mid Checkpoint Ledge): x: 31, y: 11.5, w: 4.0, h: 0.8
    this.solids.push({ x: 31, y: 11.5, w: 4.0, h: 0.8, type: 'metal' });

    // ROUTE C: The Momentum Ramp & Crate Puzzle Shortcut
    // Steep Momentum Ramp: x: 3 to 7, y1: 11.5, y2: 15.0
    this.ramps.push({ x1: 3, y1: 11.5, x2: 7, y2: 15.0 });
    // High Launch Platform: x: 0.5 to 3, y: 11.5, w: 2.5, h: 0.8
    this.solids.push({ x: 0.5, y: 11.5, w: 2.5, h: 0.8, type: 'metal' });

    // Puzzle Barrier blocking the Upper Shortcut Tunnel to the Summit
    const shortcutBarrier = new EnergyBarrier('barrier-lvl1', 37.0, 7.5, 0.5, 4.0, '#ef4444');
    this.barriers.push(shortcutBarrier);

    // 20kg Pressure Switch: satisfied by placing the 20kg crate!
    const puzzleSwitch = new PressureSwitch('switch-lvl1', 34.0, 11.2, 20.0);
    this.switches.push(puzzleSwitch);

    // Quantum Crates (20kg each, can be placed gently with E or thrown!)
    this.crates.push(new PhysicsCrate('crate-lvl1-1', 9.5, 13.5, 20.0));
    this.crates.push(new PhysicsCrate('crate-lvl1-2', 5.0, 16.5, 20.0));

    // Fair, well-defined Quantum Hazard in the deep pit under the bridge
    this.hazards.push(new QuantumHazard('hazard-rift-1', 23.0, 20.0, 4.0, 2.0, 'Abyssal Rift: Leap across the stepping platform!'));

    // Checkpoints
    const cpStart = new CheckpointBeacon('cp-lvl1-start', 3.0, 18.0);
    cpStart.isActive = true;
    this.checkpoints.push(cpStart);
    this.checkpoints.push(new CheckpointBeacon('cp-lvl1-mid', 33.0, 11.5));
    this.checkpoints.push(new CheckpointBeacon('cp-lvl1-summit', 49.0, 10.0));

    // Collectible Physics Cores
    this.cores.push(new PhysicsCoreCollectible('core-lvl1-safe', 29.0, 17.0)); // along safe road
    this.cores.push(new PhysicsCoreCollectible('core-lvl1-risky', 25.5, 10.5)); // above moving platform
    this.cores.push(new PhysicsCoreCollectible('core-lvl1-secret', 1.5, 10.0)); // high momentum ledge

    // Return Portal to Hub at Base Camp
    this.portals.push(
      new QuantumPortal('portal-return-hub', 0, 'Return to Hub', 'Central Mechanics Odyssey Nexus', 1.0, 15.2)
    );

    // Summit Beacon / Return Portal
    this.portals.push(
      new QuantumPortal('portal-summit-hub', 0, 'Mission Complete', 'Return Victorious to Central Hub', 52.0, 7.2)
    );
  }

  public fixedUpdate(dt: number, input: InputState, audio?: AudioFeedback): void {
    this.elapsedTime += dt;

    // 1. Update platforms
    for (const plat of this.platforms) {
      plat.update(dt);
    }

    // 2. Active Solids (including locked puzzle barrier)
    const activeSolids = [...this.solids];
    for (const b of this.barriers) {
      if (b.isActive) {
        activeSolids.push({ x: b.pos.x, y: b.pos.y, w: b.size.x, h: b.size.y, type: 'metal' });
      }
    }

    // Update Axel with responsive controls
    const moveX = input.move.x;
    const moveY = input.move.y;
    const jumpPressed = input.jumpPressed;
    const jumpHeld = input.jump;
    const interactPressed = Boolean(input.actionPressed ?? input.action);

    const axelEvents = this.axel.update(
      dt,
      {
        left: moveX < -0.2,
        right: moveX > 0.2,
        down: moveY > 0.2,
        jumpPressed: Boolean(jumpPressed),
        jumpHeld: Boolean(jumpHeld),
        sprint: Boolean(input.sprint),
        interactPressed
      },
      activeSolids,
      this.ramps,
      this.platforms,
      this.crates
    );

    if (axelEvents.jumped) audio?.playJump();
    if (axelEvents.landed) audio?.playLanding();
    if (axelEvents.pickedUpCrate) audio?.playPickup();
    if (axelEvents.threwCrate || axelEvents.placedCrate) audio?.playThrow();

    // 3. Accumulate Path Distance & Track Displacement
    const stepDist = this.axel.pos.distanceTo(this.lastSamplePos);
    if (stepDist >= 0.05) {
      this.distanceTraveled += stepDist;
      this.lastSamplePos = new Vector2(this.axel.pos.x, this.axel.pos.y);
      this.pathHistory.push(new Vector2(this.axel.pos.x, this.axel.pos.y));
      if (this.pathHistory.length > 500) {
        this.pathHistory.shift();
      }
    }

    // 4. Update Crates
    for (const crate of this.crates) {
      crate.update(dt, this.axel.gravity, activeSolids, this.ramps, this.platforms);
    }

    // 5. Update Switches & Barriers
    for (const sw of this.switches) {
      sw.update(this.axel.pos, this.axel.size, this.axel.mass, this.crates);
      if (sw.justActivated) audio?.playSwitch();
    }
    // Update connected barrier (latches open once solved)
    const pzSwitch = this.switches.find(s => s.id === 'switch-lvl1');
    const pzBarrier = this.barriers.find(b => b.id === 'barrier-lvl1');
    if (pzSwitch && pzBarrier && pzSwitch.isActivated) {
      pzBarrier.isActive = false;
    }

    // 6. Update Hazards & Checkpoint Respawn
    for (const h of this.hazards) {
      if (h.intersects(this.axel.pos, this.axel.size)) {
        const isDead = this.axel.takeDamage();
        this.camera.triggerShake(0.35, 0.3);
        audio?.playFailure();
        if (isDead) {
          this.fail({
            levelId: 1,
            reason: 'out_of_bounds',
            details: 'Axel ran out of energy in the quantum chasm.'
          });
        }
      }
    }

    // 7. Update Checkpoints
    for (const cp of this.checkpoints) {
      if (!cp.isActive && this.axel.pos.distanceTo(cp.pos) < 2.0) {
        // Deactivate older checkpoints
        for (const other of this.checkpoints) other.isActive = false;
        cp.isActive = true;
        this.axel.lastCheckpoint = new Vector2(cp.pos.x, cp.pos.y - 1.5);
        this.camera.triggerShake(0.1, 0.15);
        audio?.playSwitch();
      }
    }

    // 8. Update Cores
    for (const core of this.cores) {
      if (!core.isCollected) {
        core.update(dt);
        if (this.axel.pos.distanceTo(core.pos) < 1.4) {
          core.isCollected = true;
          this.camera.triggerShake(0.2, 0.2);
          audio?.playCoreCollect();
        }
      }
    }

    // 9. Check Victory Condition (Reaching Summit Beacon)
    const distToSummit = this.axel.pos.distanceTo(this.summitPos);
    if (!this.isCompleted && distToSummit < 3.0 && (this.phase === 'puzzle' || this.phase === 'guided')) {
      this.isCompleted = true;
      this.completePuzzle();
      audio?.playSuccess();
    }

    // 10. Check Portal interaction
    if (interactPressed) {
      for (const portal of this.portals) {
        if (portal.isNear(this.axel.pos)) {
          this.requestedLevelLoad = portal.targetLevelId;
          break;
        }
      }
    }

    // 11. Update Camera
    this.camera.update(this.axel.pos, this.axel.vel, dt);
  }

  public render(ctx: CanvasRenderingContext2D, _interpolation: number): void {
    PlatformerRenderer.renderWorld(
      ctx,
      this.camera,
      this.worldWidth,
      this.worldHeight,
      this.solids,
      this.ramps,
      this.platforms,
      this.crates,
      this.switches,
      this.barriers,
      this.hazards,
      this.cores,
      this.checkpoints,
      this.portals,
      this.npcs,
      this.axel,
      true, // show vectors
      false, // show hitboxes
      this.config.title,
      this.config.learningObjective
    );

    // Draw Axel's real-time breadcrumb path history (Distance vs Displacement visualization!)
    this.drawPathAndDisplacementOverlay(ctx);

    // Draw Victory banner if completed
    if (this.isCompleted) {
      this.renderVictoryOverlay(ctx);
    }
  }

  private drawPathAndDisplacementOverlay(ctx: CanvasRenderingContext2D): void {
    if (this.pathHistory.length < 2) return;

    ctx.save();
    // 1. Winding path traveled (Orange dotted trail: Distance)
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.65)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    const firstScreen = this.camera.worldToScreen(this.pathHistory[0]);
    ctx.moveTo(firstScreen.x, firstScreen.y);
    for (let i = 1; i < this.pathHistory.length; i++) {
      const sp = this.camera.worldToScreen(this.pathHistory[i]);
      ctx.lineTo(sp.x, sp.y);
    }
    ctx.stroke();

    // 2. Direct displacement vector (Subtle cyan dashed radar vector with arrow)
    const startScreen = this.camera.worldToScreen(this.startPos);
    const axelCenter = new Vector2(this.axel.pos.x + this.axel.size.x * 0.5, this.axel.pos.y + this.axel.size.y * 0.5);
    const axelScreen = this.camera.worldToScreen(axelCenter);
    const dispMag = this.startPos.distanceTo(axelCenter);

    if (dispMag > 0.5) {
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(startScreen.x, startScreen.y);
      ctx.lineTo(axelScreen.x, axelScreen.y);
      ctx.stroke();

      // Clean arrowhead
      const angle = Math.atan2(axelScreen.y - startScreen.y, axelScreen.x - startScreen.x);
      ctx.setLineDash([]);
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.moveTo(axelScreen.x, axelScreen.y);
      ctx.lineTo(axelScreen.x - 9 * Math.cos(angle - 0.35), axelScreen.y - 9 * Math.sin(angle - 0.35));
      ctx.lineTo(axelScreen.x - 9 * Math.cos(angle + 0.35), axelScreen.y - 9 * Math.sin(angle + 0.35));
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  private renderVictoryOverlay(ctx: CanvasRenderingContext2D): void {
    const w = 520;
    const h = 170;
    const x = (ctx.canvas.width - w) / 2;
    const y = 80;

    ctx.save();
    // Backdrop
    ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
    ctx.fillRect(x, y, w, h);

    // Glowing border
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);

    // Victory Title
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MISSION COMPLETE: SUMMIT REACHED!', x + w / 2, y + 32);

    // Stats
    const disp = this.axel.pos.distanceTo(this.startPos);
    ctx.fillStyle = '#ffffff';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText(`Total Path Distance: ${this.distanceTraveled.toFixed(1)} m   |   Net Displacement: ${disp.toFixed(1)} m`, x + w / 2, y + 60);

    // Educational Insight
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Notice: Regardless of detours, shortcuts, or backtracking,', x + w / 2, y + 84);
    ctx.fillText('Displacement Δr⃗ = r⃗f - r⃗i depends ONLY on your start and endpoints!', x + w / 2, y + 102);

    // Action button prompt
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.fillText('STEP INTO THE SUMMIT PORTAL OR PRESS [R] TO RETRY DIFFERENT ROUTES', x + w / 2, y + 140);
    ctx.restore();
  }

  public getHUDState(): HUDState {
    const dispVec = this.axel.pos.subtract(this.startPos);
    const dispMag = dispVec.magnitude();
    const dispAngle = (Math.atan2(-dispVec.y, dispVec.x) * 180) / Math.PI;

    return {
      time: this.elapsedTime,
      distance: this.distanceTraveled,
      displacement: dispVec,
      displacementMag: dispMag,
      displacementAngle: dispAngle,
      speed: this.axel.vel.magnitude(),
      velocity: this.axel.vel,
      activeFormulaName: 'Distance vs. Displacement',
      activeFormulaLatex: 'd = \\sum |\\Delta s| \\quad \\ge \\quad |\\Delta \\vec{r}| = |\\vec{r}_f - \\vec{r}_i|',
      substitutedFormula: `d = ${this.distanceTraveled.toFixed(1)} m, |Δr| = ${dispMag.toFixed(1)} m (Ratio: ${(this.distanceTraveled / Math.max(0.01, dispMag)).toFixed(2)}x)`
    };
  }

  public getDebugData(): DebugPhysicsData {
    return {
      fps: 60,
      fixedTimestep: 1 / 60,
      position: this.axel.pos,
      velocity: this.axel.vel,
      acceleration: Vector2.ZERO,
      force: Vector2.ZERO,
      mass: this.axel.mass
    };
  }

  public verifyAnalytical(): { passed: boolean; analyticalText: string; simulationText: string; errorText: string } {
    const dispMag = this.axel.pos.subtract(this.startPos).magnitude();
    const passed = this.distanceTraveled >= dispMag - 0.01;
    return {
      passed,
      analyticalText: `Displacement magnitude |Δr| = ${dispMag.toFixed(2)} m`,
      simulationText: `Accumulated distance d = ${this.distanceTraveled.toFixed(2)} m`,
      errorText: passed
        ? `Physics Verified: d >= |Δr| strictly holds (Ratio: ${(this.distanceTraveled / Math.max(0.01, dispMag)).toFixed(2)}x)`
        : 'Physical Violation: Distance cannot be less than displacement!'
    };
  }
}
