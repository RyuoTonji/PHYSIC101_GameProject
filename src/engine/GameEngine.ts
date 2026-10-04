import { LevelBase } from '../levels/LevelBase.ts';
import { LevelRegistry } from '../levels/LevelRegistry.ts';
import { InputManager } from './InputManager.ts';
import { AudioFeedback } from './AudioFeedback.ts';
import { EducationalHUD } from '../education/EducationalHUD.ts';
import { DebugVisualizer } from '../systems/DebugVisualizer.ts';
import { ProgressionSystem, ScoreBreakdown } from '../systems/ProgressionSystem.ts';
import { HintSystem } from '../education/HintSystem.ts';
import { QuizSystem, QuizQuestion } from '../education/QuizSystem.ts';
import { FailureFeedback } from '../education/FailureFeedback.ts';
import { TutorialSystem } from '../education/TutorialSystem.ts';
import { SaveSystem } from '../systems/SaveSystem.ts';
import { PHYSICS_CONSTANTS } from '../physics/PhysicsConstants.ts';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private hudContainer: HTMLElement;
  private modalContainer: HTMLElement;

  public currentLevel: LevelBase;
  public input: InputManager;
  public audio: AudioFeedback;
  public progression: ProgressionSystem;

  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private fpsCounter: number = 60;
  private framesThisSec: number = 0;
  private lastFpsUpdate: number = 0;

  // Active quiz state
  private activeQuizIndex: number = 0;
  private quizAnswers: Map<string, boolean> = new Map();

  constructor(
    canvas: HTMLCanvasElement,
    hudContainer: HTMLElement,
    modalContainer: HTMLElement
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;
    this.hudContainer = hudContainer;
    this.modalContainer = modalContainer;

    this.input = new InputManager();
    this.audio = new AudioFeedback();
    this.progression = new ProgressionSystem();

    // Default to Central Hub (Level 0) for open adventure exploration
    const initialLevelId = 0;
    this.currentLevel = LevelRegistry.createLevel(initialLevelId);

    this.input.attach(canvas);
    this.applySettings();
    this.setupDeveloperHotkeys();
  }

  public isSlowMo: boolean = false;
  public showHitboxes: boolean = false;

  private setupDeveloperHotkeys(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'f1') {
        e.preventDefault();
        const hud = document.getElementById('educationalHUD');
        if (hud) hud.style.display = hud.style.display === 'none' ? 'block' : 'none';
      } else if (key === 'f2' || key === 'v') {
        e.preventDefault();
        const s = this.progression.getData().settings;
        s.debugVectors = !s.debugVectors;
        SaveSystem.save(this.progression.getData());
        const vBtn = document.getElementById('btn-vectors-toggle');
        if (vBtn) vBtn.classList.toggle('active', s.debugVectors);
      } else if (key === 'f3') {
        e.preventDefault();
        this.showHitboxes = !this.showHitboxes;
      } else if (key === 'f4') {
        e.preventDefault();
        this.restartCurrentLevel();
      } else if (key === 'f5' || key === 'h') {
        // Return to Hub World
        if (e.target && (e.target as HTMLElement).tagName !== 'INPUT') {
          e.preventDefault();
          this.loadLevel(0);
          const sel = document.getElementById('level-select') as HTMLSelectElement | null;
          if (sel) sel.value = '0';
          window.dispatchEvent(new CustomEvent('levelChanged', { detail: { levelId: 0 } }));
        }
      } else if (key === 'f6') {
        e.preventDefault();
        this.isSlowMo = !this.isSlowMo;
      }
    });
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.lastFpsUpdate = performance.now();
    this.accumulator = 0;
    // Start directly in the playable world! No blocking popup!
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  public loadLevel(levelId: number): void {
    this.audio.stopEngineTone();
    this.modalContainer.style.display = 'none';
    this.modalContainer.innerHTML = '';
    this.currentLevel = LevelRegistry.createLevel(levelId);
    this.currentLevel.setPhase('puzzle');
    this.currentLevel.reset();
    this.activeQuizIndex = 0;
    this.quizAnswers.clear();
  }

  public restartCurrentLevel(): void {
    this.audio.stopEngineTone();
    this.modalContainer.style.display = 'none';
    this.modalContainer.innerHTML = '';
    this.currentLevel.reset();
    this.currentLevel.elapsedTime = 0;
    this.currentLevel.setPhase('puzzle');
    this.currentLevel.failureContext = null;
    this.activeQuizIndex = 0;
    this.quizAnswers.clear();
  }

  public resetAllProgress(): void {
    SaveSystem.resetProgress();
    this.progression = new ProgressionSystem();
    this.restartCurrentLevel();
    this.applySettings();
  }

  public togglePause(): void {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.audio.stopEngineTone();
    }
  }

  public setPracticeMode(enabled: boolean): void {
    this.progression.setPracticeMode(enabled);
  }

  private applySettings(): void {
    const s = this.progression.getData().settings;
    this.audio.setMuted(!s.soundEnabled);
    if (s.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }

  private gameLoop(now: number): void {
    if (!this.isRunning) return;

    let frameTime = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (frameTime > PHYSICS_CONSTANTS.MAX_ACCUMULATOR_STEP) {
      frameTime = PHYSICS_CONSTANTS.MAX_ACCUMULATOR_STEP;
    }

    // Apply slow motion if active (0.25x timescale for observing physics arcs)
    if (this.isSlowMo) {
      frameTime *= 0.25;
    }

    // FPS calculation
    this.framesThisSec++;
    if (now - this.lastFpsUpdate >= 1000) {
      this.fpsCounter = this.framesThisSec;
      this.framesThisSec = 0;
      this.lastFpsUpdate = now;
    }

    const inputState = this.input.getState();

    // Check pause input
    if (inputState.pause && !this.isPaused) {
      this.togglePause();
    }

    // Check instant reset
    if (inputState.reset) {
      this.restartCurrentLevel();
    }

    // Check portal transition requests from within the level
    const reqLevelId = (this.currentLevel as any).requestedLevelLoad;
    if (reqLevelId !== null && reqLevelId !== undefined) {
      (this.currentLevel as any).requestedLevelLoad = null;
      this.audio.playPortalTeleport();
      this.loadLevel(reqLevelId);
      const sel = document.getElementById('level-select') as HTMLSelectElement | null;
      if (sel) sel.value = String(reqLevelId);
      window.dispatchEvent(new CustomEvent('levelChanged', { detail: { levelId: reqLevelId } }));
    }

    if (!this.isPaused) {
      this.accumulator += frameTime;

      // Deterministic fixed timestep loop (60Hz)
      while (this.accumulator >= PHYSICS_CONSTANTS.FIXED_TIMESTEP) {
        this.currentLevel.fixedUpdate(PHYSICS_CONSTANTS.FIXED_TIMESTEP, inputState, this.audio);
        this.accumulator -= PHYSICS_CONSTANTS.FIXED_TIMESTEP;

        // Monitor completion or failure
        if (this.currentLevel.phase === 'explanation' && !this.isModalOpen()) {
          this.audio.playSuccess();
          this.showPhaseModal();
        } else if (this.currentLevel.phase === 'completed' && !this.isModalOpen()) {
          this.audio.playSuccess();
          this.renderCompletionScreen();
        } else if (this.currentLevel.phase === 'failed' && !this.isModalOpen()) {
          this.audio.playFailure();
          this.showPhaseModal();
        }
      }

      // Audio feedback updates
      const hudState = this.currentLevel.getHUDState();
      if (hudState.speed !== undefined && hudState.speed > 0.1 && (this.currentLevel as any).axel === undefined) {
        this.audio.playEngineTone(hudState.speed);
      } else {
        this.audio.stopEngineTone();
      }
    }

    // Render pass
    const alpha = this.accumulator / PHYSICS_CONSTANTS.FIXED_TIMESTEP;
    this.render(alpha);

    // Update HUD telemetry and mission goals/controls in right panel
    const hudState = this.currentLevel.getHUDState();
    const tut = TutorialSystem.getTutorial(this.currentLevel.config.id);
    hudState.goalText = tut.objective;
    hudState.controlsText = tut.controlsExplanation;
    hudState.activeKeys = this.input.getActiveKeyNames().map(k => k.toUpperCase());
    hudState.fps = this.fpsCounter;
    EducationalHUD.render(this.hudContainer, hudState);

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private render(interpolation: number): void {
    // Clear canvas
    this.ctx.fillStyle = '#0a0f1d';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render level
    this.currentLevel.render(this.ctx, interpolation);

    // Render debug vectors if enabled
    const settings = this.progression.getData().settings;
    if (settings.debugVectors) {
      const debugData = this.currentLevel.getDebugData();
      debugData.fps = this.fpsCounter;
      DebugVisualizer.draw(this.ctx, debugData);
    }
  }

  private isModalOpen(): boolean {
    return this.modalContainer.style.display !== 'none';
  }

  public showHint(tier: 1 | 2 | 3): void {
    const hints = HintSystem.getHints(this.currentLevel.config.id);
    let title = 'Hint 1: Conceptual Reasoning';
    let text = hints.hint1_conceptual;

    if (tier === 2) {
      title = 'Hint 2: Governing Physical Formula';
      text = hints.hint2_formula;
    } else if (tier === 3) {
      title = 'Hint 3: Step-by-Step Guided Substitution';
      text = hints.hint3_guidedSolution;
    }

    this.modalContainer.innerHTML = `
      <div class="modal-card">
        <div class="modal-badge">HINT SYSTEM — TIER ${tier}</div>
        <h2 class="modal-title">${title}</h2>
        <div class="modal-body">${text}</div>
        <div class="modal-actions">
          <button class="btn btn-primary" id="btn-close-hint">Return to Simulation</button>
        </div>
      </div>
    `;
    this.modalContainer.style.display = 'flex';
    document.getElementById('btn-close-hint')?.addEventListener('click', () => {
      this.modalContainer.style.display = 'none';
    });
  }

  public showTutorial(): void {
    const tut = TutorialSystem.getTutorial(this.currentLevel.config.id);
    const stepsHtml = tut.stepByStep
      .map(step => `<div class="tutorial-step-item">${step}</div>`)
      .join('');

    this.modalContainer.innerHTML = `
      <div class="modal-card tutorial-modal-card">
        <div class="modal-badge success">LEVEL ${tut.levelId} TUTORIAL & CONTROLS GUIDE</div>
        <h2 class="modal-title">${tut.title}</h2>
        <div class="learning-obj-box">
          <strong>🎯 Mission Objective:</strong> ${tut.objective}
        </div>
        <div class="learning-obj-box" style="border-left-color: #fbbf24; background: rgba(245, 158, 11, 0.1);">
          <strong>🎮 Controls Guide:</strong> ${tut.controlsExplanation}
        </div>
        <div class="tutorial-step-list">
          <strong style="color: #38bdf8; font-size: 13px;">📋 Step-by-Step Instructions:</strong>
          ${stepsHtml}
        </div>
        <div class="physics-box">
          <strong>💡 Key Physics Principle:</strong> ${tut.physicsInsight}
        </div>
        <div class="v-row" style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
          <strong>Target Benchmark Values:</strong> ${tut.expectedValues}
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" id="btn-close-tut">Got It! Play Level</button>
        </div>
      </div>
    `;
    this.modalContainer.style.display = 'flex';
    document.getElementById('btn-close-tut')?.addEventListener('click', () => {
      this.modalContainer.style.display = 'none';
      if (this.currentLevel.phase === 'intro') {
        this.currentLevel.setPhase('puzzle');
        this.currentLevel.reset();
      }
    });
  }

  public showPhaseModal(): void {
    const phase = this.currentLevel.phase;
    const config = this.currentLevel.config;

    if (phase === 'intro') {
      this.modalContainer.innerHTML = `
        <div class="modal-card">
          <div class="modal-badge">LEVEL ${config.id} BRIEFING</div>
          <h2 class="modal-title">${config.title}</h2>
          <div class="modal-subtitle">${config.subtitle}</div>
          <div class="learning-obj-box">
            <strong>🎯 Learning Objective:</strong> ${config.learningObjective}
          </div>
          <p class="modal-body">${config.conceptSummary}</p>
          <div class="modal-actions">
            <button class="btn btn-primary" id="btn-start-demo">Watch Demonstration (2)</button>
            <button class="btn btn-secondary" id="btn-start-puzzle">Jump to Puzzle (4)</button>
          </div>
        </div>
      `;
      this.modalContainer.style.display = 'flex';

      document.getElementById('btn-start-demo')?.addEventListener('click', () => {
        this.currentLevel.setPhase('demo');
        this.currentLevel.reset();
        this.modalContainer.style.display = 'none';
      });
      document.getElementById('btn-start-puzzle')?.addEventListener('click', () => {
        this.currentLevel.setPhase('puzzle');
        this.currentLevel.reset();
        this.modalContainer.style.display = 'none';
      });
    } else if (phase === 'explanation') {
      this.modalContainer.innerHTML = `
        <div class="modal-card">
          <div class="modal-badge success">PUZZLE COMPLETED!</div>
          <h2 class="modal-title">Physics Concept Explanation</h2>
          <div class="modal-body">
            <p>${config.conceptSummary}</p>
            <p>Every step of your trajectory is independently verifiable through the mathematical formulas of mechanics.</p>
          </div>
          <div class="modal-actions">
            <button class="btn btn-primary" id="btn-to-verification">Proceed to Verification (7)</button>
          </div>
        </div>
      `;
      this.modalContainer.style.display = 'flex';

      document.getElementById('btn-to-verification')?.addEventListener('click', () => {
        this.currentLevel.setPhase('verification');
        this.showPhaseModal();
      });
    } else if (phase === 'verification') {
      const v = this.currentLevel.verifyAnalytical();
      this.modalContainer.innerHTML = `
        <div class="modal-card">
          <div class="modal-badge info">ANALYTICAL VS SIMULATION VERIFICATION</div>
          <h2 class="modal-title">Mathematical Rigor Check</h2>
          <div class="verification-box">
            <div class="v-row"><strong>Analytical Prediction:</strong> ${v.analyticalText}</div>
            <div class="v-row"><strong>Physics Engine Result:</strong> ${v.simulationText}</div>
            <div class="v-row text-success"><strong>Tolerance Verification:</strong> ${v.errorText}</div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-primary" id="btn-to-quiz">Start Mini-Quiz (8)</button>
          </div>
        </div>
      `;
      this.modalContainer.style.display = 'flex';

      document.getElementById('btn-to-quiz')?.addEventListener('click', () => {
        this.currentLevel.setPhase('quiz');
        this.activeQuizIndex = 0;
        this.quizAnswers.clear();
        this.showPhaseModal();
      });
    } else if (phase === 'quiz') {
      this.renderQuizQuestion();
    } else if (phase === 'completed') {
      this.renderCompletionScreen();
    } else if (phase === 'failed') {
      const fb = FailureFeedback.generateExplanation(
        this.currentLevel.failureContext || {
          levelId: config.id,
          reason: 'out_of_bounds'
        }
      );
      this.modalContainer.innerHTML = `
        <div class="modal-card failure">
          <div class="modal-badge failure">TRAJECTORY FAILURE</div>
          <h2 class="modal-title">${fb.title}</h2>
          <div class="modal-body">${fb.description}</div>
          ${fb.mathBreakdown ? `<div class="math-breakdown-box">${fb.mathBreakdown}</div>` : ''}
          <div class="modal-actions">
            <button class="btn btn-primary" id="btn-retry">Retry Level</button>
            <button class="btn btn-secondary" id="btn-hint1">View Conceptual Hint</button>
          </div>
        </div>
      `;
      this.modalContainer.style.display = 'flex';

      document.getElementById('btn-retry')?.addEventListener('click', () => {
        this.restartCurrentLevel();
        this.currentLevel.setPhase('puzzle');
        this.modalContainer.style.display = 'none';
      });
      document.getElementById('btn-hint1')?.addEventListener('click', () => {
        this.showHint(1);
      });
    }
  }

  private renderQuizQuestion(): void {
    const quiz = QuizSystem.getQuiz(this.currentLevel.config.id);
    if (!quiz || this.activeQuizIndex >= quiz.questions.length) {
      // Quiz complete!
      this.currentLevel.setPhase('completed');
      this.renderCompletionScreen();
      return;
    }

    const q: QuizQuestion = quiz.questions[this.activeQuizIndex];
    let formContent = '';

    if (q.type === 'multiple-choice' || q.type === 'true-false') {
      formContent = (q.options || [])
        .map(
          (opt, idx) => `
          <button class="quiz-option-btn" data-index="${idx}">
            <span class="opt-label">${String.fromCharCode(65 + idx)}</span> ${opt}
          </button>
        `
        )
        .join('');
    } else if (q.type === 'numerical') {
      formContent = `
        <div class="numerical-input-group">
          <input type="number" step="any" id="quiz-num-input" placeholder="Enter numerical answer (${q.unit || ''})" />
          <button class="btn btn-primary" id="btn-submit-num">Submit Answer</button>
        </div>
      `;
    }

    this.modalContainer.innerHTML = `
      <div class="modal-card quiz">
        <div class="modal-badge">MINI-QUIZ: QUESTION ${this.activeQuizIndex + 1} OF ${quiz.questions.length}</div>
        <h3 class="quiz-question-prompt">${q.prompt}</h3>
        <div class="quiz-options-container">${formContent}</div>
        <div id="quiz-feedback-box" style="display:none;" class="quiz-feedback-box"></div>
      </div>
    `;
    this.modalContainer.style.display = 'flex';

    // Hook answer evaluation
    if (q.type === 'multiple-choice' || q.type === 'true-false') {
      const btns = this.modalContainer.querySelectorAll('.quiz-option-btn');
      btns.forEach(btn => {
        btn.addEventListener('click', e => {
          const target = e.currentTarget as HTMLElement;
          const chosenIdx = parseInt(target.getAttribute('data-index') || '0', 10);
          const isCorrect = chosenIdx === q.correctOptionIndex;
          this.handleQuizAnswer(q, isCorrect);
        });
      });
    } else if (q.type === 'numerical') {
      document.getElementById('btn-submit-num')?.addEventListener('click', () => {
        const inputEl = document.getElementById('quiz-num-input') as HTMLInputElement;
        const val = parseFloat(inputEl.value);
        const tol = q.numericalTolerance ?? 0.1;
        const isCorrect = Math.abs(val - (q.correctNumericalValue ?? 0)) <= tol;
        this.handleQuizAnswer(q, isCorrect);
      });
    }
  }

  private handleQuizAnswer(q: QuizQuestion, isCorrect: boolean): void {
    this.quizAnswers.set(q.id, isCorrect);
    const feedbackBox = document.getElementById('quiz-feedback-box');
    if (!feedbackBox) return;

    feedbackBox.style.display = 'block';
    feedbackBox.className = `quiz-feedback-box ${isCorrect ? 'correct' : 'incorrect'}`;
    feedbackBox.innerHTML = `
      <div class="feedback-status">${isCorrect ? '✓ CORRECT!' : '✗ INCORRECT'}</div>
      <div class="feedback-exp">${q.explanation}</div>
      <button class="btn btn-primary mt-3" id="btn-next-q">Next Question ➔</button>
    `;

    document.getElementById('btn-next-q')?.addEventListener('click', () => {
      this.activeQuizIndex++;
      this.renderQuizQuestion();
    });
  }

  private renderCompletionScreen(): void {
    const quiz = QuizSystem.getQuiz(this.currentLevel.config.id);
    const totalQ = quiz ? quiz.questions.length : 1;
    let correctCount = 0;
    this.quizAnswers.forEach(correct => {
      if (correct) correctCount++;
    });

    const quizPercent = (correctCount / totalQ) * 100;
    const scoreBreakdown: ScoreBreakdown = this.progression.calculateScore(
      100, // 40% accuracy
      100, // 30% puzzle completion
      quizPercent, // 20% concept understanding
      90 // 10% efficiency
    );

    this.progression.recordLevelCompletion(
      this.currentLevel.config.id,
      scoreBreakdown,
      correctCount,
      totalQ
    );

    const starsHtml = '★'.repeat(scoreBreakdown.stars) + '☆'.repeat(3 - scoreBreakdown.stars);

    this.modalContainer.innerHTML = `
      <div class="modal-card completion">
        <div class="modal-badge success">LEVEL COMPLETED!</div>
        <h2 class="modal-title">${this.currentLevel.config.title}</h2>
        <div class="stars-display">${starsHtml}</div>
        <div class="score-card">
          <div class="total-score-val">${scoreBreakdown.totalScore} / 100</div>
          <div class="score-breakdown-grid">
            <div>Physics Accuracy (40%): <strong>${scoreBreakdown.physicsAccuracyScore}</strong></div>
            <div>Puzzle Completion (30%): <strong>${scoreBreakdown.puzzleCompletionScore}</strong></div>
            <div>Concept Quiz (20%): <strong>${scoreBreakdown.conceptUnderstandingScore}%</strong></div>
            <div>Efficiency (10%): <strong>${scoreBreakdown.efficiencyScore}</strong></div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" id="btn-next-lvl">
            ${this.currentLevel.config.id < 8 ? `Proceed to Level ${this.currentLevel.config.id + 1} ➔` : 'Odyssey Completed!'}
          </button>
          <button class="btn btn-secondary" id="btn-replay">Replay Level in Practice Mode</button>
        </div>
      </div>
    `;
    this.modalContainer.style.display = 'flex';

    document.getElementById('btn-next-lvl')?.addEventListener('click', () => {
      const nextId = this.currentLevel.config.id + 1;
      if (nextId <= 8) {
        this.loadLevel(nextId);
        const sel = document.getElementById('level-select') as HTMLSelectElement | null;
        if (sel) sel.value = String(nextId);
        window.dispatchEvent(new CustomEvent('levelChanged', { detail: { levelId: nextId } }));
      } else {
        this.modalContainer.style.display = 'none';
      }
    });

    document.getElementById('btn-replay')?.addEventListener('click', () => {
      this.setPracticeMode(true);
      this.restartCurrentLevel();
      this.currentLevel.setPhase('puzzle');
      this.modalContainer.style.display = 'none';
    });
  }
}
