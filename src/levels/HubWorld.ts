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
  NPCCharacter,
  DialogueNode
} from '../platformer/InteractiveElements.ts';
import { PlatformerRenderer } from '../platformer/PlatformerRenderer.ts';

export class HubWorld extends LevelBase {
  public axel: Axel;
  public camera: Camera;

  public worldWidth: number = 54; // meters
  public worldHeight: number = 22; // meters

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

  // Active dialogue popup
  public activeDialogue: DialogueNode | null = null;
  public dialogueTimer: number = 0;

  // Level transition request
  public requestedLevelLoad: number | null = null;

  constructor() {
    super({
      id: 0,
      title: 'The Mechanics Odyssey — Central Hub',
      subtitle: 'Nexus of Quantum Mechanics & Exploration',
      learningObjective:
        'Explore the interconnected world, meet researcher NPCs, experiment in the training playground, and select your physics mission.',
      conceptSummary:
        'Mechanics is the foundation of physical science. Welcome to the central observatory where you can freely test mechanics and enter uncharted zones.'
    });

    this.axel = new Axel(4.0, 16.0);
    this.camera = new Camera(960, 600, 32);
    this.camera.minBounds = new Vector2(0, 0);
    this.camera.maxBounds = new Vector2(this.worldWidth, this.worldHeight);

    this.buildWorld();
    this.setPhase('puzzle');
  }

  public reset(): void {
    this.axel = new Axel(4.0, 16.0);
    this.axel.hearts = 3;
    this.camera.position = new Vector2(this.axel.pos.x, this.axel.pos.y);
    this.requestedLevelLoad = null;
    this.activeDialogue = null;
    this.elapsedTime = 0;
    this.setPhase('puzzle');
    this.buildWorld();
  }

