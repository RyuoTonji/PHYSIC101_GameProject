import { Vector2 } from '../physics/Vector2.ts';

export interface InputState {
  move: Vector2;
  jump: boolean;
  jumpPressed: boolean;
  sprint: boolean;
  boost: boolean;
  brake: boolean;
  action: boolean;
  reset: boolean;
  pause: boolean;
  mousePos: Vector2;
  mouseDown: boolean;
}

/**
 * Normalized cross-platform input manager for Keyboard, Mouse, and Virtual On-Screen Controls.
 */
export class InputManager {
  private keys: Set<string> = new Set();
  private justPressedKeys: Set<string> = new Set();
  private virtualKeys: Set<string> = new Set();
  private mousePosition: Vector2 = Vector2.ZERO;
  private isMouseDown: boolean = false;
  private canvas: HTMLCanvasElement | null = null;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  public attach(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    canvas.addEventListener('mousemove', this.handleMouseMove);
    canvas.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  public detach(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.handleMouseMove);
      this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    }
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  public setVirtualKey(key: string, isDown: boolean): void {
    const k = key.toLowerCase();
    if (isDown) {
      if (!this.virtualKeys.has(k)) {
        this.justPressedKeys.add(k);
      }
      this.virtualKeys.add(k);
    } else {
      this.virtualKeys.delete(k);
    }
  }

  public clearAll(): void {
    this.keys.clear();
    this.justPressedKeys.clear();
    this.virtualKeys.clear();
  }

  public getActiveKeyNames(): string[] {
    const combined = new Set([...this.keys, ...this.virtualKeys]);
    return Array.from(combined);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const keyLower = e.key.toLowerCase();
    const codeLower = e.code.toLowerCase();

    // Prevent default browser scrolling on game control keys
    if (
      ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'space', ' '].includes(keyLower) ||
      ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'space'].includes(codeLower)
    ) {
      // Don't prevent if user is typing into an input field or textarea
      if ((e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
      }
    }

    if (!this.keys.has(keyLower)) {
      this.justPressedKeys.add(keyLower);
      this.justPressedKeys.add(codeLower);
    }

    this.keys.add(keyLower);
    this.keys.add(codeLower);
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.keys.delete(e.key.toLowerCase());
    this.keys.delete(e.code.toLowerCase());
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    this.mousePosition = new Vector2(
      (e.clientX - rect.left) * scaleX,
      (e.clientY - rect.top) * scaleY
    );
  }

  private handleMouseDown(_e: MouseEvent): void {
    this.isMouseDown = true;
  }

  private handleMouseUp(_e: MouseEvent): void {
    this.isMouseDown = false;
  }

  public getState(): InputState {
    let moveX = 0;
    let moveY = 0;

    if (this.isPressed('arrowleft') || this.isPressed('a') || this.isPressed('keya')) moveX -= 1;
    if (this.isPressed('arrowright') || this.isPressed('d') || this.isPressed('keyd')) moveX += 1;
    if (this.isPressed('arrowup') || this.isPressed('w') || this.isPressed('keyw')) moveY -= 1;
    if (this.isPressed('arrowdown') || this.isPressed('s') || this.isPressed('keys')) moveY += 1;

    let moveVec = new Vector2(moveX, moveY);
    if (moveVec.magnitudeSquared() > 1) {
      moveVec = moveVec.normalize();
    }

    const isJump =
      this.isPressed('space') ||
      this.isPressed(' ') ||
      this.isPressed('w') ||
      this.isPressed('keyw') ||
      this.isPressed('arrowup') ||
      this.isPressed('jump');

    const isJumpPressed =
      this.isJustPressed('space') ||
      this.isJustPressed(' ') ||
      this.isJustPressed('w') ||
      this.isJustPressed('keyw') ||
      this.isJustPressed('arrowup') ||
      this.isJustPressed('jump');

    const isSprint =
      this.isPressed('shift') ||
      this.isPressed('shiftleft') ||
      this.isPressed('shiftright') ||
      this.isPressed('sprint');

    const state: InputState = {
      move: moveVec,
      jump: isJump,
      jumpPressed: isJumpPressed,
      sprint: isSprint,
      boost: isSprint || this.isPressed('boost'),
      brake:
        this.isPressed('space') ||
        this.isPressed(' ') ||
        this.isPressed('b') ||
        this.isPressed('keyb') ||
        this.isPressed('s') ||
        this.isPressed('keys') ||
        this.isPressed('arrowdown') ||
        this.isPressed('brake'),
      action:
        this.isPressed('e') ||
        this.isPressed('keye') ||
        this.isPressed('enter') ||
        this.isPressed('action'),
      reset: this.isPressed('r') || this.isPressed('keyr'),
      pause: this.isPressed('p') || this.isPressed('keyp') || this.isPressed('escape'),
      mousePos: this.mousePosition,
      mouseDown: this.isMouseDown
    };

    // Clear one-shot just-pressed triggers after poll
    this.justPressedKeys.clear();

    return state;
  }

  private isPressed(key: string): boolean {
    const k = key.toLowerCase();
    return this.keys.has(k) || this.virtualKeys.has(k);
  }

  private isJustPressed(key: string): boolean {
    const k = key.toLowerCase();
    return this.justPressedKeys.has(k);
  }
}
