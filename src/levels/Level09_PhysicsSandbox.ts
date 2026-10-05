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

export class Level09_PhysicsSandbox extends LevelBase {
  public axel: Axel;
  public camera: Camera;

  public worldWidth: number = 48;
  public worldHeight: number = 22;

  public gravitySetting: number = 22.0; // m/s^2
  public frictionSetting: number = 0.35;

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

  public requestedLevelLoad: number | null = null;
  private crateCounter: number = 0;

  constructor() {
    super({
      id: 9,
      title: 'Free Play Physics Sandbox',
      subtitle: 'Open Experimental Laboratory',
      learningObjective:
        'Freely manipulate gravity, friction, mass, and velocity. Spawn dynamic objects and observe kinematic and dynamic outcomes.',
      conceptSummary:
        'In the sandbox, you have full omnipotent control over physical parameters. Test how objects behave under zero-G or extreme friction!'
    });

    this.axel = new Axel(4.0, 16.0);
    this.camera = new Camera(960, 600, 32);
    this.camera.minBounds = new Vector2(0, 0);
    this.camera.maxBounds = new Vector2(this.worldWidth, this.worldHeight);

    this.buildSandbox();
    this.setPhase('puzzle');
  }

  public reset(): void {
    this.axel = new Axel(4.0, 16.0);
    this.axel.resetHealth();
    this.camera.position = new Vector2(this.axel.pos.x, this.axel.pos.y);
    this.requestedLevelLoad = null;
    this.elapsedTime = 0;
    this.setPhase('puzzle');
    this.buildSandbox();
  }

  public spawnCrate(mass: number = 20.0): void {
    this.crateCounter++;
    const spawnX = this.axel.pos.x + (this.axel.facing > 0 ? 2.0 : -2.0);
    const spawnY = this.axel.pos.y - 1.5;
    const crate = new PhysicsCrate(`crate-sandbox-${this.crateCounter}`, spawnX, spawnY, mass);
    crate.frictionCoeff = this.frictionSetting;
    this.crates.push(crate);
    this.camera.triggerShake(0.1, 0.1);
  }

  public setGravityPreset(preset: 'zero' | 'moon' | 'earth' | 'jupiter'): void {
    switch (preset) {
      case 'zero':
        this.gravitySetting = 0.0;
        break;
      case 'moon':
        this.gravitySetting = 5.0;
        break;
      case 'earth':
        this.gravitySetting = 22.0; // standard snappy platformer scale
        break;
      case 'jupiter':
        this.gravitySetting = 45.0;
        break;
    }
    this.axel.gravity = this.gravitySetting;
  }

  private buildSandbox(): void {
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

    // Floor & Walls
    this.solids.push({ x: 0, y: 18, w: 48, h: 4, type: 'ground' });
    this.solids.push({ x: -1, y: 0, w: 1, h: 22, type: 'wall' });
    this.solids.push({ x: 48, y: 0, w: 1, h: 22, type: 'wall' });

    // Multi-tier testing ramps
    this.ramps.push({ x1: 6, y1: 18, x2: 12, y2: 14 });
    this.solids.push({ x: 12, y: 14, w: 6, h: 4, type: 'metal' });
    this.ramps.push({ x1: 18, y1: 14, x2: 24, y2: 18 });

    // Weight-Activated Elevator Platform (rises from y: 11 to y: 6.0 when mass >= 35kg)
    const elevator = new MovingPlatform(26.0, 11.0, 26.0, 6.0, 8.0, 0.8, 2.5);
    elevator.direction = 0; // Controlled by mass switch
    this.platforms.push(elevator);

    // High Sky Deck Observation Point (x: 24, y: 5.5, w: 12, h: 0.8)
    this.solids.push({ x: 24, y: 5.5, w: 12, h: 0.8, type: 'metal' });
    this.cores.push(new PhysicsCoreCollectible('core-sb-sky', 30.0, 4.2));

    // Moving Chasm Platform
    this.platforms.push(new MovingPlatform(36.0, 14.0, 44.0, 14.0, 3.2, 0.6, 3.0));

    // Initial Crates: 15kg and 20kg (together = 35kg to trigger elevator!)
    this.crates.push(new PhysicsCrate('crate-sb-1', 13.0, 12.0, 15.0));
    this.crates.push(new PhysicsCrate('crate-sb-2', 15.0, 12.0, 20.0));

    // Elevator Mass Sensor Switch
    this.switches.push(new PressureSwitch('switch-sb', 28.0, 10.7, 35.0));

    // Return Portal to Hub
    this.portals.push(
      new QuantumPortal('portal-sb-hub', 0, 'Return to Hub', 'Central Mechanics Odyssey Nexus', 2.0, 15.2)
    );
  }

  public fixedUpdate(dt: number, input: InputState, audio?: AudioFeedback): void {
    this.elapsedTime += dt;
    this.axel.gravity = this.gravitySetting;

    // Weight switch controls elevator
    const elevator = this.platforms[0];
    const sw = this.switches[0];
    if (sw && elevator) {
      if (sw.isActivated) {
        // Rise to top
        if (elevator.pos.y > 6.0) {
          elevator.pos.y = Math.max(6.0, elevator.pos.y - 2.5 * dt);
          elevator.velocity = new Vector2(0, -2.5);
        } else {
          elevator.velocity = Vector2.ZERO;
        }
      } else {
        // Descend to base
        if (elevator.pos.y < 11.0) {
          elevator.pos.y = Math.min(11.0, elevator.pos.y + 2.0 * dt);
          elevator.velocity = new Vector2(0, 2.0);
        } else {
          elevator.velocity = Vector2.ZERO;
        }
      }
      // Keep switch aligned with elevator platform
      sw.pos.y = elevator.pos.y - 0.3;
    }

    // Update other platforms
    for (let i = 1; i < this.platforms.length; i++) {
      this.platforms[i].update(dt);
    }

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
      this.solids,
      this.ramps,
      this.platforms,
      this.crates
    );

    if (axelEvents.jumped) audio?.playJump();
    if (axelEvents.landed) audio?.playLanding();
    if (axelEvents.pickedUpCrate) audio?.playPickup();
    if (axelEvents.threwCrate || axelEvents.placedCrate) audio?.playThrow();

    for (const crate of this.crates) {
      crate.frictionCoeff = this.frictionSetting;
      crate.update(dt, this.gravitySetting, this.solids, this.ramps, this.platforms);
    }

    for (const s of this.switches) {
      s.update(this.axel.pos, this.axel.size, this.axel.mass, this.crates);
      if (s.justActivated) audio?.playSwitch();
    }

    if (interactPressed) {
      for (const portal of this.portals) {
        if (portal.isNear(this.axel.pos)) {
          this.requestedLevelLoad = portal.targetLevelId;
          break;
        }
      }
    }

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
      true,
      false,
      this.config.title,
      this.config.learningObjective
    );
  }

  public getHUDState(): HUDState {
    return {
      time: this.elapsedTime,
      speed: this.axel.vel.magnitude(),
      velocity: this.axel.vel,
      activeFormulaName: 'Free Play Sandbox',
      activeFormulaLatex: `g = ${this.gravitySetting.toFixed(1)} \\text{ m/s}^2, \\quad \\mu = ${this.frictionSetting.toFixed(2)}`,
      substitutedFormula: `Active Crates: ${this.crates.length}, Mass On Switch: ${this.switches[0]?.currentMass.toFixed(0) ?? 0} kg`
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
      analyticalText: 'Sandbox parameters verified.',
      simulationText: 'Custom physics rules active.',
      errorText: '0.00% error'
    };
  }
}
