export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'numerical' | 'true-false';
  prompt: string;
  options?: string[]; // for multiple choice / true-false
  correctOptionIndex?: number;
  correctNumericalValue?: number;
  numericalTolerance?: number;
  unit?: string;
  explanation: string;
}

export interface LevelQuiz {
  levelId: number;
  title: string;
  questions: QuizQuestion[];
}

export class QuizSystem {
  private static readonly QUIZZES: Record<number, LevelQuiz> = {
    1: {
      levelId: 1,
      title: 'Level 1 Mastery Quiz: Distance vs. Displacement',
      questions: [
        {
          id: 'q1_1',
          type: 'multiple-choice',
          prompt: 'A drone flies 30 m East, turns around, and flies 10 m West. What are its total distance and displacement?',
          options: [
            'Distance = 40 m, Displacement = 20 m East',
            'Distance = 20 m, Displacement = 40 m East',
            'Distance = 40 m, Displacement = 40 m East',
            'Distance = 20 m, Displacement = 20 m East'
          ],
          correctOptionIndex: 0,
          explanation:
            'Distance is scalar path length: 30 m + 10 m = 40 m. Displacement is change in position: +30 m - 10 m = +20 m East.'
        },
        {
          id: 'q1_2',
          type: 'true-false',
          prompt: 'Can the magnitude of displacement ever be strictly greater than the distance traveled?',
          options: ['True', 'False'],
          correctOptionIndex: 1,
          explanation:
            'False. The shortest path between any two points is a straight line, so distance is always greater than or equal to displacement magnitude (|Δr| ≤ d).'
        },
        {
          id: 'q1_3',
          type: 'numerical',
          prompt: 'A drone travels 12 m North and 5 m East. What is the magnitude of its net displacement?',
          correctNumericalValue: 13,
          numericalTolerance: 0.1,
          unit: 'm',
          explanation:
            'By the Pythagorean theorem: |Δr| = √(12² + 5²) = √(144 + 25) = √169 = 13.0 m.'
        }
      ]
    },
    2: {
      levelId: 2,
      title: 'Level 2 Mastery Quiz: Average Speed vs. Velocity',
      questions: [
        {
          id: 'q2_1',
          type: 'multiple-choice',
          prompt: 'A delivery vehicle runs around a closed 400 m track in 80 s, returning exactly to its starting line. What is its average velocity?',
          options: ['5 m/s', '0 m/s', '400 m/s', '80 m/s'],
          correctOptionIndex: 1,
          explanation:
            'Because the vehicle returned to its start point, net displacement is 0 m. Therefore average velocity = 0 / 80 = 0 m/s.'
        },
        {
          id: 'q2_2',
          type: 'numerical',
          prompt: 'In the track scenario above (400 m traveled in 80 s), what was the average speed of the vehicle?',
          correctNumericalValue: 5.0,
          numericalTolerance: 0.05,
          unit: 'm/s',
          explanation: 'Average speed = total distance / total time = 400 m / 80 s = 5.0 m/s.'
        }
      ]
    },
    3: {
      levelId: 3,
      title: 'Level 3 Mastery Quiz: Acceleration',
      questions: [
        {
          id: 'q3_1',
          type: 'multiple-choice',
          prompt: 'A vehicle moves at +20 m/s and experiences an acceleration of -5 m/s². What is happening to the vehicle?',
          options: [
            'It is speeding up in the positive direction',
            'It is slowing down (decelerating) because velocity and acceleration have opposite signs',
            'It is traveling at constant speed',
            'It immediately reverses direction'
          ],
          correctOptionIndex: 1,
          explanation:
            'When velocity and acceleration have opposite signs (v·a < 0), the speed decreases (deceleration).'
        },
        {
          id: 'q3_2',
          type: 'numerical',
          prompt: 'A cart accelerates from rest (vi = 0 m/s) to 24 m/s in 6.0 s. What is its acceleration?',
          correctNumericalValue: 4.0,
          numericalTolerance: 0.05,
          unit: 'm/s²',
          explanation: 'a = (vf - vi) / t = (24 - 0) / 6.0 = 4.0 m/s².'
        }
      ]
    },
    4: {
      levelId: 4,
      title: 'Level 4 Mastery Quiz: Uniformly Accelerated Motion (UARM)',
      questions: [
        {
          id: 'q4_1',
          type: 'numerical',
          prompt: 'A rocket sled starts from rest and accelerates at 2.0 m/s² for 6.0 s. What distance does it cover?',
          correctNumericalValue: 36.0,
          numericalTolerance: 0.2,
          unit: 'm',
          explanation: 'Δx = vi·t + ½·a·t² = 0(6) + ½(2)(6²) = 36.0 m.'
        },
        {
          id: 'q4_2',
          type: 'multiple-choice',
          prompt: 'Which equation allows you to calculate final velocity if elapsed time is NOT given?',
          options: [
            'vf = vi + at',
            'Δx = vi·t + ½at²',
            'vf² = vi² + 2aΔx',
            'v_avg = d / t'
          ],
          correctOptionIndex: 2,
          explanation: 'Torricelli’s equation (vf² = vi² + 2aΔx) relates velocity, acceleration, and displacement without time.'
        }
      ]
    },
    5: {
      levelId: 5,
      title: 'Level 5 Mastery Quiz: Rotation, Revolution, and Period',
      questions: [
        {
          id: 'q5_1',
          type: 'multiple-choice',
          prompt: 'What is the physical difference between rotation and revolution?',
          options: [
            'Rotation is turning about an internal axis; revolution is traveling around an external axis',
            'Rotation is around an external axis; revolution is around an internal axis',
            'Rotation is scalar; revolution is vector',
            'There is no physical difference'
          ],
          correctOptionIndex: 0,
          explanation: 'Rotation refers to spin around an internal axis (e.g. Earth spinning daily); revolution is orbital motion around an external center (e.g. Earth around Sun).'
        },
        {
          id: 'q5_2',
          type: 'numerical',
          prompt: 'A wheel completes 10 full revolutions in 5.0 seconds. What is its period (T)?',
          correctNumericalValue: 0.5,
          numericalTolerance: 0.05,
          unit: 's',
          explanation: 'Period T = total time / number of cycles = 5.0 s / 10 cycles = 0.5 s.'
        }
      ]
    },
    6: {
      levelId: 6,
      title: 'Level 6 Mastery Quiz: Linear vs. Rotational Speed',
      questions: [
        {
          id: 'q6_1',
          type: 'multiple-choice',
          prompt: 'Two runners stand on a rotating merry-go-round: Runner A is 1 m from the center, Runner B is 3 m from the center. How do their speeds compare?',
          options: [
            'Both have the same angular speed, but Runner B has 3 times higher linear speed',
            'Runner A has 3 times higher linear speed',
            'Both have identical linear and angular speeds',
            'Runner B has lower angular speed'
          ],
          correctOptionIndex: 0,
          explanation: 'On a rigid rotating body, angular speed ω is constant everywhere. Since linear speed v = r·ω, tripling the radius triples the linear speed.'
        }
      ]
    },
    7: {
      levelId: 7,
      title: 'Level 7 Mastery Quiz: Tangential Velocity & Centripetal Acceleration',
      questions: [
        {
          id: 'q7_1',
          type: 'multiple-choice',
          prompt: 'When a car rounds a curve and suddenly hits frictionless ice, what trajectory does it follow?',
          options: [
            'It is pushed outward away from the center by centrifugal force',
            'It continues in a straight line tangent to the circle at the moment friction vanished',
            'It spirals inward towards the center',
            'It instantly comes to a complete halt'
          ],
          correctOptionIndex: 1,
          explanation: 'By Newton’s First Law (inertia), when the inward centripetal friction force disappears, the car continues moving straight along its instantaneous tangential velocity vector.'
        },
        {
          id: 'q7_2',
          type: 'numerical',
          prompt: 'A cart travels at 8.0 m/s around a circular curve of radius 16.0 m. What is its centripetal acceleration?',
          correctNumericalValue: 4.0,
          numericalTolerance: 0.1,
          unit: 'm/s²',
          explanation: 'ac = v² / r = (8.0)² / 16.0 = 64 / 16 = 4.0 m/s² pointing radially inward.'
        }
      ]
    },
    8: {
      levelId: 8,
      title: 'Level 8 Mastery Quiz: Centripetal Force & Real Applications',
      questions: [
        {
          id: 'q8_1',
          type: 'multiple-choice',
          prompt: 'In a washing machine spin cycle, why does water separate from clothes?',
          options: [
            'Centrifugal force pushes the water outward',
            'The drum wall exerts an inward normal force on the clothes, but water passes through holes continuing tangentially due to inertia',
            'Water expands due to heat',
            'Gravity turns off inside a spinning drum'
          ],
          correctOptionIndex: 1,
          explanation: 'In an inertial frame, no outward centrifugal force exists. The perforated drum exerts normal force on clothes to keep them in circular motion, while water droplets continue in straight tangential lines through the holes due to inertia.'
        },
        {
          id: 'q8_2',
          type: 'numerical',
          prompt: 'A 2.0 kg ball is whirled on a string of radius 3.0 m at a speed of 6.0 m/s. What inward tension force must the string provide?',
          correctNumericalValue: 24.0,
          numericalTolerance: 0.2,
          unit: 'N',
          explanation: 'Fc = m·v² / r = (2.0)(6.0²) / 3.0 = (2.0 × 36) / 3 = 72 / 3 = 24.0 N.'
        }
      ]
    }
  };

  public static getQuiz(levelId: number): LevelQuiz | null {
    return this.QUIZZES[levelId] || null;
  }
}
