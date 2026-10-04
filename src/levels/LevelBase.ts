import { InputState } from '../engine/InputManager.ts';
import { AudioFeedback } from '../engine/AudioFeedback.ts';
import { HUDState } from '../education/EducationalHUD.ts';
import { DebugPhysicsData } from '../systems/DebugVisualizer.ts';
import { ScoreBreakdown } from '../systems/ProgressionSystem.ts';
import { PhysicsFailureContext } from '../education/FailureFeedback.ts';

export type LevelPhase =
  | 'intro'
  | 'demo'
  | 'guided'
  | 'puzzle'
  | 'challenge'
  | 'explanation'
  | 'verification'
  | 'quiz'
  | 'completed'
  | 'failed';

export interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  learningObjective: string;
  conceptSummary: string;
}

export abstract class LevelBase {
  public readonly config: LevelConfig;
  public phase: LevelPhase = 'puzzle';
  public elapsedTime: number = 0;
  public failureContext: PhysicsFailureContext | null = null;
  public lastScoreBreakdown: ScoreBreakdown | null = null;

  constructor(config: LevelConfig) {
    this.config = config;
  }

  public abstract reset(): void;
  public abstract fixedUpdate(dt: number, input: InputState, audio?: AudioFeedback): void;
  public abstract render(ctx: CanvasRenderingContext2D, interpolation: number): void;
  public abstract getHUDState(): HUDState;
  public abstract getDebugData(): DebugPhysicsData;
  public abstract verifyAnalytical(): {
    passed: boolean;
    analyticalText: string;
    simulationText: string;
    errorText: string;
  };

  public setPhase(phase: LevelPhase): void {
    this.phase = phase;
  }

  public fail(context: PhysicsFailureContext): void {
    this.failureContext = context;
    this.phase = 'failed';
  }

  public completePuzzle(): void {
    this.phase = 'explanation';
  }
}