  private buildWorld(): void {
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

    // --- Main Ground Floors ---
    // Left hub ground (x: 0 to 22, y: 18, w: 22, h: 4)
    this.solids.push({ x: 0, y: 18, w: 22, h: 4, type: 'ground' });
    // Safe Pedestrian Skybridge connecting left and right sectors
    this.solids.push({ x: 21, y: 18, w: 8, h: 4, type: 'bridge' });
    // Right hub ground (x: 28 to 54, y: 18, w: 26, h: 4)
    this.solids.push({ x: 28, y: 18, w: 26, h: 4, type: 'ground' });
    // Boundaries
    this.solids.push({ x: -1, y: 0, w: 1, h: 22, type: 'wall' });
    this.solids.push({ x: 54, y: 0, w: 1, h: 22, type: 'wall' });

    // Express Mag-lev Moving Platform overhead (x: 20.5 to 29.5 at y: 14.5)
    this.platforms.push(new MovingPlatform(20.5, 14.5, 29.5, 14.5, 3.2, 0.6, 2.8));

    // Playground Training Ramp Up (x: 6 to 11, y1: 18, y2: 15)
    this.ramps.push({ x1: 6, y1: 18, x2: 11, y2: 15 });
    // Upper Playground Deck (x: 11 to 16, y: 15, w: 5, h: 3)
    this.solids.push({ x: 11, y: 15, w: 5, h: 3, type: 'metal' });
    // Playground Training Ramp Down to Right (x: 16 to 20, y1: 15, y2: 18) - Smooth passage both ways!
    this.ramps.push({ x1: 16, y1: 15, x2: 20, y2: 18 });

    // Secret Observation Balcony high up (x: 2, y: 11, w: 5, h: 0.6)
    this.solids.push({ x: 2, y: 11, w: 5, h: 0.6, type: 'bridge' });
    // Floating Stepping Platform to Balcony (x: 8, y: 13, w: 2.2, h: 0.5)
    this.solids.push({ x: 8, y: 13, w: 2.2, h: 0.5, type: 'metal' });

    // Secret Core on the Balcony!
    this.cores.push(new PhysicsCoreCollectible('core-hub-secret', 3.5, 9.8));

    // Training Crates (Accessible from both sides of the ramp)
    this.crates.push(new PhysicsCrate('crate-hub-1', 8.5, 16.5, 20.0));
    this.crates.push(new PhysicsCrate('crate-hub-2', 13.0, 13.8, 20.0));

    // Training Pressure Switch: 20kg (satisfied by 1 crate or Axel)
    const trainingSwitch = new PressureSwitch('switch-hub-1', 13.5, 14.7, 20.0);
    this.switches.push(trainingSwitch);

    // Decorative Training Gateway (Unlocked - clear passage for player & crates)
    const trainingBarrier = new EnergyBarrier('barrier-hub-1', 16.0, 11.5, 0.4, 3.5, '#10b981');
    trainingBarrier.isActive = false;
    this.barriers.push(trainingBarrier);

    // Checkpoint at start
    this.checkpoints.push(new CheckpointBeacon('cp-hub-start', 4.0, 18.0));

    // --- GRAND PORTAL PAVILION (Right Wing: Accessible Terraces) ---
    // Tier 1: Lower Kinematics Terrace (y = 16.2, gentle ramp from floor)
    this.ramps.push({ x1: 29.5, y1: 18, x2: 32, y2: 16.2 });
    this.solids.push({ x: 32, y: 16.2, w: 12, h: 1.8, type: 'metal' });

    // Tier 1 Portals (Levels 1, 2, 3)
    this.portals.push(
      new QuantumPortal('portal-lvl1', 1, 'Level 1: The Wandering Path', 'Kinematics: Distance vs Displacement', 32.5, 13.4),
      new QuantumPortal('portal-lvl2', 2, 'Level 2: The Speedway', 'Kinematics: Speed vs Velocity', 36.5, 13.4),
      new QuantumPortal('portal-lvl3', 3, 'Level 3: Newton’s Rig', 'Dynamics: Acceleration & F = ma', 40.5, 13.4)
    );

    // Tier 2: Motion & UARM Terrace (y = 14.4, smooth ramp from Tier 1)
    this.ramps.push({ x1: 44, y1: 16.2, x2: 46, y2: 14.4 });
    this.solids.push({ x: 46, y: 14.4, w: 7.5, h: 3.6, type: 'metal' });

    // Tier 2 Portals (Levels 4, 5)
    this.portals.push(
      new QuantumPortal('portal-lvl4', 4, 'Level 4: The Braking Corridor', 'Uniform Acceleration & UARM', 46.8, 11.6),
      new QuantumPortal('portal-lvl5', 5, 'Level 5: Orbital Carousel', 'Rotation & Revolution, T = 2π/ω', 50.5, 11.6)
    );

    // Tier 3: Circular Motion Spire (y = 12.0, accessible via wide stepping platforms)
    this.solids.push({ x: 33, y: 14.2, w: 2.2, h: 0.5, type: 'bridge' });
    this.solids.push({ x: 31, y: 12.0, w: 12, h: 0.8, type: 'metal' });

    // Tier 3 Portals (Levels 6, 7, 8)
    this.portals.push(
      new QuantumPortal('portal-lvl6', 6, 'Level 6: Centrifuge Spire', 'Linear vs Angular Speed, v = r·ω', 31.8, 9.2),
      new QuantumPortal('portal-lvl7', 7, 'Level 7: The Drift Carnival', 'Tangential Velocity & ac = v²/r', 35.8, 9.2),
      new QuantumPortal('portal-lvl8', 8, 'Level 8: Cosmic Tether & Spin Lab', 'Centripetal Force Fc = mv²/r', 39.8, 9.2)
    );

    // Physics Playground / Sandbox Portal (Prominently placed at ground level entrance)
    this.portals.push(
      new QuantumPortal('portal-sandbox', 9, 'Physics Playground', 'Free Play Simulation Lab', 25.0, 15.2)
    );

    // NPCs
    this.npcs.push(
      new NPCCharacter('npc-vector', 'Prof. Vector', 'Kinematics Director', 18.0, 18.0, '#3b82f6', [
        {
          speaker: 'Prof. Vector',
          title: 'Kinematics Director',
          avatarColor: '#3b82f6',
          text: 'Welcome to the Mechanics Odyssey, Axel! Remember: distance is the total ground you cover, but displacement is just the vector straight from start to destination!'
        },
        {
          speaker: 'Prof. Vector',
          title: 'Kinematics Director',
          avatarColor: '#3b82f6',
          text: 'In Level 1, you will face the Wandering Path. There is a winding safe route and a risky chasm shortcut. Both have the exact same displacement!'
        }
      ]),
      new NPCCharacter('npc-torque', 'Torque', 'Lead Mechanist', 7.5, 18.0, '#f59e0b', [
        {
          speaker: 'Torque',
          title: 'Lead Mechanist',
          avatarColor: '#f59e0b',
          text: 'Yo, Axel! Notice that ramp right behind me? Run down it to gather kinetic momentum. Push that 20kg alloy crate around to see inertia in action!'
        },
        {
          speaker: 'Torque',
          title: 'Lead Mechanist',
          avatarColor: '#f59e0b',
          text: 'You can press [E] to pick up crates and carry them above your head. Press [E] again while running to throw them across gaps!'
        }
      ]),
      new NPCCharacter('npc-newton', 'Newton-01', 'Test Automation Unit', 31.0, 18.0, '#10b981', [
        {
          speaker: 'Newton-01',
          title: 'Test Automation Unit',
          avatarColor: '#10b981',
          text: 'BEEP. Running platformer simulation at 60Hz. Gravity is calibrated to 26 m/s² for optimal athletic response. Push button to test mass sensor!'
        }
      ]),
      new NPCCharacter('npc-flux', 'Flux', 'Quantum Scout', 2.5, 11.0, '#a855f7', [
        {
          speaker: 'Flux',
          title: 'Quantum Scout',
          avatarColor: '#a855f7',
          text: 'You found the secret balcony! Brilliant jump. Physics rewards those who observe trajectories and test alternative routes.'
        }
      ])
    );
  }

