import { describe, it, expect } from 'vitest';
import { Vector2 } from '../src/physics/Vector2.ts';
import { Axel } from '../src/platformer/Axel.ts';
import { PhysicsCrate } from '../src/platformer/PhysicsCrate.ts';
import { MovingPlatform } from '../src/platformer/MovingPlatform.ts';
import { PressureSwitch } from '../src/platformer/InteractiveElements.ts';
import { SolidBox, RampSlope } from '../src/platformer/WorldGeometry.ts';
import { HubWorld } from '../src/levels/HubWorld.ts';
import { Level01_DistanceDisplacement } from '../src/levels/Level01_DistanceDisplacement.ts';
import { Level09_PhysicsSandbox } from '../src/levels/Level09_PhysicsSandbox.ts';
import { LevelRegistry } from '../src/levels/LevelRegistry.ts';

const mockInput = {
  move: Vector2.ZERO,
  boost: false,
  brake: false,
  action: false,
  reset: false,
  pause: false,
  mousePos: Vector2.ZERO,
  mouseDown: false
};

describe('Axel Character Controller & Platformer Physics (Vertical Slice)', () => {
  it('accelerates horizontally and respects walk vs sprint speed limits', () => {
    const axel = new Axel(5.0, 10.0);
    const solids: SolidBox[] = [{ x: 0, y: 12, w: 20, h: 2 }];

    // Walk right for 30 ticks
    for (let i = 0; i < 30; i++) {
      axel.update(
        1 / 60,
        { left: false, right: true, jumpPressed: false, jumpHeld: false, sprint: false, interactPressed: false },
        solids,
        [],
        [],
        []
      );
    }
    expect(axel.vel.x).toBeGreaterThan(4.0);
    expect(axel.vel.x).toBeLessThanOrEqual(axel.walkSpeed + 0.1);

    // Sprint right
    for (let i = 0; i < 30; i++) {
      axel.update(
        1 / 60,
        { left: false, right: true, jumpPressed: false, jumpHeld: false, sprint: true, interactPressed: false },
        solids,
        [],
        [],
        []
      );
    }
    expect(axel.vel.x).toBeGreaterThan(axel.walkSpeed);
    expect(axel.vel.x).toBeLessThanOrEqual(axel.runSpeed + 0.1);
  });

  it('implements variable jump height (cutting upward velocity on release)', () => {
    const axelFull = new Axel(5.0, 10.6);
    const axelCut = new Axel(5.0, 10.6);
    const solids: SolidBox[] = [{ x: 0, y: 12, w: 20, h: 2 }];

    // Settle on ground
    axelFull.update(1 / 60, { left: false, right: false, jumpPressed: false, jumpHeld: false, sprint: false, interactPressed: false }, solids, [], [], []);
    axelCut.update(1 / 60, { left: false, right: false, jumpPressed: false, jumpHeld: false, sprint: false, interactPressed: false }, solids, [], [], []);
    expect(axelFull.isGrounded).toBe(true);

    // Jump held vs Jump released early
    axelFull.update(
      1 / 60,
      { left: false, right: false, jumpPressed: true, jumpHeld: true, sprint: false, interactPressed: false },
      solids,
      [],
      [],
      []
    );
    axelCut.update(
      1 / 60,
      { left: false, right: false, jumpPressed: true, jumpHeld: false, sprint: false, interactPressed: false },
      solids,
      [],
      [],
      []
    );

    // Next step
    axelFull.update(
      1 / 60,
      { left: false, right: false, jumpPressed: false, jumpHeld: true, sprint: false, interactPressed: false },
      solids,
      [],
      [],
      []
    );
    axelCut.update(
      1 / 60,
      { left: false, right: false, jumpPressed: false, jumpHeld: false, sprint: false, interactPressed: false },
      solids,
      [],
      [],
      []
    );

    // axelCut upward velocity is dampened
    expect(Math.abs(axelCut.vel.y)).toBeLessThan(Math.abs(axelFull.vel.y));
  });

  it('implements coyote time (can jump shortly after stepping off a platform)', () => {
    const axel = new Axel(5.0, 10.0);
    const solids: SolidBox[] = [{ x: 0, y: 12, w: 6, h: 2 }]; // ledge ends at x: 6

    // Walk off ledge
    for (let i = 0; i < 20; i++) {
      axel.update(
        1 / 60,
        { left: false, right: true, jumpPressed: false, jumpHeld: false, sprint: false, interactPressed: false },
        solids,
        [],
        [],
        []
      );
    }
    // Axel is now in the air
    expect(axel.isGrounded).toBe(false);

    // Jump immediately within coyote time window (0.12s ~ 7 frames)
    const events = axel.update(
      1 / 60,
      { left: false, right: false, jumpPressed: true, jumpHeld: true, sprint: false, interactPressed: false },
      [],
      [],
      [],
      []
    );
    expect(events.jumped).toBe(true);
    expect(axel.vel.y).toBeLessThan(-5.0);
  });
});

