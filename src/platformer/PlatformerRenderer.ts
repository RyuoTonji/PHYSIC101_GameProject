import { Camera } from './Camera.ts';
import { Axel } from './Axel.ts';
import { SolidBox, RampSlope } from './WorldGeometry.ts';
import { MovingPlatform } from './MovingPlatform.ts';
import { PhysicsCrate } from './PhysicsCrate.ts';
import {
  PressureSwitch,
  EnergyBarrier,
  QuantumHazard,
  PhysicsCoreCollectible,
  CheckpointBeacon,
  QuantumPortal,
  NPCCharacter
} from './InteractiveElements.ts';
import { Vector2 } from '../physics/Vector2.ts';

export class PlatformerRenderer {
  public static renderWorld(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    worldWidth: number,
    worldHeight: number,
    solids: SolidBox[],
    ramps: RampSlope[],
    platforms: MovingPlatform[],
    crates: PhysicsCrate[],
    switches: PressureSwitch[],
    barriers: EnergyBarrier[],
    hazards: QuantumHazard[],
    cores: PhysicsCoreCollectible[],
    checkpoints: CheckpointBeacon[],
    portals: QuantumPortal[],
    npcs: NPCCharacter[],
    axel: Axel,
    showVectors: boolean,
    showHitboxes: boolean,
    _levelName?: string,
    _objectiveText?: string
  ): void {
    // 1. Parallax sci-fi background
    this.drawBackground(ctx, camera, worldWidth, worldHeight);

    // 2. Quantum Hazards
    for (const h of hazards) {
      this.drawHazard(ctx, camera, h);
    }

    // 3. Ramps / Slopes
    for (const ramp of ramps) {
      this.drawRamp(ctx, camera, ramp);
    }

    // 4. Solid Blocks / Architecture
    for (const solid of solids) {
      this.drawSolid(ctx, camera, solid);
    }

    // 5. Energy Barriers
    for (const barrier of barriers) {
      if (barrier.isActive) {
        this.drawBarrier(ctx, camera, barrier);
      }
    }

    // 6. Pressure Switches
    for (const sw of switches) {
      this.drawSwitch(ctx, camera, sw);
    }

    // 7. Moving Platforms
    for (const plat of platforms) {
      this.drawMovingPlatform(ctx, camera, plat);
    }

    // 8. Portals
    for (const portal of portals) {
      this.drawPortal(ctx, camera, portal);
    }

    // 9. Checkpoints
    for (const cp of checkpoints) {
      this.drawCheckpoint(ctx, camera, cp);
    }

    // 10. Collectible Cores
    for (const core of cores) {
      if (!core.isCollected) {
        this.drawCore(ctx, camera, core);
      }
    }

    // 11. NPCs
    for (const npc of npcs) {
      this.drawNPC(ctx, camera, npc, axel.pos);
    }

    // 12. Physics Crates
    for (const crate of crates) {
      this.drawCrate(ctx, camera, crate);
    }

    // 13. Axel Particles & Sprite
    this.drawAxelParticles(ctx, camera, axel);
    this.drawAxel(ctx, camera, axel);

    // 14. Debug / Educational Physics Vectors (F2 / V)
    if (showVectors) {
      this.drawPhysicsVectors(ctx, camera, axel, crates);
    }

    // 15. Hitboxes / Wireframe (F3)
    if (showHitboxes) {
      this.drawHitboxes(ctx, camera, solids, ramps, platforms, crates, axel);
    }

    // 16. In-world interaction prompt
    this.drawWorldPrompts(ctx, camera, axel, crates, portals, npcs);
  }

