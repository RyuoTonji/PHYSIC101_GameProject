import { GameEngine } from './engine/GameEngine.ts';
import { SaveSystem } from './systems/SaveSystem.ts';
import { TutorialSystem } from './education/TutorialSystem.ts';
import { Level04_UARM } from './levels/Level04_UARM.ts';
import { Level06_LinearVsRotational } from './levels/Level06_LinearVsRotational.ts';
import { Level07_TangentialCentripetal } from './levels/Level07_TangentialCentripetal.ts';
import { Level08_CentripetalForce } from './levels/Level08_CentripetalForce.ts';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  const hudContainer = document.getElementById('educationalHUD') as HTMLElement;
  const modalContainer = document.getElementById('modalContainer') as HTMLElement;
  const levelSelect = document.getElementById('level-select') as HTMLSelectElement;

  const bannerGoal = document.getElementById('bannerGoalText') as HTMLElement;
  const bannerControls = document.getElementById('bannerControlsText') as HTMLElement;
  const activeKeysDisplay = document.getElementById('activeKeysDisplay') as HTMLElement;
  const levelSpecificDock = document.getElementById('levelSpecificDock') as HTMLElement;

  if (!canvas || !hudContainer || !modalContainer || !levelSelect) {
    console.error('Core UI containers missing!');
    return;
  }

  const engine = new GameEngine(canvas, hudContainer, modalContainer);
  engine.start();

  // Function to refresh banner and on-screen controls per level
  function refreshMissionBannerAndDock(): void {
    const lvlId = engine.currentLevel.config.id;
    const tut = TutorialSystem.getTutorial(lvlId);

    if (bannerGoal) bannerGoal.textContent = tut.objective;
    if (bannerControls) bannerControls.textContent = tut.controlsExplanation;

    // Render level specific dock controls
    if (!levelSpecificDock) return;
    levelSpecificDock.innerHTML = '';

    if (lvlId === 4) {
      const lvl4 = engine.currentLevel as Level04_UARM;
      levelSpecificDock.innerHTML = `
        <div class="dock-slider-group">
          <label class="dock-slider-label">Accel (a): <span id="lbl-lvl4-a">${lvl4.constantAccel.toFixed(1)} m/s²</span></label>
          <input type="range" class="dock-slider" id="slider-lvl4-a" min="0.5" max="5.0" step="0.1" value="${lvl4.constantAccel}" />
        </div>
        <button class="btn btn-primary" id="btn-lvl4-launch">🚀 Launch Rocket</button>
      `;
      document.getElementById('slider-lvl4-a')?.addEventListener('input', e => {
        const val = parseFloat((e.target as HTMLInputElement).value);
        lvl4.constantAccel = val;
        lvl4.accelX = val;
        const lbl = document.getElementById('lbl-lvl4-a');
        if (lbl) lbl.textContent = `${val.toFixed(1)} m/s²`;
      });
      document.getElementById('btn-lvl4-launch')?.addEventListener('click', () => {
        lvl4.launch();
      });
    } else if (lvlId === 6) {
      const lvl6 = engine.currentLevel as Level06_LinearVsRotational;
      levelSpecificDock.innerHTML = `
        <span style="font-size:11px;color:#94a3b8;font-weight:700;">Capsules:</span>
        <button class="btn btn-secondary ${lvl6.selectedRiderIndex === 0 ? 'active' : ''}" id="btn-rider-0">Inner (1m)</button>
        <button class="btn btn-secondary ${lvl6.selectedRiderIndex === 1 ? 'active' : ''}" id="btn-rider-1">Mid (2m)</button>
        <button class="btn btn-secondary ${lvl6.selectedRiderIndex === 2 ? 'active' : ''}" id="btn-rider-2">Outer (3m)</button>
      `;
      [0, 1, 2].forEach(idx => {
        document.getElementById(`btn-rider-${idx}`)?.addEventListener('click', () => {
          lvl6.selectedRiderIndex = idx;
          refreshMissionBannerAndDock();
        });
      });
    } else if (lvlId === 7) {
      const lvl7 = engine.currentLevel as Level07_TangentialCentripetal;
      levelSpecificDock.innerHTML = `
        <button class="btn btn-hint" id="btn-lvl7-release">❄️ Cut Centripetal Force (Hit Ice)</button>
      `;
      document.getElementById('btn-lvl7-release')?.addEventListener('click', () => {
        lvl7.triggerIceRelease();
      });
    } else if (lvlId === 8) {
      const lvl8 = engine.currentLevel as Level08_CentripetalForce;
      if (lvl8.scenario === 'ball_on_string') {
        levelSpecificDock.innerHTML = `
          <div class="dock-slider-group">
            <label class="dock-slider-label">Mass: <span id="lbl-l8-m">${lvl8.mass.toFixed(1)} kg</span></label>
            <input type="range" class="dock-slider" id="slider-l8-m" min="0.5" max="5.0" step="0.5" value="${lvl8.mass}" />
          </div>
          <div class="dock-slider-group">
            <label class="dock-slider-label">Radius: <span id="lbl-l8-r">${lvl8.radius.toFixed(1)} m</span></label>
            <input type="range" class="dock-slider" id="slider-l8-r" min="2.0" max="7.0" step="0.5" value="${lvl8.radius}" />
          </div>
          <div class="dock-slider-group">
            <label class="dock-slider-label">Speed: <span id="lbl-l8-v">${lvl8.speed.toFixed(1)} m/s</span></label>
            <input type="range" class="dock-slider" id="slider-l8-v" min="2.0" max="15.0" step="0.5" value="${lvl8.speed}" />
          </div>
          <button class="btn btn-secondary" id="btn-l8-switch">🔄 Washing Machine</button>
        `;
        document.getElementById('slider-l8-m')?.addEventListener('input', e => {
          lvl8.mass = parseFloat((e.target as HTMLInputElement).value);
          const lbl = document.getElementById('lbl-l8-m');
          if (lbl) lbl.textContent = `${lvl8.mass.toFixed(1)} kg`;
        });
        document.getElementById('slider-l8-r')?.addEventListener('input', e => {
          lvl8.radius = parseFloat((e.target as HTMLInputElement).value);
          const lbl = document.getElementById('lbl-l8-r');
          if (lbl) lbl.textContent = `${lvl8.radius.toFixed(1)} m`;
        });
        document.getElementById('slider-l8-v')?.addEventListener('input', e => {
          lvl8.speed = parseFloat((e.target as HTMLInputElement).value);
          const lbl = document.getElementById('lbl-l8-v');
          if (lbl) lbl.textContent = `${lvl8.speed.toFixed(1)} m/s`;
        });
        document.getElementById('btn-l8-switch')?.addEventListener('click', () => {
          lvl8.switchScenario('washing_machine');
          refreshMissionBannerAndDock();
        });
      } else {
        levelSpecificDock.innerHTML = `
          <button class="btn btn-secondary" id="btn-l8-switch">🔄 Ball on String</button>
        `;
        document.getElementById('btn-l8-switch')?.addEventListener('click', () => {
          lvl8.switchScenario('ball_on_string');
          refreshMissionBannerAndDock();
        });
      }
    }
  }

  // Synchronize initial level in select & banner
  levelSelect.value = String(engine.currentLevel.config.id);
  refreshMissionBannerAndDock();

  // Level selector change
  levelSelect.addEventListener('change', () => {
    const lvl = parseInt(levelSelect.value, 10);
    engine.loadLevel(lvl);
    refreshMissionBannerAndDock();
  });

  // Tutorial Button
  document.getElementById('btn-tutorial-open')?.addEventListener('click', () => {
    engine.showTutorial();
  });

  // Hints
  document.getElementById('btn-hint-1')?.addEventListener('click', () => engine.showHint(1));
  document.getElementById('btn-hint-2')?.addEventListener('click', () => engine.showHint(2));
  document.getElementById('btn-hint-3')?.addEventListener('click', () => engine.showHint(3));

  // Controls
  const practiceBtn = document.getElementById('btn-practice-toggle');
  practiceBtn?.addEventListener('click', () => {
    const data = engine.progression.getData();
    const newMode = !data.practiceMode;
    engine.setPracticeMode(newMode);
    practiceBtn.classList.toggle('active', newMode);
  });

  const vectorsBtn = document.getElementById('btn-vectors-toggle');
  vectorsBtn?.classList.toggle('active', engine.progression.getData().settings.debugVectors);
  vectorsBtn?.addEventListener('click', () => {
    const data = engine.progression.getData();
    data.settings.debugVectors = !data.settings.debugVectors;
    SaveSystem.save(data);
    vectorsBtn.classList.toggle('active', data.settings.debugVectors);
  });

  const soundBtn = document.getElementById('btn-sound-toggle');
  soundBtn?.classList.toggle('active', engine.progression.getData().settings.soundEnabled);
  soundBtn?.addEventListener('click', () => {
    const data = engine.progression.getData();
    data.settings.soundEnabled = !data.settings.soundEnabled;
    engine.audio.setMuted(!data.settings.soundEnabled);
    SaveSystem.save(data);
    soundBtn.classList.toggle('active', data.settings.soundEnabled);
  });

  const contrastBtn = document.getElementById('btn-contrast-toggle');
  contrastBtn?.addEventListener('click', () => {
    const data = engine.progression.getData();
    data.settings.highContrast = !data.settings.highContrast;
    SaveSystem.save(data);
    document.body.classList.toggle('high-contrast', data.settings.highContrast);
    contrastBtn.classList.toggle('active', data.settings.highContrast);
  });

  document.getElementById('btn-pause-toggle')?.addEventListener('click', () => {
    engine.togglePause();
  });

  document.getElementById('btn-reset')?.addEventListener('click', () => {
    engine.restartCurrentLevel();
    refreshMissionBannerAndDock();
  });

  // Virtual On-Screen Buttons Binding
  const virtualButtons = document.querySelectorAll('.ctrl-btn[data-key]');
  virtualButtons.forEach(btn => {
    const key = btn.getAttribute('data-key');
    if (!key) return;

    const startPress = (e: Event) => {
      e.preventDefault();
      engine.input.setVirtualKey(key, true);
      btn.classList.add('pressed');
    };

    const endPress = (e: Event) => {
      e.preventDefault();
      engine.input.setVirtualKey(key, false);
      btn.classList.remove('pressed');
    };

    btn.addEventListener('mousedown', startPress);
    btn.addEventListener('mouseup', endPress);
    btn.addEventListener('mouseleave', endPress);
    btn.addEventListener('touchstart', startPress, { passive: false });
    btn.addEventListener('touchend', endPress, { passive: false });
    btn.addEventListener('touchcancel', endPress, { passive: false });
  });

  // Live Active Keys Telemetry Strip
  setInterval(() => {
    if (!activeKeysDisplay) return;
    const active = engine.input.getActiveKeyNames();
    if (active.length === 0) {
      activeKeysDisplay.textContent = 'NONE';
      activeKeysDisplay.style.color = '#94a3b8';
    } else {
      activeKeysDisplay.textContent = active.join(' + ').toUpperCase();
      activeKeysDisplay.style.color = '#00f0ff';
    }
  }, 100);
});