describe('Physics Crates, Ramps, & Moving Platforms', () => {
  it('allows Axel to push a 20kg crate with realistic mass transfer', () => {
    const axel = new Axel(4.0, 10.0);
    const crate = new PhysicsCrate('crate-test', 5.0, 10.0, 20.0);
    const solids: SolidBox[] = [{ x: 0, y: 12, w: 20, h: 2 }];

    // Move Axel right into crate
    for (let i = 0; i < 20; i++) {
      axel.update(
        1 / 60,
        { left: false, right: true, jumpPressed: false, jumpHeld: false, sprint: false, interactPressed: false },
        solids,
        [],
        [],
        [crate]
      );
      crate.update(1 / 60, 26.0, solids, [], []);
    }

    // Both Axel and Crate have moved right
    expect(crate.pos.x).toBeGreaterThan(5.0);
  });

  it('allows Axel to pick up, carry, and throw a physics crate', () => {
    const axel = new Axel(5.0, 10.0);
    const crate = new PhysicsCrate('crate-test', 5.5, 10.0, 20.0);
    const solids: SolidBox[] = [{ x: 0, y: 12, w: 20, h: 2 }];

    // 1. Pick up crate with E
    const pickupEvent = axel.update(
      1 / 60,
      { left: false, right: false, jumpPressed: false, jumpHeld: false, sprint: false, interactPressed: true },
      solids,
      [],
      [],
      [crate]
    );
    expect(pickupEvent.pickedUpCrate).toBe(true);
    expect(axel.carriedCrate).toBe(crate);
    expect(crate.isCarried).toBe(true);

    // 2. Walk right while carrying
    for (let i = 0; i < 15; i++) {
      axel.update(
        1 / 60,
        { left: false, right: true, jumpPressed: false, jumpHeld: false, sprint: false, interactPressed: false },
        solids,
        [],
        [],
        [crate]
      );
    }
    // Crate position moved with Axel
    expect(crate.pos.x).toBeCloseTo(axel.pos.x + (axel.size.x - crate.size.x) * 0.5, 1);

    // 3. Throw crate
    const throwEvent = axel.update(
      1 / 60,
      { left: false, right: true, jumpPressed: false, jumpHeld: false, sprint: false, interactPressed: true },
      solids,
      [],
      [],
      [crate]
    );
    expect(throwEvent.threwCrate).toBe(true);
    expect(axel.carriedCrate).toBeNull();
    expect(crate.isCarried).toBe(false);
    expect(crate.vel.x).toBeGreaterThan(5.0); // Launched forward!
  });

  it('causes physics crates to naturally slide down ramps under gravity', () => {
    const crate = new PhysicsCrate('crate-ramp', 6.0, 9.0, 20.0);
    const ramp: RampSlope = { x1: 5.0, y1: 10.0, x2: 15.0, y2: 15.0 }; // slope downward to the right
    const solids: SolidBox[] = [];

    // Let crate update on ramp for 40 frames
    for (let i = 0; i < 40; i++) {
      crate.update(1 / 60, 26.0, solids, [ramp], []);
    }

    // Crate slid down to the right
    expect(crate.pos.x).toBeGreaterThan(6.0);
    expect(crate.vel.x).toBeGreaterThan(0);
  });

  it('transfers kinematic momentum from moving platform to player on jump', () => {
    const axel = new Axel(5.0, 9.4);
    const platform = new MovingPlatform(4.0, 11.0, 14.0, 11.0, 3.0, 0.6, 4.0); // moves right at 4 m/s

    // Update platform and let Axel stand on it
    for (let i = 0; i < 10; i++) {
      platform.update(1 / 60);
      axel.update(
        1 / 60,
        { left: false, right: false, jumpPressed: false, jumpHeld: false, sprint: false, interactPressed: false },
        [],
        [],
        [platform],
        []
      );
    }
    expect(axel.onMovingPlatform).toBe(platform);

    // Axel jumps off moving platform
    axel.update(
      1 / 60,
      { left: false, right: false, jumpPressed: true, jumpHeld: true, sprint: false, interactPressed: false },
      [],
      [],
      [platform],
      []
    );
    // Axel inherited horizontal momentum from the platform!
    expect(axel.vel.x).toBeGreaterThan(0.5);
  });

  it('activates pressure switch only when total mass threshold is met (e.g. 40kg)', () => {
    const sw = new PressureSwitch('sw-test', 10.0, 12.0, 40.0);
    const axelPos = new Vector2(10.5, 11.0); // Axel on plate
    const axelSize = new Vector2(0.8, 1.4);
    const axelMass = 30.0; // 30kg alone is NOT enough for 40kg threshold

    // Case 1: Axel alone (30kg < 40kg)
    sw.update(axelPos, axelSize, axelMass, []);
    expect(sw.currentMass).toBe(30.0);
    expect(sw.isActivated).toBe(false);

    // Case 2: 20kg Crate added on plate (30 + 20 = 50kg >= 40kg)
    const crate = new PhysicsCrate('crate-sw', 10.2, 11.4, 20.0);
    sw.update(axelPos, axelSize, axelMass, [crate]);
    expect(sw.currentMass).toBe(50.0);
    expect(sw.isActivated).toBe(true);
  });
});

