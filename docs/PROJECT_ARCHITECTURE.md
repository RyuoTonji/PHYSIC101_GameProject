# Project Architecture: Physics 101: The Mechanics Odyssey

## 1. Architectural Overview

```
src/
├── physics/                     # Pure, testable physics abstraction layer (SI units)
│   ├── Vector2.ts               # 2D Euclidean vector operations with immutability options
│   ├── Kinematics.ts            # Linear motion, speed, velocity, acceleration, UARM formulas
│   ├── CircularMotion.ts        # Rotation, revolution, period, frequency, tangential speed, ac
│   ├── Forces.ts                # Centripetal force, net forces, tension, normal force
│   ├── Friction.ts              # Static and kinetic friction models
│   ├── Collision.ts             # Continuous and discrete 2D collision detection and resolution
│   ├── UnitConversion.ts        # Scale conversion: 1 meter = 40 pixels (strictly isolated)
│   ├── PhysicsConstants.ts      # Fixed timestep (dt = 1/60s), tolerances, standard gravity
│   └── index.ts
├── engine/                      # Deterministic game loop and simulation engine
│   ├── GameEngine.ts            # Fixed-timestep accumulator loop (1/60s), renderer decoupling
│   ├── InputManager.ts          # Keyboard, mouse, touch input normalization
│   └── AudioFeedback.ts         # Pitch-modulated physics audio synthesizer (Web Audio API)
├── levels/                      # Individual educational levels (1 through 8)
│   ├── LevelBase.ts             # Level lifecycle: intro, demo, puzzle, challenge, verification
│   ├── Level01_DistanceDisplacement.ts
│   ├── Level02_SpeedVelocity.ts
│   ├── Level03_Acceleration.ts
│   ├── Level04_UARM.ts
│   ├── Level05_RotationRevolution.ts
│   ├── Level06_LinearVsRotational.ts
│   ├── Level07_TangentialCentripetal.ts
│   ├── Level08_CentripetalForce.ts
│   └── LevelRegistry.ts
├── education/                   # Educational HUD, hints, formulas, and quizzes
│   ├── FormulaDisplay.ts        # Live synchronized formula with numerical substitutions
│   ├── EducationalHUD.ts        # Real-time physical quantity monitors (v, a, r, d, etc.)
│   ├── HintSystem.ts            # 3-tier hints: 1-Conceptual, 2-Formula, 3-Step-by-step
│   ├── QuizSystem.ts            # End-of-level conceptual and numerical quizzes
│   └── FailureFeedback.ts       # Scientific explanation generator on failure
├── systems/
│   ├── ProgressionSystem.ts     # Level unlocking, scoring weights, star calculations
│   ├── SaveSystem.ts            # LocalStorage serialization of progress, quiz scores, settings
│   └── DebugVisualizer.ts       # Visual vector renderer: velocity, centripetal accel, force
├── ui/                          # Presentation components and styling
│   └── components/
└── test/                        # Automated unit and simulation verification suite
    ├── vectors.test.ts
    ├── kinematics.test.ts
    ├── circularMotion.test.ts
    ├── forces.test.ts
    ├── simulationVsAnalytical.test.ts
    └── edgeCases.test.ts
```

## 2. Engine Selection Justification

Per Section 9 of the Master Development Prompt:
- Godot 4.x is preferred when available on host system. Since Godot is not installed on this Windows environment (confirmed via system probe), Phaser + TypeScript / Vite is the explicitly designated alternative.
- TypeScript + Vite provides:
  1. Pure deterministic physics simulation running at a fixed 60Hz timestep (`1/60 s = 0.0166667 s`) completely decoupled from frame rendering.
  2. Native Vitest execution for automated unit testing and analytical vs simulation validation.
  3. Seamless in-browser execution with real-time vector rendering, interactive parameter controls, high-contrast accessible HUD, and responsive design.

## 3. Unit System & Scaling Isolation

- All internal physics calculations operate strictly in **SI Units**:
  - Distance: meters ($\text{m}$)
  - Time: seconds ($\text{s}$)
  - Mass: kilograms ($\text{kg}$)
  - Velocity: meters per second ($\text{m/s}$)
  - Acceleration: meters per second squared ($\text{m/s}^2$)
  - Force: newtons ($\text{N}$)
  - Angle: radians ($\text{rad}$)
  - Angular speed: radians per second ($\text{rad/s}$)
- Game rendering uses a clear, explicit scaling constant defined in `UnitConversion.ts`:
  $$\text{METERS\_TO\_PIXELS} = 40.0 \quad (1\text{ meter} = 40\text{ canvas pixels})$$
- Physical quantities are never stored or computed in pixels.

## 4. Deterministic Fixed-Timestep Design

To satisfy Section 6:
```typescript
let accumulator = 0;
const FIXED_TIMESTEP = 1 / 60; // 0.0166667s

function tick(realDeltaTime: number) {
  // Cap realDeltaTime to avoid spiral of death on lag
  const dt = Math.min(realDeltaTime, 0.1);
  accumulator += dt;
  while (accumulator >= FIXED_TIMESTEP) {
    physicsSystem.fixedStep(FIXED_TIMESTEP);
    accumulator -= FIXED_TIMESTEP;
  }
  // Render with alpha interpolation if needed
  render(accumulator / FIXED_TIMESTEP);
}
```
