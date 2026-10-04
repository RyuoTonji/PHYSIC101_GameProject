import { Vector2 } from '../physics/Vector2.ts';

export interface HUDState {
  time: number; // seconds
  distance?: number; // meters
  displacement?: Vector2; // meters
  displacementMag?: number; // meters
  displacementAngle?: number; // degrees
  velocity?: Vector2; // m/s
  speed?: number; // m/s
  acceleration?: Vector2; // m/s^2
  accelerationMag?: number; // m/s^2
  angularSpeed?: number; // rad/s
  radius?: number; // meters
  centripetalAccel?: number; // m/s^2
  centripetalForce?: number; // N
  period?: number; // s
  frequency?: number; // Hz
  activeFormulaName: string;
  activeFormulaLatex: string;
  substitutedFormula: string;
  // External telemetry and mission state
  goalText?: string;
  controlsText?: string;
  activeKeys?: string[];
  fps?: number;
}

export class EducationalHUD {
  public static render(container: HTMLElement, state: HUDState): void {
    let rowsHtml = `
      <div class="hud-item"><span class="hud-label">TIME</span> <span class="hud-val">${state.time.toFixed(2)} s</span></div>
    `;

    if (state.speed !== undefined) {
      rowsHtml += `<div class="hud-item"><span class="hud-label">SPEED v</span> <span class="hud-val">${state.speed.toFixed(2)} m/s</span></div>`;
    }

    if (state.distance !== undefined) {
      rowsHtml += `<div class="hud-item"><span class="hud-label">DISTANCE d</span> <span class="hud-val">${state.distance.toFixed(2)} m</span></div>`;
    }

    if (state.displacementMag !== undefined) {
      rowsHtml += `
        <div class="hud-item"><span class="hud-label">DISPLACEMENT |Δr|</span> <span class="hud-val">${state.displacementMag.toFixed(2)} m</span></div>
        <div class="hud-item"><span class="hud-label">DIRECTION θ</span> <span class="hud-val">${(state.displacementAngle ?? 0).toFixed(1)}°</span></div>
      `;
    }

    if (state.accelerationMag !== undefined) {
      rowsHtml += `<div class="hud-item"><span class="hud-label">ACCEL a</span> <span class="hud-val">${state.accelerationMag.toFixed(2)} m/s²</span></div>`;
    }

    if (state.angularSpeed !== undefined) {
      rowsHtml += `<div class="hud-item"><span class="hud-label">ANGULAR ω</span> <span class="hud-val">${state.angularSpeed.toFixed(2)} rad/s</span></div>`;
    }

    if (state.radius !== undefined) {
      rowsHtml += `<div class="hud-item"><span class="hud-label">RADIUS r</span> <span class="hud-val">${state.radius.toFixed(2)} m</span></div>`;
    }

    if (state.centripetalAccel !== undefined) {
      rowsHtml += `<div class="hud-item"><span class="hud-label">CENTRIPETAL a_c</span> <span class="hud-val">${state.centripetalAccel.toFixed(2)} m/s²</span></div>`;
    }

    if (state.centripetalForce !== undefined) {
      rowsHtml += `<div class="hud-item"><span class="hud-label">CENTRIPETAL F_c</span> <span class="hud-val">${state.centripetalForce.toFixed(2)} N</span></div>`;
    }

    if (state.period !== undefined) {
      rowsHtml += `<div class="hud-item"><span class="hud-label">PERIOD T</span> <span class="hud-val">${state.period.toFixed(2)} s</span></div>`;
    }

    if (state.frequency !== undefined) {
      rowsHtml += `<div class="hud-item"><span class="hud-label">FREQUENCY f</span> <span class="hud-val">${state.frequency.toFixed(2)} Hz</span></div>`;
    }

    const activeKeysStr = state.activeKeys && state.activeKeys.length > 0 ? state.activeKeys.join(' + ') : 'NONE';
    const activeKeysColor = state.activeKeys && state.activeKeys.length > 0 ? '#00f0ff' : '#64748b';

    container.innerHTML = `
      <!-- Telemetry Metrics Card -->
      <div class="hud-card telemetry-card">
        <div class="hud-card-header">
          <span class="hud-badge">TELEMETRY</span>
          <span class="hud-fps">${state.fps ?? 60} FPS</span>
        </div>
        <div class="hud-telemetry-grid">
          ${rowsHtml}
        </div>
      </div>

      <!-- Active Formula Card -->
      <div class="hud-card formula-card">
        <div class="formula-badge">ACTIVE PHYSICAL FORMULA</div>
        <div class="formula-title">${state.activeFormulaName}</div>
        <div class="formula-math">${state.activeFormulaLatex}</div>
        <div class="formula-sub">${state.substitutedFormula}</div>
      </div>

      <!-- Mission Current Goal & Controls Card (moved to the right below metrics) -->
      <div class="hud-card mission-card">
        <div class="mission-section">
          <div class="mission-badge goal">CURRENT GOAL</div>
          <div class="mission-text">${state.goalText || 'Explore and experiment.'}</div>
        </div>
        <div class="mission-section">
          <div class="mission-badge ctrl">CONTROLS</div>
          <div class="mission-text">${state.controlsText || 'A/D: Move | Space: Jump | E: Action'}</div>
        </div>
        <div class="active-keys-row">
          <span class="keys-label">ACTIVE KEYS:</span>
          <span class="keys-val" style="color: ${activeKeysColor}">${activeKeysStr}</span>
        </div>
      </div>
    `;
  }
}
