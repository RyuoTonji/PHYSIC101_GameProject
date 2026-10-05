import { describe, it, expect } from 'vitest';
import { LevelRegistry } from '../src/levels/LevelRegistry.ts';
import { Level01_DistanceDisplacement } from '../src/levels/Level01_DistanceDisplacement.ts';
import { Level02_SpeedVelocity } from '../src/levels/Level02_SpeedVelocity.ts';
import { Level03_Acceleration } from '../src/levels/Level03_Acceleration.ts';
import { Level04_UARM } from '../src/levels/Level04_UARM.ts';
import { Level05_RotationRevolution } from '../src/levels/Level05_RotationRevolution.ts';
import { Level06_LinearVsRotational } from '../src/levels/Level06_LinearVsRotational.ts';
import { Level07_TangentialCentripetal } from '../src/levels/Level07_TangentialCentripetal.ts';
import { Level08_CentripetalForce } from '../src/levels/Level08_CentripetalForce.ts';
import { HintSystem } from '../src/education/HintSystem.ts';
import { QuizSystem } from '../src/education/QuizSystem.ts';
import { ProgressionSystem } from '../src/systems/ProgressionSystem.ts';
import { Vector2 } from '../src/physics/Vector2.ts';

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

describe('Level Mechanics and Systems Integration (Levels 1-8)', () => {
  it('instantiates all 8 levels via LevelRegistry', () => {
    for (let i = 1; i <= 8; i++) {
      const lvl = LevelRegistry.createLevel(i);
      expect(lvl.config.id).toBe(i);
      expect(lvl.config.title).toBeDefined();
      expect(lvl.config.learningObjective).toBeDefined();
    }
  });

  describe('Level 1: Distance vs Displacement Mechanics', () => {
    it('accurately accumulates path distance while computing direct displacement vector', () => {
      const lvl = new Level01_DistanceDisplacement();
      lvl.setPhase('puzzle');

      // Simulate 60 steps moving right at 4 m/s (dt = 1/60)
      const inputRight = { ...mockInput, move: new Vector2(1, 0) };
      for (let i = 0; i < 60; i++) {
        lvl.fixedUpdate(1 / 60, inputRight);
      }

      const hud = lvl.getHUDState();
      expect(hud.distance).toBeGreaterThan(0);
      expect(hud.displacementMag).toBeGreaterThan(0);
      expect(hud.distance).toBeGreaterThanOrEqual(hud.displacementMag!);

      const verification = lvl.verifyAnalytical();
      expect(verification.passed).toBe(true);
    });
  });

  describe('Level 2: Speed vs Velocity Mechanics', () => {
    it('verifies average speed is non-zero after return loop', () => {
      const lvl = new Level02_SpeedVelocity();
      lvl.setPhase('puzzle');

      // Move east
      const moveEast = { ...mockInput, move: new Vector2(1, 0) };
      for (let i = 0; i < 60; i++) {
        lvl.fixedUpdate(1 / 60, moveEast);
      }

      const hud = lvl.getHUDState();
      expect(hud.speed).toBeGreaterThan(0);
      expect(lvl.verifyAnalytical().passed).toBe(true);
    });
  });

  describe('Level 3: Acceleration Mechanics', () => {
    it('accelerates under throttle and brakes under brake input', () => {
      const lvl = new Level03_Acceleration();
      lvl.setPhase('puzzle');

      // Throttle
      const throttle = { ...mockInput, boost: true };
      for (let i = 0; i < 30; i++) {
        lvl.fixedUpdate(1 / 60, throttle);
      }
      expect(lvl.velX).toBeGreaterThan(0);

      // Brake
      const brake = { ...mockInput, brake: true };
      for (let i = 0; i < 60; i++) {
        lvl.fixedUpdate(1 / 60, brake);
      }
      expect(lvl.accelX).toBeLessThan(0);
    });
  });

  describe('Level 4: UARM Ramp Launch Mechanics', () => {
    it('satisfies kinematic equations and verification', () => {
      const lvl = new Level04_UARM();
      lvl.setPhase('demo');

      // Step 4.0 seconds (240 steps @ 60Hz)
      for (let i = 0; i < 240; i++) {
        lvl.fixedUpdate(1 / 60, mockInput);
      }

      const v = lvl.verifyAnalytical();
      expect(v.passed).toBe(true);
      expect(lvl.posX).toBeCloseTo(36.0, 1);
    });
  });

  describe('Level 5: Rotation and Period', () => {
    it('maintains period T = 4s and computes cycles', () => {
      const lvl = new Level05_RotationRevolution();
      lvl.setPhase('puzzle');

      for (let i = 0; i < 240; i++) {
        lvl.fixedUpdate(1 / 60, mockInput);
      }

      const hud = lvl.getHUDState();
      expect(hud.period).toBe(4.0);
      expect(hud.frequency).toBe(0.25);
      expect(lvl.verifyAnalytical().passed).toBe(true);
    });
  });

  describe('Level 6: Linear vs Rotational Speed', () => {
    it('confirms v = r * omega across all riders', () => {
      const lvl = new Level06_LinearVsRotational();
      lvl.setPhase('puzzle');

      for (let i = 0; i < 60; i++) {
        lvl.fixedUpdate(1 / 60, mockInput);
      }

      expect(lvl.verifyAnalytical().passed).toBe(true);
    });
  });

  describe('Level 7: Tangential Velocity & ac Release', () => {
    it('switches to rectilinear motion when inward force is released', () => {
      const lvl = new Level07_TangentialCentripetal();
      lvl.setPhase('puzzle');

      // Trigger ice release
      lvl.triggerIceRelease();
      const posBefore = new Vector2(lvl.vehiclePos.x, lvl.vehiclePos.y);
      lvl.fixedUpdate(1 / 60, mockInput);

      // Trajectory moves straight along velocity
      expect(lvl.releasedTangent).toBe(true);
      expect(lvl.vehicleAcc.magnitude()).toBe(0);
      expect(lvl.verifyAnalytical().passed).toBe(true);
      expect(lvl.vehiclePos.distanceTo(posBefore)).toBeGreaterThan(0);
    });
  });

  describe('Level 8: Centripetal Force & Washing Machine Scenarios', () => {
    it('computes Fc = mv^2/r and handles drum spin cycle', () => {
      const lvl = new Level08_CentripetalForce();
      lvl.setPhase('puzzle');

      const v = lvl.verifyAnalytical();
      expect(v.passed).toBe(true);

      // Switch scenario to washing machine
      lvl.switchScenario('washing_machine');
      expect(lvl.scenario).toBe('washing_machine');
      for (let i = 0; i < 60; i++) {
        lvl.fixedUpdate(1 / 60, mockInput);
      }
      expect(lvl.waterDroplets.length).toBe(24);
    });

    it('requires docking all stations before completing the puzzle and opening quiz', () => {
      const lvl = new Level08_CentripetalForce();
      lvl.setPhase('puzzle');

      expect(lvl.stations.length).toBe(3);
      expect(lvl.dockedCount).toBe(0);

      // Dock at first station
      lvl.ballPos = new Vector2(lvl.stations[0].pos.x, lvl.stations[0].pos.y);
      lvl.stringSnapped = true;
      lvl.fixedUpdate(1 / 60, mockInput);

      expect(lvl.stations[0].cleared).toBe(true);
      expect(lvl.dockedCount).toBe(1);
      expect(lvl.isDocked).toBe(false);
      expect(lvl.phase).toBe('puzzle');

      // Dock at second station
      lvl.ballPos = new Vector2(lvl.stations[1].pos.x, lvl.stations[1].pos.y);
      lvl.fixedUpdate(1 / 60, mockInput);

      expect(lvl.stations[1].cleared).toBe(true);
      expect(lvl.dockedCount).toBe(2);
      expect(lvl.isDocked).toBe(false);
      expect(lvl.phase).toBe('puzzle');

      // Dock at third station (final station)
      lvl.ballPos = new Vector2(lvl.stations[2].pos.x, lvl.stations[2].pos.y);
      lvl.fixedUpdate(1 / 60, mockInput);

      expect(lvl.stations[2].cleared).toBe(true);
      expect(lvl.dockedCount).toBe(3);
      expect(lvl.isDocked).toBe(true);

      // Step forward celebration timer (0.8s)
      for (let i = 0; i < 50; i++) {
        lvl.fixedUpdate(1 / 60, mockInput);
      }
      expect(lvl.phase).toBe('explanation');
    });
  });

  describe('Educational Systems Integration', () => {
    it('provides 3-tier hints for every level (1 to 8)', () => {
      for (let i = 1; i <= 8; i++) {
        const hints = HintSystem.getHints(i);
        expect(hints.hint1_conceptual).toBeDefined();
        expect(hints.hint2_formula).toBeDefined();
        expect(hints.hint3_guidedSolution).toBeDefined();
      }
    });

    it('provides verified quizzes with explanations for every level (1 to 8)', () => {
      for (let i = 1; i <= 8; i++) {
        const quiz = QuizSystem.getQuiz(i);
        expect(quiz).not.toBeNull();
        expect(quiz!.questions.length).toBeGreaterThan(0);
        quiz!.questions.forEach(q => {
          expect(q.prompt).toBeDefined();
          expect(q.explanation).toBeDefined();
        });
      }
    });

    it('calculates weighted scores according to Section 17', () => {
      const prog = new ProgressionSystem();
      const score = prog.calculateScore(100, 100, 100, 100);
      expect(score.totalScore).toBe(100);
      expect(score.stars).toBe(3);

      const partial = prog.calculateScore(80, 80, 50, 70);
      // 80*0.4 + 80*0.3 + 50*0.2 + 70*0.1 = 32 + 24 + 10 + 7 = 73
      expect(partial.totalScore).toBe(73);
      expect(partial.stars).toBe(2);
    });
  });
});
