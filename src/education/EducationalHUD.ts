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
}

export class EducationalHUD {
  public static render(container: HTMLElement, state: HUDState): void {
    let rowsHtml = `
      <div class="hud-item"><span class="hud-label">TIME</span> <span class="hud-val">${state.time.toFixed(2)} s</span></div>
    `;

    if (state.distance !== undefined) {
      rowsHtml += `<div class="hud-item"><span class="hud-label">DISTANCE</span> <span class="hud-val">${state.distance.toFixed(2)} m</span></div>`;
    }

    if (state.displacementMag !== undefined) {
      rowsHtml += `
        <div class="hud-item"><span class="hud-label">DISPLACEMENT |Δr|</span> <span class="hud-val">${state.displacementMag.toFixed(2)} m</span></div>
        <div class="hud-item"><span class="hud-label">DIRECTION θ</span> <span class="hud-val">${(state.displacementAngle ?? 0).toFixed(1)}°</span></div>
      `;
    }

    if (state.speed !== undefined) {
      rowsHtml += `<div class="hud-item"><span class="hud-label">SPEED v</span> <span class="hud-val">${state.speed.toFixed(2)} m/s</span></div>`;
    }

    if (state.accelerationMag !== undefined) {
      rowsHtml += `<div class="hud-item"><span class="hud-label">ACCEL a</span> <span class="hud-val">${state.accelerationMag.toFixed(2)} m/s²</span></div>`;
    }

    if (state.angularSpeed !== undefined) {
      rowsHtml += `<div class="hud-item"><span class="hud-label">ANGULAR SPEED ω</span> <span class="hud-val">${state.angularSpeed.toFixed(2)} rad/s</span></div>`;
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

    container.innerHTML = `
      <div class="hud-telemetry-grid">
        ${rowsHtml}
      </div>
      <div class="hud-formula-card">
        <div class="formula-badge">ACTIVE PHYSICAL FORMULA</div>
        <div class="formula-title">${state.activeFormulaName}</div>
        <div class="formula-math">${state.activeFormulaLatex}</div>
        <div class="formula-sub">${state.substitutedFormula}</div>
      </div>
    `;
  }
}