  private static drawBackground(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    _worldWidth: number,
    _worldHeight: number
  ): void {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // Deep cosmic gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#040711');
    grad.addColorStop(0.6, '#0b1329');
    grad.addColorStop(1, '#0e1c38');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Distant parallax grid
    const offsetX = (-camera.position.x * 0.15 * camera.pixelsPerMeter) % 60;
    const offsetY = (-camera.position.y * 0.15 * camera.pixelsPerMeter) % 60;

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = offsetX; x < w; x += 60) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = offsetY; y < h; y += 60) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Distant mountain silhouettes
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 80) {
      const peak = Math.sin((x + camera.position.x * 5) * 0.008) * 90 + Math.cos(x * 0.015) * 40;
      ctx.lineTo(x, h - 140 - peak);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }

  private static drawSolid(ctx: CanvasRenderingContext2D, camera: Camera, solid: SolidBox): void {
    const screen = camera.worldToScreen(new Vector2(solid.x, solid.y));
    const ppm = camera.pixelsPerMeter;
    const sw = solid.w * ppm;
    const sh = solid.h * ppm;

    // Outer solid block styling
    const grad = ctx.createLinearGradient(screen.x, screen.y, screen.x, screen.y + sh);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(screen.x, screen.y, sw, sh);

    // Tech border & top highlight
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(screen.x, screen.y, sw, sh);

    // Glowing cyan top edge for traversable platforms
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(screen.x, screen.y);
    ctx.lineTo(screen.x + sw, screen.y);
    ctx.stroke();

    // Internal structural line detail
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.strokeRect(screen.x + 4, screen.y + 4, Math.max(0, sw - 8), Math.max(0, sh - 8));
  }

  private static drawRamp(ctx: CanvasRenderingContext2D, camera: Camera, ramp: RampSlope): void {
    const p1 = camera.worldToScreen(new Vector2(ramp.x1, ramp.y1));
    const p2 = camera.worldToScreen(new Vector2(ramp.x2, ramp.y2));
    const bottomY = Math.max(p1.y, p2.y) + 30;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p2.x, bottomY);
    ctx.lineTo(p1.x, bottomY);
    ctx.closePath();

    const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, bottomY);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fill();

    // Ramp surface glow
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    // Small chevron momentum arrows on ramp surface
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const steps = Math.floor(len / 40);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = 1; i < steps; i++) {
      const cx = p1.x + Math.cos(angle) * (i * 40);
      const cy = p1.y + Math.sin(angle) * (i * 40);
      ctx.beginPath();
      ctx.moveTo(cx - 6 * Math.cos(angle - 0.6), cy - 6 * Math.sin(angle - 0.6));
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx - 6 * Math.cos(angle + 0.6), cy - 6 * Math.sin(angle + 0.6));
      ctx.stroke();
    }
    ctx.restore();
  }

  private static drawMovingPlatform(ctx: CanvasRenderingContext2D, camera: Camera, plat: MovingPlatform): void {
    const s = camera.worldToScreen(plat.pos);
    const ppm = camera.pixelsPerMeter;
    const sw = plat.size.x * ppm;
    const sh = plat.size.y * ppm;

    // Platform body
    ctx.save();
    const grad = ctx.createLinearGradient(s.x, s.y, s.x, s.y + sh);
    grad.addColorStop(0, '#3b82f6');
    grad.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = grad;
    ctx.fillRect(s.x, s.y, sw, sh);

    // Outer glow
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.strokeRect(s.x, s.y, sw, sh);

    // Mag-lev glow underneath
    ctx.fillStyle = 'rgba(96, 165, 250, 0.4)';
    ctx.fillRect(s.x + 6, s.y + sh - 2, sw - 12, 4);

    // Chevron pattern
    ctx.fillStyle = '#1e3a8a';
    for (let x = s.x + 8; x < s.x + sw - 12; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, s.y + 4);
      ctx.lineTo(x + 6, s.y + sh / 2);
      ctx.lineTo(x, s.y + sh - 4);
      ctx.stroke();
    }
    ctx.restore();
  }

  private static drawCrate(ctx: CanvasRenderingContext2D, camera: Camera, crate: PhysicsCrate): void {
    const s = camera.worldToScreen(crate.pos);
    const ppm = camera.pixelsPerMeter;
    const sw = crate.size.x * ppm;
    const sh = crate.size.y * ppm;

    ctx.save();
    // Metal alloy body
    const grad = ctx.createLinearGradient(s.x, s.y, s.x + sw, s.y + sh);
    grad.addColorStop(0, '#f59e0b');
    grad.addColorStop(1, '#b45309');
    ctx.fillStyle = grad;
    ctx.fillRect(s.x, s.y, sw, sh);

    // Border
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 2;
    ctx.strokeRect(s.x, s.y, sw, sh);

    // Cross brace
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(s.x + 4, s.y + 4);
    ctx.lineTo(s.x + sw - 4, s.y + sh - 4);
    ctx.moveTo(s.x + sw - 4, s.y + 4);
    ctx.lineTo(s.x + 4, s.y + sh - 4);
    ctx.stroke();

    // Mass badge
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(s.x + sw * 0.15, s.y + sh * 0.32, sw * 0.7, sh * 0.36);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${crate.mass.toFixed(0)} kg`, s.x + sw / 2, s.y + sh / 2);
    ctx.restore();
  }

  private static drawSwitch(ctx: CanvasRenderingContext2D, camera: Camera, sw: PressureSwitch): void {
    const s = camera.worldToScreen(sw.pos);
    const ppm = camera.pixelsPerMeter;
    const swWidth = sw.size.x * ppm;
    const swHeight = sw.size.y * ppm;

    ctx.save();
    // Switch plate
    const depress = sw.isActivated ? 4 : 0;
    const activeColor = sw.isActivated ? '#10b981' : '#f59e0b';

    // Base housing
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(s.x - 4, s.y + swHeight - 6, swWidth + 8, 8);

    // Plate
    ctx.fillStyle = sw.isActivated ? '#065f46' : '#78350f';
    ctx.fillRect(s.x, s.y + depress, swWidth, swHeight - depress);

    ctx.strokeStyle = activeColor;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(s.x, s.y + depress, swWidth, swHeight - depress);

    // Status label
    ctx.fillStyle = activeColor;
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const statusText = sw.isActivated
      ? `ACTIVE (${sw.currentMass.toFixed(0)}kg / ${sw.requiredMass}kg)`
      : `MASS: ${sw.currentMass.toFixed(0)} / ${sw.requiredMass} kg`;
    ctx.fillText(statusText, s.x + swWidth / 2, s.y - 4);
    ctx.restore();
  }

  private static drawBarrier(ctx: CanvasRenderingContext2D, camera: Camera, barrier: EnergyBarrier): void {
    const s = camera.worldToScreen(barrier.pos);
    const ppm = camera.pixelsPerMeter;
    const bw = barrier.size.x * ppm;
    const bh = barrier.size.y * ppm;

    ctx.save();
    ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.fillRect(s.x, s.y, bw, bh);

    // Laser filaments
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x + bw / 2, s.y);
    ctx.lineTo(s.x + bw / 2, s.y + bh);
    ctx.stroke();

    // Glow emitters top & bottom
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(s.x - 4, s.y - 6, bw + 8, 8);
    ctx.fillRect(s.x - 4, s.y + bh - 2, bw + 8, 8);

    // Lock icon / text
    ctx.fillStyle = '#fee2e2';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LOCKED', s.x + bw / 2, s.y + bh / 2);
    ctx.restore();
  }

  private static drawHazard(ctx: CanvasRenderingContext2D, camera: Camera, hazard: QuantumHazard): void {
    const s = camera.worldToScreen(hazard.pos);
    const ppm = camera.pixelsPerMeter;
    const hw = hazard.size.x * ppm;
    const hh = hazard.size.y * ppm;

    ctx.save();
    // Violet rift glow
    const grad = ctx.createLinearGradient(s.x, s.y, s.x, s.y + hh);
    grad.addColorStop(0, 'rgba(168, 85, 247, 0.6)');
    grad.addColorStop(0.5, 'rgba(126, 34, 206, 0.9)');
    grad.addColorStop(1, 'rgba(88, 28, 135, 0.95)');
    ctx.fillStyle = grad;
    ctx.fillRect(s.x, s.y, hw, hh);

    // Undulating sine line on top
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const now = performance.now() * 0.005;
    for (let x = 0; x <= hw; x += 6) {
      const yWave = Math.sin(x * 0.15 + now) * 4;
      if (x === 0) ctx.moveTo(s.x + x, s.y + yWave);
      else ctx.lineTo(s.x + x, s.y + yWave);
    }
    ctx.stroke();
    ctx.restore();
  }

  private static drawCore(ctx: CanvasRenderingContext2D, camera: Camera, core: PhysicsCoreCollectible): void {
    const s = camera.worldToScreen(core.pos);
    const bobY = Math.sin(core.pulsePhase) * 6;
    const cx = s.x;
    const cy = s.y + bobY;

    ctx.save();
    // Halo glow
    const radGlow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 24);
    radGlow.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
    radGlow.addColorStop(0.6, 'rgba(245, 158, 11, 0.3)');
    radGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = radGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.fill();

    // Rotating diamond / octahedron
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(core.pulsePhase * 0.8);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(10, 0);
    ctx.lineTo(0, 12);
    ctx.lineTo(-10, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  private static drawCheckpoint(ctx: CanvasRenderingContext2D, camera: Camera, cp: CheckpointBeacon): void {
    const s = camera.worldToScreen(cp.pos);
    ctx.save();
    // Pylon pole
    ctx.fillStyle = '#334155';
    ctx.fillRect(s.x - 3, s.y - 28, 6, 28);

    // Glowing orb
    const orbColor = cp.isActive ? '#10b981' : '#64748b';
    ctx.fillStyle = orbColor;
    ctx.beginPath();
    ctx.arc(s.x, s.y - 32, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (cp.isActive) {
      // Beacon pulse rings
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.beginPath();
      ctx.arc(s.x, s.y - 32, 14, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  private static drawPortal(ctx: CanvasRenderingContext2D, camera: Camera, portal: QuantumPortal): void {
    const s = camera.worldToScreen(portal.pos);
    const ppm = camera.pixelsPerMeter;
    const pw = portal.size.x * ppm;
    const ph = portal.size.y * ppm;
    const cx = s.x + pw / 2;
    const cy = s.y + ph / 2;
    const time = performance.now() * 0.003;

    ctx.save();
    // Swirling portal ellipse
    ctx.save();
    ctx.translate(cx, cy);
    const portalGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, pw * 0.7);
    portalGrad.addColorStop(0, '#ffffff');
    portalGrad.addColorStop(0.3, '#00f0ff');
    portalGrad.addColorStop(0.7, '#7c3aed');
    portalGrad.addColorStop(1, 'rgba(124, 58, 237, 0)');
    ctx.fillStyle = portalGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, pw * 0.5, ph * 0.5, Math.sin(time) * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Portal archway
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, s.y + pw / 2, pw / 2, Math.PI, 0);
    ctx.lineTo(s.x + pw, s.y + ph);
    ctx.lineTo(s.x, s.y + ph);
    ctx.closePath();
    ctx.stroke();

    // Floating Holographic Signboard
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    const textW = Math.max(120, ctx.measureText(portal.label).width + 20);
    ctx.fillRect(cx - textW / 2, s.y - 32, textW, 26);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - textW / 2, s.y - 32, textW, 26);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(portal.label, cx, s.y - 23);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText(portal.subtitle, cx, s.y - 11);
    ctx.restore();
  }

  private static drawNPC(ctx: CanvasRenderingContext2D, camera: Camera, npc: NPCCharacter, playerPos: Vector2): void {
    const s = camera.worldToScreen(npc.pos);
    const isNearby = npc.isNear(playerPos);

    ctx.save();
    // Character body
    ctx.fillStyle = npc.avatarColor;
    ctx.beginPath();
    ctx.arc(s.x, s.y - 28, 12, 0, Math.PI * 2); // head
    ctx.fill();

    ctx.fillRect(s.x - 10, s.y - 16, 20, 24); // coat/torso
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(s.x - 10, s.y - 16, 20, 24);

    // Name badge
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(npc.name, s.x, s.y - 46);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText(npc.title, s.x, s.y - 35);

    // Interaction prompt bubble
    if (isNearby) {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(s.x - 30, s.y - 70, 60, 20);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillText('[E] TALK', s.x, s.y - 56);
    }
    ctx.restore();
  }

  private static drawAxelParticles(ctx: CanvasRenderingContext2D, camera: Camera, axel: Axel): void {
    ctx.save();
    for (const p of axel.particles) {
      const s = camera.worldToScreen(new Vector2(p.x, p.y));
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 3 * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private static drawAxel(ctx: CanvasRenderingContext2D, camera: Camera, axel: Axel): void {
    const s = camera.worldToScreen(axel.pos);
    const ppm = camera.pixelsPerMeter;
    const aw = axel.size.x * ppm;
    const ah = axel.size.y * ppm;
    const cx = s.x + aw / 2;
    const bottomY = s.y + ah;

    ctx.save();
    ctx.translate(cx, bottomY);
    ctx.scale(axel.facing, 1);

    // Landing squish / Jump stretch
    let scaleX = 1.0;
    let scaleY = 1.0;
    if (axel.isLandingSquish > 0) {
      scaleX = 1.25;
      scaleY = 0.8;
    } else if (!axel.isGrounded && axel.vel.y < -2) {
      scaleX = 0.85;
      scaleY = 1.2;
    }
    ctx.scale(scaleX, scaleY);

    // Legs animation
    const isMoving = Math.abs(axel.vel.x) > 0.5 && axel.isGrounded;
    const legPhase = isMoving ? Math.sin(axel.animTime * 14) * 8 : 0;

    ctx.fillStyle = '#1e293b';
    // Back leg
    ctx.fillRect(-6 - legPhase, -14, 5, 14);
    // Front leg
    ctx.fillRect(1 + legPhase, -14, 5, 14);

    // Boots
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(-7 - legPhase, -4, 7, 4);
    ctx.fillRect(0 + legPhase, -4, 7, 4);

    // Torso / Adventure suit
    const torsoGrad = ctx.createLinearGradient(0, -32, 0, -14);
    torsoGrad.addColorStop(0, '#0284c7');
    torsoGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = torsoGrad;
    ctx.fillRect(-9, -32, 18, 18);

    // Backpack thruster
    ctx.fillStyle = '#334155';
    ctx.fillRect(-14, -30, 5, 14);

    // Thruster flame during jump / sprint
    if (!axel.isGrounded || axel.isSprinting) {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(-14, -16);
      ctx.lineTo(-9, -16);
      ctx.lineTo(-11.5, -6 - Math.random() * 6);
      ctx.closePath();
      ctx.fill();
    }

    // Head / Helmet
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(0, -38, 10, 0, Math.PI * 2);
    ctx.fill();

    // Visor glowing cyan
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(1, -41, 8, 6);

    // Scarf / Explorer Antenna
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-3, -32);
    ctx.quadraticCurveTo(-12, -28 + Math.sin(axel.animTime * 10) * 4, -18, -30);
    ctx.stroke();

    // Arms
    if (axel.carriedCrate) {
      // Raised arms holding crate
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-6, -26);
      ctx.lineTo(-8, -44);
      ctx.moveTo(6, -26);
      ctx.lineTo(8, -44);
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.lineTo(6, -18 + legPhase * 0.5);
      ctx.stroke();
    }

    ctx.restore();
  }

  private static drawPhysicsVectors(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    axel: Axel,
    crates: PhysicsCrate[]
  ): void {
    ctx.save();
    // Axel velocity vector (Green - clamped and centered)
    const axelCenter = new Vector2(axel.pos.x + axel.size.x / 2, axel.pos.y + axel.size.y * 0.45);
    const axelScreen = camera.worldToScreen(axelCenter);
    const speed = axel.vel.magnitude();

    if (speed > 0.15) {
      // Scale length cleanly so it stays near character (max 48px)
      const arrowLength = Math.min(48, Math.max(16, speed * 3.6));
      const dir = axel.vel.normalize();
      this.drawArrow(
        ctx,
        axelScreen.x,
        axelScreen.y,
        axelScreen.x + dir.x * arrowLength,
        axelScreen.y + dir.y * arrowLength,
        '#10b981',
        `v: ${speed.toFixed(1)} m/s`
      );
    }

    // Gravity force vector (Amber - compact 30px)
    const fgLength = 30;
    this.drawArrow(
      ctx,
      axelScreen.x,
      axelScreen.y,
      axelScreen.x,
      axelScreen.y + fgLength,
      '#f59e0b',
      `F_g: ${(axel.mass * 9.8).toFixed(0)} N`
    );

    // Crates vectors (only if active, not carried, and within camera viewport)
    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;
    for (const c of crates) {
      if (c.isCarried) continue;
      const cSpeed = c.vel.magnitude();
      if (cSpeed > 0.3) {
        const cCenter = new Vector2(c.pos.x + c.size.x / 2, c.pos.y + c.size.y / 2);
        const cScreen = camera.worldToScreen(cCenter);

        // Viewport culling to prevent stray arrows
        if (cScreen.x >= -30 && cScreen.x <= cw + 30 && cScreen.y >= -30 && cScreen.y <= ch + 30) {
          const cDir = c.vel.normalize();
          const cLen = Math.min(36, Math.max(14, cSpeed * 2.8));
          this.drawArrow(
            ctx,
            cScreen.x,
            cScreen.y,
            cScreen.x + cDir.x * cLen,
            cScreen.y + cDir.y * cLen,
            '#00f0ff',
            `v: ${cSpeed.toFixed(1)}`
          );
        }
      }
    }
    ctx.restore();
  }

  private static drawHitboxes(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    solids: SolidBox[],
    _ramps: RampSlope[],
    platforms: MovingPlatform[],
    crates: PhysicsCrate[],
    axel: Axel
  ): void {
    ctx.save();
    ctx.lineWidth = 1;

    // Axel hitbox (Cyan)
    const as = camera.worldToScreen(axel.pos);
    ctx.strokeStyle = '#00f0ff';
    ctx.strokeRect(as.x, as.y, axel.size.x * camera.pixelsPerMeter, axel.size.y * camera.pixelsPerMeter);

    // Solids (Green wireframe)
    ctx.strokeStyle = '#10b981';
    for (const s of solids) {
      const sp = camera.worldToScreen(new Vector2(s.x, s.y));
      ctx.strokeRect(sp.x, sp.y, s.w * camera.pixelsPerMeter, s.h * camera.pixelsPerMeter);
    }

    // Platforms (Blue wireframe)
    ctx.strokeStyle = '#3b82f6';
    for (const p of platforms) {
      const pp = camera.worldToScreen(p.pos);
      ctx.strokeRect(pp.x, pp.y, p.size.x * camera.pixelsPerMeter, p.size.y * camera.pixelsPerMeter);
    }

    // Crates (Orange wireframe)
    ctx.strokeStyle = '#f59e0b';
    for (const c of crates) {
      const cp = camera.worldToScreen(c.pos);
      ctx.strokeRect(cp.x, cp.y, c.size.x * camera.pixelsPerMeter, c.size.y * camera.pixelsPerMeter);
    }
    ctx.restore();
  }

  private static drawWorldPrompts(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    axel: Axel,
    crates: PhysicsCrate[],
    portals: QuantumPortal[],
    _npcs: NPCCharacter[]
  ): void {
    ctx.save();
    // Prompt near crates if Axel isn't carrying anything
    if (!axel.carriedCrate) {
      for (const crate of crates) {
        if (axel.pos.distanceTo(crate.pos) < 1.6) {
          const cs = camera.worldToScreen(new Vector2(crate.pos.x + crate.size.x / 2, crate.pos.y));
          this.drawPromptPill(ctx, cs.x, cs.y - 16, '[E] GRAB / LIFT CRATE');
          break;
        }
      }
    } else {
      // Carrying prompt
      const as = camera.worldToScreen(new Vector2(axel.pos.x + axel.size.x / 2, axel.pos.y - 0.8));
      this.drawPromptPill(ctx, as.x, as.y, '[E] PLACE  |  [SHIFT+E] THROW');
    }

    // Prompt near portals
    for (const portal of portals) {
      if (portal.isNear(axel.pos)) {
        const ps = camera.worldToScreen(new Vector2(portal.pos.x + portal.size.x / 2, portal.pos.y + portal.size.y));
        this.drawPromptPill(ctx, ps.x, ps.y + 16, `[E] ENTER ${portal.label.toUpperCase()}`);
        break;
      }
    }
    ctx.restore();
  }

  private static drawPromptPill(ctx: CanvasRenderingContext2D, x: number, y: number, text: string): void {
    ctx.save();
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    const tw = ctx.measureText(text).width + 16;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(x - tw / 2, y - 10, tw, 20);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - tw / 2, y - 10, tw, 20);

    ctx.fillStyle = '#00f0ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  private static drawArrow(
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string,
    label?: string
  ): void {
    const headLen = 8;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    if (label) {
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillStyle = color;
      ctx.textAlign = 'left';
      ctx.fillText(label, toX + 6, toY + 2);
    }
  }
}
