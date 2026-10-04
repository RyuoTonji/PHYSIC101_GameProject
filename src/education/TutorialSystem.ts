export interface LevelTutorial {
  levelId: number;
  title: string;
  objective: string;
  controlsExplanation: string;
  stepByStep: string[];
  physicsInsight: string;
  expectedValues: string;
}

export class TutorialSystem {
  private static readonly TUTORIALS: Record<number, LevelTutorial> = {
    0: {
      levelId: 0,
      title: 'Central Hub: The Mechanics Odyssey Nexus',
      objective:
        'Explore the interconnected research nexus, speak with researcher NPCs, test mechanics in the training playground, and enter mission portals.',
      controlsExplanation:
        '[A][D] or [◄][►] to Run. [Space] or [W] or [▲] to Jump. Hold [Shift] to Sprint. Press [E] to talk to NPCs, grab/throw crates, and enter portals.',
      stepByStep: [
        '1. Run and jump around the Hub. Notice the athletic coyote-time and variable jump height.',
        '2. Approach Professor Vector, Torque, Newton, or Flux and press [E] to converse.',
        '3. Test the Playground: Push the 20kg alloy crate up the ramp or press [E] to carry it.',
        '4. Discover the secret observation balcony above the playground to find a hidden Physics Core!',
        '5. Step into Portal 1 to begin Level 1: The Wandering Path, or use the Mission dropdown.'
      ],
      physicsInsight:
        'Every mission in the Mechanics Odyssey is physically connected. Momentum, friction, mass, and vectors are tools for exploration and creative problem solving.',
      expectedValues:
        'Axel Mass: 30 kg | Gravity: 26 m/s² | Crate Mass: 20 kg | Pressure Threshold: 40 kg'
    },
    1: {
      levelId: 1,
      title: 'Level 1: The Wandering Path (Distance vs. Displacement)',
      objective:
        'Travel from Base Camp to the Quantum Signal Beacon at the Summit. Choose between the safe winding path, the moving platform chasm, or the momentum ramp puzzle!',
      controlsExplanation:
        '[A][D] or [◄][►] to Run. [Space] / [W] / [▲] to Jump. [Shift] to Sprint. [E] to Pick up / Throw crates or activate portals. [R] to Respawn.',
      stepByStep: [
        '1. Route A (Safe Winding Valley): Take the lower path. Long, safe switchbacks with no death pits. Notice your distance grows to ~70m while displacement is only ~46m!',
        '2. Route B (Dangerous Chasm Shortcut): Jump across floating pillars and ride the moving platform across the quantum rift. High risk, cuts distance down to ~48m!',
        '3. Route C (Momentum Ramp & Crate Puzzle): A locked barrier blocks the direct tunnel. Push/carry the 20kg crate onto the 40kg switch, or sprint down the steep ramp to leap over the barrier!',
        '4. Collect optional Physics Cores and reach the Summit Beacon to complete the mission.'
      ],
      physicsInsight:
        'Distance is a scalar representing total path length traveled (d = Σ Δs). Displacement is a vector from start to end (Δr⃗ = r⃗f - r⃗i). Notice that Distance ≥ |Displacement| always!',
      expectedValues:
        'Summit coordinate: x = 49m, y = 6m. Direct straight displacement: ~46.5 m. Winding path distance: ~60 m - 75 m.'
    },
    2: {
      levelId: 2,
      title: 'Level 2: Average Speed vs. Average Velocity',
      objective:
        'Drive the test runner along the circuit track through the timing gates to the finish line.',
      controlsExplanation:
        'Press [D] or [Right Arrow] to drive East. Press [A] or [Left Arrow] to reverse West. Press [Space] to stop.',
      stepByStep: [
        '1. Press [D] or [Right Arrow] to accelerate forward along the track.',
        '2. Observe the HUD: Average Speed = total distance / elapsed time, while Average Velocity = displacement / elapsed time.',
        '3. Try driving past Gate B, then reversing back to Gate A: your average speed stays positive, but your average velocity drops towards zero!',
        '4. Cross the green Finish Line Gate to complete the mission.'
      ],
      physicsInsight:
        'Speed is scalar (how fast you move through distance). Velocity is a vector (rate of change of position). If you complete a round-trip and return to your start, your net displacement is 0 m, so your average velocity is 0 m/s even if your speed was 100 km/h!',
      expectedValues:
        'Forward sprint: 18m in 3.6s -> Average Speed = 5.0 m/s, Average Velocity = +5.0 m/s East.'
    },
    3: {
      levelId: 3,
      title: 'Level 3: Acceleration & Deceleration',
      objective:
        'Accelerate the car down the track, then apply brakes to come to a complete stop inside the Green Zone (18m – 21m).',
      controlsExplanation:
        'Press [D] / [Up Arrow] to Accelerate (+4 m/s²). Press [Space] / [S] / [Left Arrow] to apply Brakes (-4.5 m/s²). Release keys to coast with mild rolling resistance.',
      stepByStep: [
        '1. Press [D] or click [Accelerate] to start moving down the track.',
        '2. Watch your speedometer rise (a = Δv/Δt).',
        '3. As you approach the 15-meter mark, release the throttle and hold [Space] or click [Brake].',
        '4. Bring the vehicle to a full stop (speed = 0) with your front bumper inside the 18m - 21m zone.'
      ],
      physicsInsight:
        'Acceleration vector points in the direction of velocity change. When speeding up, a and v share the same direction. When braking, acceleration opposes velocity (v · a < 0), causing deceleration.',
      expectedValues:
        'Target stopping coordinate: between 18.0 m and 21.0 m. Initial acceleration: +4.0 m/s², braking: -4.5 m/s².'
    },
    4: {
      levelId: 4,
      title: 'Level 4: Uniformly Accelerated Motion (UARM)',
      objective:
        'Set launch parameters and launch the kinematic rocket cart to land precisely on the 36-meter landing bay.',
      controlsExplanation:
        'Use the on-screen slider or [▲]/[▼] keys to adjust acceleration (a). Press [🚀 Launch] or [Space]/[Enter] to fire the launch thrusters.',
      stepByStep: [
        '1. Notice the initial speed is vi = 5.0 m/s, and the flight duration is t = 4.0 seconds.',
        '2. Use the kinematic position formula: Δx = vi·t + ½·a·t².',
        '3. Solve for required a: 36 = 5(4) + ½·a(16) -> 36 = 20 + 8a -> 8a = 16 -> a = 2.0 m/s².',
        '4. Set acceleration to exactly 2.0 m/s² (or use default) and click [🚀 Launch] to achieve a perfect 36.0 m landing!'
      ],
      physicsInsight:
        'Under constant acceleration, velocity increases linearly (vf = vi + at) and position increases quadratically with time squared (t²). Torricelli’s formula (vf² = vi² + 2aΔx) verifies that vf = √(5² + 2(2)(36)) = 13.0 m/s.',
      expectedValues:
        'vi = 5.0 m/s, a = 2.0 m/s², t = 4.0 s -> Δx = 36.0 m, vf = 13.0 m/s.'
    },
    5: {
      levelId: 5,
      title: 'Level 5: Rotation, Revolution, and Period',
      objective:
        'Synchronize orbital transfer: board the revolving shuttle and dock safely at the Destination Bay.',
      controlsExplanation:
        'Use [W][A][S][D] or [Arrow Keys] to move your astronaut. Steer near the orbiting shuttle to latch onto it.',
      stepByStep: [
        '1. Observe the central space station: it rotates about an internal axis (Rotation).',
        '2. Observe the blue shuttle: it travels around an external axis (Revolution) at radius r = 4m.',
        '3. Calculate the period T: the shuttle takes 4.0 seconds per cycle (Frequency f = 1/T = 0.25 Hz).',
        '4. Move your astronaut onto the shuttle as it swings past, then dismount when you reach the green Destination Bay at x = 20m.'
      ],
      physicsInsight:
        'Rotation refers to spinning on an internal axis (like Earth’s 24h day). Revolution refers to orbiting an external center (like Earth’s 365-day year around the Sun). Period T = t / N is seconds per cycle.',
      expectedValues:
        'Period T = 4.0 s, Frequency f = 0.25 Hz, Angular velocity ω = 2π/T ≈ 1.57 rad/s.'
    },
    6: {
      levelId: 6,
      title: 'Level 6: Linear Speed vs. Rotational Speed',
      objective:
        'Inspect the centrifuge carousel and compare the linear tangential speeds of capsules at different radii.',
      controlsExplanation:
        'Click the rider buttons or press [1], [2], [3] to switch focus between Inner (1m), Mid (2m), and Outer (3m) capsules. Use [▲]/[▼] to adjust rotation speed.',
      stepByStep: [
        '1. Select the Inner Capsule (r = 1m): note that linear speed v = 1m × 2 rad/s = 2.0 m/s.',
        '2. Select the Mid Capsule (r = 2m): note that linear speed v = 2m × 2 rad/s = 4.0 m/s.',
        '3. Select the Outer Capsule (r = 3m): note that linear speed v = 3m × 2 rad/s = 6.0 m/s.',
        '4. Observe the green velocity arrows: they get longer the farther you are from the center, even though all capsules complete each turn together!'
      ],
      physicsInsight:
        'On any rigid rotating body, angular speed ω is identical for every point. But linear tangential speed is directly proportional to radius: v = r · ω. Points further from center must cover a larger circumference in the same time!',
      expectedValues:
        'ω = 2.0 rad/s constant everywhere. At r = 1m -> v = 2 m/s; r = 2m -> v = 4 m/s; r = 3m -> v = 6 m/s.'
    },
    7: {
      levelId: 7,
      title: 'Level 7: Tangential Velocity & Centripetal Acceleration',
      objective:
        'Observe circular motion dynamics and trigger the frictionless ice patch to witness tangential inertia in action.',
      controlsExplanation:
        'Press [Space], [E], or click [❄️ Cut Centripetal Force] to trigger the ice patch and eliminate inward friction.',
      stepByStep: [
        '1. Watch the vehicle round the curve at constant speed v = 10 m/s and radius r = 5 m.',
        '2. Notice the yellow arrow (centripetal acceleration ac = 20 m/s²) points strictly toward the center.',
        '3. Notice the cyan arrow (velocity) points strictly tangent to the curve.',
        '4. Press [Space] or click [❄️ Cut Centripetal Force] to remove inward force. Watch the vehicle continue in a straight line along the tangent vector due to Newton’s First Law (inertia)!'
      ],
      physicsInsight:
        'Centripetal acceleration is inward (ac = v²/r). There is NO outward centrifugal force acting on the car. When friction vanishes, the car simply moves in a straight line tangent to the curve because no force is bending its path.',
      expectedValues:
        'v = 10.0 m/s, r = 5.0 m -> ac = 10² / 5 = 20.0 m/s² inward. Release trajectory = straight tangent line.'
    },
    8: {
      levelId: 8,
      title: 'Level 8: Centripetal Force & Real-World Applications',
      objective:
        'Experiment with string tension (Fc = mv²/r) and explore the washing machine spin cycle to debunk the centrifugal force myth.',
      controlsExplanation:
        'Use the interactive sliders to adjust Mass (m), Radius (r), and Speed (v). Click [🔄 Switch Scenario] to toggle between Ball on String and Washing Machine Drum.',
      stepByStep: [
        '1. In Scenario A (Ball on a String): set m = 2.0 kg, v = 10.0 m/s, r = 5.0 m. Notice required string tension Fc = (2)(10²)/5 = 40.0 N (pointing inward).',
        '2. Increase speed above 12 m/s to exceed string breaking limit (55 N) and watch the ball fly off tangentially.',
        '3. Click [🔄 Switch Scenario] to view Scenario B (Washing Machine Drum).',
        '4. Watch the perforated drum spin: the drum wall exerts inward normal force on clothes, while water droplets continue in straight tangential lines through the holes due to inertia!'
      ],
      physicsInsight:
        'Centripetal force is not a special new force; it is the physical inward force provided by real objects (string tension, friction, drum normal force). In an inertial frame, centrifugal force does NOT push water outward; water simply flies tangent through the holes because the wall cannot push it inward.',
      expectedValues:
        'Fc = m·v²/r = (2 kg)(10 m/s)² / (5 m) = 40.0 N inward.'
    },
    9: {
      levelId: 9,
      title: 'Free Play Physics Sandbox Lab',
      objective:
        'Freely spawn crates, adjust planetary gravity (Zero-G to Jupiter), test friction surfaces, and build physical setups.',
      controlsExplanation:
        'Use [A][D] to Move, [Space] to Jump, [E] to Grab/Throw crates. Click [Spawn Crate] or the gravity/friction dock buttons.',
      stepByStep: [
        '1. Spawn multiple crates of different masses.',
        '2. Switch gravity between Zero-G, Moon (5 m/s²), Earth (22 m/s²), and Jupiter (45 m/s²). Observe jump arc changes!',
        '3. Slide crates down the dual testing ramps to compare sliding friction.',
        '4. Step into the portal on the far left to return to the Central Hub at any time.'
      ],
      physicsInsight:
        'Kinematic trajectories and acceleration depend on gravitational field strength (g) and normal force friction (f_k = μ_k · N).',
      expectedValues:
        'Custom experimental values active in real-time.'
    }
  };

  public static getTutorial(levelId: number): LevelTutorial {
    return (
      this.TUTORIALS[levelId] || {
        levelId,
        title: `Level ${levelId} Tutorial`,
        objective: 'Complete the physics challenge using the supplied controls.',
        controlsExplanation: 'Use keyboard arrows or on-screen controls to interact.',
        stepByStep: ['Observe the simulation', 'Apply the governing physical formulas', 'Verify results'],
        physicsInsight: 'Physics principles govern the simulation deterministically.',
        expectedValues: 'Consult HUD telemetry.'
      }
    );
  }
}
