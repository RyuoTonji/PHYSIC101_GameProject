export interface LevelHints {
  levelId: number;
  hint1_conceptual: string;
  hint2_formula: string;
  hint3_guidedSolution: string;
}

export class HintSystem {
  private static readonly HINTS: Record<number, LevelHints> = {
    1: {
      levelId: 1,
      hint1_conceptual:
        'Distance is the full path you trace out along winding turns. Displacement is the straight arrow directly from your starting pad to the destination.',
      hint2_formula:
        'Displacement magnitude: |Δr| = √[(xf - xi)² + (yf - yi)²]. Path distance: d = Σ Δs.',
      hint3_guidedSolution:
        'Notice: if you go 10 m East and 10 m North, Distance = 10 + 10 = 20 m. Displacement = √(10² + 10²) = √200 ≈ 14.14 m at 45°.'
    },
    2: {
      levelId: 2,
      hint1_conceptual:
        'Average speed cares only about your speedometer over time. Average velocity cares about where you ended up relative to where you started.',
      hint2_formula:
        'Average Speed: v_avg = d / t. Average Velocity: v⃗_avg = Δr⃗ / t.',
      hint3_guidedSolution:
        'For 100 m traveled in 20 s with a net displacement of 60 m East: v_avg = 100 / 20 = 5 m/s. v_avg(vector) = 60 / 20 = 3 m/s East.'
    },
    3: {
      levelId: 3,
      hint1_conceptual:
        'Acceleration is the rate at which velocity changes over time. When braking, acceleration opposes your velocity vector.',
      hint2_formula:
        'a = Δv / Δt = (vf - vi) / t.',
      hint3_guidedSolution:
        'To brake from vi = 20 m/s to vf = 0 m/s inside a 5-second zone: a = (0 - 20) / 5 = -4.0 m/s².'
    },
    4: {
      levelId: 4,
      hint1_conceptual:
        'With constant acceleration, position grows quadratically with time (t²). Choose your launch throttle to reach the landing dock.',
      hint2_formula:
        'Δx = vi·t + ½·a·t²   and   vf² = vi² + 2·a·Δx.',
      hint3_guidedSolution:
        'Given vi = 5 m/s, a = 2 m/s², t = 4 s: Δx = 5(4) + ½(2)(4²) = 20 + 16 = 36 m. vf = 5 + 2(4) = 13 m/s.'
    },
    5: {
      levelId: 5,
      hint1_conceptual:
        'Period (T) is how many seconds one full spin takes. Frequency (f) is how many cycles happen per second.',
      hint2_formula:
        'Period: T = t / N.   Frequency: f = 1 / T = N / t.   Angular speed: ω = 2π / T.',
      hint3_guidedSolution:
        'If 3 complete revolutions take 12 seconds: T = 12 / 3 = 4 s. Frequency f = 1 / 4 = 0.25 Hz. ω = 2π(0.25) ≈ 1.57 rad/s.'
    },
    6: {
      levelId: 6,
      hint1_conceptual:
        'All points on a rigid rotating disk share the same angular speed (ω), but points further from the center have further to travel in the same time!',
      hint2_formula:
        'Tangential linear speed: v = r · ω.',
      hint3_guidedSolution:
        'For ω = 2 rad/s: at r = 1 m, v = 1(2) = 2 m/s. At r = 3 m, v = 3(2) = 6 m/s. Triple the radius gives triple the linear speed!'
    },
    7: {
      levelId: 7,
      hint1_conceptual:
        'When you hit ice, centripetal inward force vanishes! There is no outward force; your vehicle simply travels in a straight line tangent to the curve due to inertia.',
      hint2_formula:
        'Centripetal acceleration: ac = v² / r = r·ω². Direction: points inward (-r̂). Tangent velocity: vt = r·ω tangent.',
      hint3_guidedSolution:
        'For v = 10 m/s, r = 5 m: required ac = 10² / 5 = 20 m/s² inward. Once friction drops to zero, the vehicle continues along the straight tangent line.'
    },
    8: {
      levelId: 8,
      hint1_conceptual:
        'Centripetal force is the net inward force needed to bend an object into a circle. In a washing machine, drum walls push clothes inward, while water flies freely through holes in a straight line.',
      hint2_formula:
        'Fc = m·v² / r = m·r·ω².',
      hint3_guidedSolution:
        'For m = 2 kg, v = 4 m/s, r = 2 m: Fc = (2)(4²) / 2 = 16 N inward tension.'
    }
  };

  public static getHints(levelId: number): LevelHints {
    return (
      this.HINTS[levelId] || {
        levelId,
        hint1_conceptual: 'Observe the physical quantities and track how they change over time.',
        hint2_formula: 'Review the active formula card on the HUD.',
        hint3_guidedSolution: 'Match the target parameters to the target landing zone.'
      }
    );
  }
}
