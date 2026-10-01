import { SaveSystem, SaveData, LevelProgress } from './SaveSystem.ts';

export interface ScoreBreakdown {
  physicsAccuracyScore: number; // 0 - 100
  puzzleCompletionScore: number; // 0 - 100
  conceptUnderstandingScore: number; // 0 - 100
  efficiencyScore: number; // 0 - 100
  totalScore: number; // 0 - 100
  stars: number; // 1, 2, or 3
}

export class ProgressionSystem {
  private data: SaveData;

  // Configurable weights per Section 17
  public static readonly WEIGHTS = {
    physicsAccuracy: 0.40,
    puzzleCompletion: 0.30,
    conceptUnderstanding: 0.20,
    efficiency: 0.10
  };

  constructor() {
    this.data = SaveSystem.load();
  }

  public getData(): SaveData {
    return this.data;
  }

  public isLevelUnlocked(levelId: number): boolean {
    if (this.data.practiceMode) return true; // Practice mode allows free play
    return levelId <= this.data.unlockedLevel;
  }

  public setPracticeMode(enabled: boolean): void {
    this.data.practiceMode = enabled;
    SaveSystem.save(this.data);
  }

  public calculateScore(
    physicsAccuracy: number,
    puzzleCompletion: number,
    quizScorePercent: number,
    efficiency: number
  ): ScoreBreakdown {
    const w = ProgressionSystem.WEIGHTS;
    const clampedAcc = Math.max(0, Math.min(100, physicsAccuracy));
    const clampedPuzzle = Math.max(0, Math.min(100, puzzleCompletion));
    const clampedQuiz = Math.max(0, Math.min(100, quizScorePercent));
    const clampedEff = Math.max(0, Math.min(100, efficiency));

    const total =
      clampedAcc * w.physicsAccuracy +
      clampedPuzzle * w.puzzleCompletion +
      clampedQuiz * w.conceptUnderstanding +
      clampedEff * w.efficiency;

    let stars = 1;
    if (total >= 85) stars = 3;
    else if (total >= 65) stars = 2;

    return {
      physicsAccuracyScore: Math.round(clampedAcc),
      puzzleCompletionScore: Math.round(clampedPuzzle),
      conceptUnderstandingScore: Math.round(clampedQuiz),
      efficiencyScore: Math.round(clampedEff),
      totalScore: Math.round(total),
      stars
    };
  }

  public recordLevelCompletion(
    levelId: number,
    scoreBreakdown: ScoreBreakdown,
    quizCorrect: number,
    quizTotal: number
  ): void {
    const existing = this.data.completedLevels[levelId] || {
      levelId,
      completed: true,
      stars: 0,
      bestScore: 0,
      quizScore: 0,
      quizTotal,
      attempts: 0
    };

    const updated: LevelProgress = {
      levelId,
      completed: true,
      stars: Math.max(existing.stars, scoreBreakdown.stars),
      bestScore: Math.max(existing.bestScore, scoreBreakdown.totalScore),
      quizScore: Math.max(existing.quizScore, quizCorrect),
      quizTotal,
      attempts: existing.attempts + 1
    };

    this.data.completedLevels[levelId] = updated;

    // Unlock next level if this was the highest unlocked level
    if (levelId === this.data.unlockedLevel && levelId < 8) {
      this.data.unlockedLevel = levelId + 1;
    }

    SaveSystem.save(this.data);
  }
}