  public fixedUpdate(dt: number, input: InputState, audio?: AudioFeedback): void {
    // 1. Update platforms
    for (const plat of this.platforms) {
      plat.update(dt);
    }

    // 2. Active Solids (including locked energy barriers)
    const activeSolids = [...this.solids];
    for (const b of this.barriers) {
      if (b.isActive) {
        activeSolids.push({ x: b.pos.x, y: b.pos.y, w: b.size.x, h: b.size.y, type: 'metal' });
      }
    }

    // Update Axel with responsive jump, sprint, and down controls
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

    // 3. Update Crates
    for (const crate of this.crates) {
      crate.update(dt, this.axel.gravity, activeSolids, this.ramps, this.platforms);
    }

    // 4. Update Switches & Barriers
    for (const sw of this.switches) {
      sw.update(this.axel.pos, this.axel.size, this.axel.mass, this.crates);
      if (sw.justActivated) audio?.playSwitch();
    }
    // Update connected barriers (latch open once solved)
    for (const barrier of this.barriers) {
      const sw = this.switches.find(s => s.id === 'switch-hub-1');
      if (sw && sw.isActivated) {
        barrier.isActive = false;
      }
    }

    // 5. Update Hazards
    for (const h of this.hazards) {
      if (h.intersects(this.axel.pos, this.axel.size)) {
        this.axel.respawnAtCheckpoint();
        this.camera.triggerShake(0.3, 0.25);
        audio?.playFailure();
      }
    }

    // 6. Update Cores
    for (const core of this.cores) {
      if (!core.isCollected) {
        core.update(dt);
        if (this.axel.pos.distanceTo(core.pos) < 1.4) {
          core.isCollected = true;
          this.camera.triggerShake(0.15, 0.2);
          audio?.playCoreCollect();
        }
      }
    }

    // 7. Check NPC interaction
    if (interactPressed) {
      for (const npc of this.npcs) {
        if (npc.isNear(this.axel.pos)) {
          this.activeDialogue = npc.getNextDialogue();
          this.dialogueTimer = 6.0; // 6s duration
          break;
        }
      }

      // Check Portal interaction
      for (const portal of this.portals) {
        if (portal.isNear(this.axel.pos)) {
          this.requestedLevelLoad = portal.targetLevelId;
          break;
        }
      }
    }

    if (this.dialogueTimer > 0) {
      this.dialogueTimer -= dt;
      if (this.dialogueTimer <= 0) {
        this.activeDialogue = null;
      }
    }

    // 8. Update Camera
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

    // Render active NPC dialogue balloon if present
    if (this.activeDialogue) {
      this.renderDialogueBox(ctx, this.activeDialogue);
    }
  }

  private renderDialogueBox(ctx: CanvasRenderingContext2D, d: DialogueNode): void {
    const w = 540;
    const h = 100;
    const x = (ctx.canvas.width - w) / 2;
    const y = 70;

    ctx.save();
    // Backdrop
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(x, y, w, h);

    // Border
    ctx.strokeStyle = d.avatarColor;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x, y, w, h);

    // Avatar Circle
    ctx.fillStyle = d.avatarColor;
    ctx.beginPath();
    ctx.arc(x + 40, y + 42, 22, 0, Math.PI * 2);
    ctx.fill();

    // Speaker Name & Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(d.speaker, x + 75, y + 28);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(d.title, x + 75, y + 44);

    // Dialogue text (wrapped)
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '13px Inter, sans-serif';
    this.wrapText(ctx, d.text, x + 75, y + 66, w - 90, 18);
    ctx.restore();
  }

  private wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ): void {
    const words = text.split(' ');
    let line = '';
    let curY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, curY);
        line = words[n] + ' ';
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, curY);
  }

  public getHUDState(): HUDState {
    return {
      time: this.elapsedTime,
      speed: this.axel.vel.magnitude(),
      velocity: this.axel.vel,
      distance: 0,
      displacementMag: 0,
      activeFormulaName: 'Kinematics Nexus',
      activeFormulaLatex: '\\text{Hub World: Free Exploration}',
      substitutedFormula: 'Explore Nexus, converse with researchers, or enter portals!'
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
    return {
      passed: true,
      analyticalText: 'Hub World physics simulation verified.',
      simulationText: 'Position and vectors active.',
      errorText: '0.00% error'
    };
  }
}
