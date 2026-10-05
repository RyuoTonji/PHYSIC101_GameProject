export interface GameSettings {
  highContrast: boolean;
  textSize: 'normal' | 'large' | 'extra-large';
  soundEnabled: boolean;
  reducedMotion: boolean;
  debugVectors: boolean;
}

export interface LevelProgress {
  levelId: number;
  completed: boolean;
  stars: number; // 0 to 3
  bestScore: number;
  quizScore: number;
  quizTotal: number;
  attempts: number;
}

export interface SaveData {
  unlockedLevel: number;
  completedLevels: Record<number, LevelProgress>;
  settings: GameSettings;
  practiceMode: boolean;
}

const STORAGE_KEY = 'physics_101_odyssey_save_v1';

export class SaveSystem {
  private static defaultData: SaveData = {
    unlockedLevel: 1,
    completedLevels: {},
    settings: {
      highContrast: false,
      textSize: 'normal',
      soundEnabled: false,
      reducedMotion: false,
      debugVectors: true
    },
    practiceMode: false
  };

  public static load(): SaveData {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) return { ...this.defaultData };
      const parsed = JSON.parse(serialized);
      return {
        ...this.defaultData,
        ...parsed,
        settings: { ...this.defaultData.settings, ...(parsed.settings || {}) },
        completedLevels: parsed.completedLevels || {}
      };
    } catch {
      return { ...this.defaultData };
    }
  }

  public static save(data: SaveData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  public static resetProgress(): SaveData {
    const data = { ...this.defaultData };
    this.save(data);
    return data;
  }
}
