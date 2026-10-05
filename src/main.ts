import { GameEngine } from './engine/GameEngine.ts';
import { SaveSystem } from './systems/SaveSystem.ts';
import { Level04_UARM } from './levels/Level04_UARM.ts';
import { Level06_LinearVsRotational } from './levels/Level06_LinearVsRotational.ts';
import { Level07_TangentialCentripetal } from './levels/Level07_TangentialCentripetal.ts';
import { Level08_CentripetalForce } from './levels/Level08_CentripetalForce.ts';
import { Level09_PhysicsSandbox } from './levels/Level09_PhysicsSandbox.ts';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  const hudContainer = document.getElementById('educationalHUD') as HTMLElement;
  const modalContainer = document.getElementById('modalContainer') as HTMLElement;
  const levelSelect = document.getElementById('level-select') as HTMLSelectElement;
  const levelSpecificDock = document.getElementById('levelSpecificDock') as HTMLElement;

  const axelHealthDisplay = document.getElementById('axelHealthDisplay');
  const coresDisplay = document.getElementById('coresDisplay');

  if (!canvas || !hudContainer || !modalContainer || !levelSelect) {
    console.error('Core UI containers missing!');
    return;
  }

  const engine = new GameEngine(canvas, hudContainer, modalContainer);
  engine.start();

  // Function to refresh on-screen dock per level
  function refreshDock(): void {
    const lvlId = engine.currentLevel.config.id;

    if (!levelSpecificDock) return;
    levelSpecificDock.innerHTML = '';

    if (lvlId === 0) {
      levelSpecificDock.innerHTML = `
        <span class="dock-title">Central Nexus:</span>
        <button class="btn btn-primary" id="btn-dock-goto-1">🚀 Play Level 1</button>
        <button class="btn btn-secondary" id="btn-dock-goto-sb">🔬 Open Sandbox</button>
      `;
      document.getElementById('btn-dock-goto-1')?.addEventListener('click', () => {
        engine.loadLevel(1);
        levelSelect.value = '1';
        refreshDock();
      });
      document.getElementById('btn-dock-goto-sb')?.addEventListener('click', () => {
        engine.loadLevel(9);
        levelSelect.value = '9';
        refreshDock();
      });
    } else if (lvlId === 1) {
      levelSpecificDock.innerHTML = `
        <span class="dock-title">Wandering Path:</span>
        <button class="btn btn-secondary" id="btn-dock-lvl1-hub">🏛️ Central Hub</button>
        <button class="btn btn-secondary" id="btn-dock-lvl1-reset">🔄 Checkpoint</button>
      `;
      document.getElementById('btn-dock-lvl1-hub')?.addEventListener('click', () => {
        engine.loadLevel(0);
        levelSelect.value = '0';
        refreshDock();
      });
      document.getElementById('btn-dock-lvl1-reset')?.addEventListener('click', () => {
        engine.restartCurrentLevel();
      });
    } else if (lvlId === 4) {
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
        <span class="dock-title">Capsules:</span>
        <button class="btn btn-secondary ${lvl6.selectedRiderIndex === 0 ? 'active' : ''}" id="btn-rider-0">Inner (1m)</button>
        <button class="btn btn-secondary ${lvl6.selectedRiderIndex === 1 ? 'active' : ''}" id="btn-rider-1">Mid (2m)</button>
        <button class="btn btn-secondary ${lvl6.selectedRiderIndex === 2 ? 'active' : ''}" id="btn-rider-2">Outer (3m)</button>
      `;
      [0, 1, 2].forEach(idx => {
        document.getElementById(`btn-rider-${idx}`)?.addEventListener('click', () => {
          lvl6.selectedRiderIndex = idx;
          refreshDock();
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
          <button class="btn btn-hint" id="btn-l8-release">🚀 Release / Recall</button>
          <button class="btn btn-secondary" id="btn-l8-switch">🔄 Washing Machine</button>
        `;
        document.getElementById('btn-l8-release')?.addEventListener('click', () => {
          lvl8.triggerRelease();
        });
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
          refreshDock();
        });
      } else {
        levelSpecificDock.innerHTML = `
          <button class="btn btn-secondary" id="btn-l8-switch">🔄 Ball on String</button>
        `;
        document.getElementById('btn-l8-switch')?.addEventListener('click', () => {
          lvl8.switchScenario('ball_on_string');
          refreshDock();
        });
      }
    } else if (lvlId === 9) {
      const sb = engine.currentLevel as Level09_PhysicsSandbox;
      levelSpecificDock.innerHTML = `
        <button class="btn btn-primary" id="btn-sb-spawn-20">📦 +20kg Crate</button>
        <button class="btn btn-primary" id="btn-sb-spawn-40">📦 +40kg Crate</button>
        <button class="btn btn-secondary" id="btn-sb-g-moon">🌕 Moon</button>
        <button class="btn btn-secondary" id="btn-sb-g-earth">🌍 Earth</button>
        <button class="btn btn-secondary" id="btn-sb-g-jup">🪐 Jupiter</button>
        <button class="btn btn-secondary" id="btn-sb-g-zero">🌌 Zero-G</button>
      `;
      document.getElementById('btn-sb-spawn-20')?.addEventListener('click', () => sb.spawnCrate(20.0));
      document.getElementById('btn-sb-spawn-40')?.addEventListener('click', () => sb.spawnCrate(40.0));
      document.getElementById('btn-sb-g-moon')?.addEventListener('click', () => sb.setGravityPreset('moon'));
      document.getElementById('btn-sb-g-earth')?.addEventListener('click', () => sb.setGravityPreset('earth'));
      document.getElementById('btn-sb-g-jup')?.addEventListener('click', () => sb.setGravityPreset('jupiter'));
      document.getElementById('btn-sb-g-zero')?.addEventListener('click', () => sb.setGravityPreset('zero'));
    }
  }

  // Synchronize initial level in select & dock
  levelSelect.value = String(engine.currentLevel.config.id);
  refreshDock();

  // Listen for portal level change events
  window.addEventListener('levelChanged', ((e: CustomEvent<{ levelId: number }>) => {
    levelSelect.value = String(e.detail.levelId);
    refreshDock();
  }) as EventListener);

  // Level selector change
  levelSelect.addEventListener('change', () => {
    const lvl = parseInt(levelSelect.value, 10);
    engine.loadLevel(lvl);
    refreshDock();
  });

  // Quick Hub & Sandbox Buttons
  document.getElementById('btn-quick-hub')?.addEventListener('click', () => {
    engine.loadLevel(0);
    levelSelect.value = '0';
    refreshDock();
  });

  document.getElementById('btn-quick-sandbox')?.addEventListener('click', () => {
    engine.loadLevel(9);
    levelSelect.value = '9';
    refreshDock();
  });

  // Tutorial / Guide Button
  document.getElementById('btn-tutorial-open')?.addEventListener('click', () => {
    engine.showTutorial();
  });

  // Controls
  const vectorsBtn = document.getElementById('btn-vectors-toggle');
  vectorsBtn?.classList.toggle('active', engine.progression.getData().settings.debugVectors);
  vectorsBtn?.addEventListener('click', () => {
    const data = engine.progression.getData();
    data.settings.debugVectors = !data.settings.debugVectors;
    SaveSystem.save(data);
    vectorsBtn.classList.toggle('active', data.settings.debugVectors);
  });

  const slowmoBtn = document.getElementById('btn-slowmo-toggle');
  slowmoBtn?.addEventListener('click', () => {
    engine.isSlowMo = !engine.isSlowMo;
    slowmoBtn.classList.toggle('active', engine.isSlowMo);
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

  document.getElementById('btn-pause-toggle')?.addEventListener('click', () => {
    engine.togglePause();
  });

  document.getElementById('btn-reset')?.addEventListener('click', () => {
    engine.restartCurrentLevel();
    refreshDock();
  });

  document.getElementById('btn-clear-save')?.addEventListener('click', () => {
    if (confirm('Reset all scores, stars, and saved level progression back to initial state?')) {
      engine.resetAllProgress();
      refreshDock();
      coreCount = 0;
      if (coresDisplay) coresDisplay.textContent = '💠 CORES: 0';
      if (axelHealthDisplay) axelHealthDisplay.textContent = '❤️❤️❤️';
    }
  });

  // Health and Core Status Sync
  let coreCount = 0;
  setInterval(() => {
    const current = engine.currentLevel as any;
    if (current && current.axel && axelHealthDisplay) {
      const hearts = Math.max(0, current.axel.hearts ?? 3);
      axelHealthDisplay.textContent = '❤️'.repeat(hearts) + '🖤'.repeat(3 - hearts);
    }

    if (current && current.cores && coresDisplay) {
      const collected = current.cores.filter((c: any) => c.isCollected).length;
      if (collected !== coreCount) {
        coreCount = collected;
        coresDisplay.textContent = `💠 CORES: ${coreCount}`;
      }
    }
  }, 100);
});