describe('Hub World & Level 1 Vertical Slice Integration', () => {
  it('instantiates Hub World (id: 0) with NPCs, playground, and level portals', () => {
    const hub = LevelRegistry.createLevel(0) as HubWorld;
    expect(hub.config.id).toBe(0);
    expect(hub.npcs.length).toBeGreaterThanOrEqual(4);
    expect(hub.portals.length).toBeGreaterThanOrEqual(2);
    expect(hub.crates.length).toBeGreaterThanOrEqual(1);

    // Advance simulation 30 ticks
    for (let i = 0; i < 30; i++) {
      hub.fixedUpdate(1 / 60, mockInput);
    }
    expect(hub.axel.pos.x).toBeDefined();
    expect(hub.verifyAnalytical().passed).toBe(true);
  });

  it('Level 1: The Wandering Path satisfies multiple physical solutions and distance vs displacement tracking', () => {
    const lvl1 = LevelRegistry.createLevel(1) as Level01_DistanceDisplacement;
    expect(lvl1.config.id).toBe(1);

    // Move right along the level
    const moveRight = { ...mockInput, move: new Vector2(1, 0) };
    for (let i = 0; i < 60; i++) {
      lvl1.fixedUpdate(1 / 60, moveRight);
    }

    const hud = lvl1.getHUDState();
    expect(hud.distance).toBeGreaterThan(0);
    expect(hud.displacementMag).toBeGreaterThan(0);
    // Fundamental law: Distance is strictly greater than or equal to displacement magnitude
    expect(hud.distance!).toBeGreaterThanOrEqual(hud.displacementMag! - 0.001);

    // Check multiple solution components are present:
    expect(lvl1.platforms.length).toBeGreaterThan(0); // Chasm shortcut platform
    expect(lvl1.ramps.length).toBeGreaterThan(0); // Momentum launch ramp
    expect(lvl1.switches.length).toBeGreaterThan(0); // Pressure switch puzzle
    expect(lvl1.crates.length).toBeGreaterThan(0); // Physics crate
    expect(lvl1.barriers.length).toBeGreaterThan(0); // Locked shortcut barrier
    expect(lvl1.checkpoints.length).toBeGreaterThanOrEqual(3); // Checkpoints for safe recovery
    expect(lvl1.cores.length).toBeGreaterThanOrEqual(3); // Collectible cores
  });

  it('instantiates Free Play Physics Sandbox (id: 9) with adjustable gravity & spawning', () => {
    const sb = LevelRegistry.createLevel(9) as Level09_PhysicsSandbox;
    expect(sb.config.id).toBe(9);

    const initialCrateCount = sb.crates.length;
    sb.spawnCrate(25.0);
    expect(sb.crates.length).toBe(initialCrateCount + 1);

    // Switch to Moon gravity
    sb.setGravityPreset('moon');
    expect(sb.gravitySetting).toBe(5.0);
    expect(sb.axel.gravity).toBe(5.0);

    // Run simulation
    for (let i = 0; i < 30; i++) {
      sb.fixedUpdate(1 / 60, mockInput);
    }
    expect(sb.verifyAnalytical().passed).toBe(true);
  });
});
