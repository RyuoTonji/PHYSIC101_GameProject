import { Vector2 } from '../physics/Vector2.ts';
import { PhysicsCrate } from './PhysicsCrate.ts';

export class PressureSwitch {
  public id: string;
  public pos: Vector2;
  public size: Vector2 = new Vector2(1.8, 0.3); // width 1.8m, height 0.3m
  public requiredMass: number = 40.0; // kg
  public currentMass: number = 0; // kg
  public isActivated: boolean = false;
  public activationTime: number = 0;
  public justActivated: boolean = false;

  constructor(id: string, x: number, y: number, requiredMass: number = 40.0) {
    this.id = id;
    this.pos = new Vector2(x, y);
    this.requiredMass = requiredMass;
  }

  public update(axelPos: Vector2, axelSize: Vector2, axelMass: number, crates: PhysicsCrate[]): void {
    let massOnPlate = 0;

    // Check Axel
    const axelFootX = axelPos.x + axelSize.x * 0.5;
    const axelFootY = axelPos.y + axelSize.y;
    if (
      axelFootX >= this.pos.x &&
      axelFootX <= this.pos.x + this.size.x &&
      axelFootY >= this.pos.y - 0.2 &&
      axelFootY <= this.pos.y + 0.5
    ) {
      massOnPlate += axelMass;
    }

    // Check Crates
    for (const crate of crates) {
      if (crate.isCarried) continue;
      const crateFootX = crate.pos.x + crate.size.x * 0.5;
      const crateFootY = crate.pos.y + crate.size.y;
      if (
        crateFootX >= this.pos.x &&
        crateFootX <= this.pos.x + this.size.x &&
        crateFootY >= this.pos.y - 0.2 &&
        crateFootY <= this.pos.y + 0.5
      ) {
        massOnPlate += crate.mass;
      }
    }

    this.currentMass = massOnPlate;
    const wasActive = this.isActivated;
    this.isActivated = this.currentMass >= this.requiredMass;
    this.justActivated = !wasActive && this.isActivated;
  }
}

export class EnergyBarrier {
  public id: string;
  public pos: Vector2;
  public size: Vector2;
  public isActive: boolean = true;
  public color: string = '#00f0ff';

  constructor(id: string, x: number, y: number, w: number = 0.5, h: number = 3.5, color: string = '#00f0ff') {
    this.id = id;
    this.pos = new Vector2(x, y);
    this.size = new Vector2(w, h);
    this.color = color;
  }
}

export class QuantumHazard {
  public id: string;
  public pos: Vector2;
  public size: Vector2;
  public message: string;

  constructor(id: string, x: number, y: number, w: number, h: number, message: string = 'Quantum Instability: Excess momentum loss or missed jump.') {
    this.id = id;
    this.pos = new Vector2(x, y);
    this.size = new Vector2(w, h);
    this.message = message;
  }

  public intersects(entityPos: Vector2, entitySize: Vector2): boolean {
    return (
      entityPos.x < this.pos.x + this.size.x &&
      entityPos.x + entitySize.x > this.pos.x &&
      entityPos.y < this.pos.y + this.size.y &&
      entityPos.y + entitySize.y > this.pos.y
    );
  }
}

export class PhysicsCoreCollectible {
  public id: string;
  public pos: Vector2;
  public isCollected: boolean = false;
  public pulsePhase: number = 0;

  constructor(id: string, x: number, y: number) {
    this.id = id;
    this.pos = new Vector2(x, y);
    this.pulsePhase = Math.random() * Math.PI * 2;
  }

  public update(dt: number): void {
    this.pulsePhase += dt * 3.0;
  }
}

export class CheckpointBeacon {
  public id: string;
  public pos: Vector2;
  public isActive: boolean = false;

  constructor(id: string, x: number, y: number) {
    this.id = id;
    this.pos = new Vector2(x, y);
  }
}

export class QuantumPortal {
  public id: string;
  public targetLevelId: number;
  public label: string;
  public subtitle: string;
  public pos: Vector2;
  public size: Vector2 = new Vector2(1.8, 2.8);

  constructor(id: string, targetLevelId: number, label: string, subtitle: string, x: number, y: number) {
    this.id = id;
    this.targetLevelId = targetLevelId;
    this.label = label;
    this.subtitle = subtitle;
    this.pos = new Vector2(x, y);
  }

  public isNear(playerPos: Vector2): boolean {
    const center = new Vector2(this.pos.x + this.size.x * 0.5, this.pos.y + this.size.y * 0.5);
    return playerPos.distanceTo(center) < 2.0;
  }
}

export interface DialogueNode {
  speaker: string;
  title: string;
  avatarColor: string;
  text: string;
}

export class NPCCharacter {
  public id: string;
  public name: string;
  public title: string;
  public pos: Vector2;
  public avatarColor: string;
  public dialogue: DialogueNode[];
  public activeDialogueIdx: number = 0;

  constructor(
    id: string,
    name: string,
    title: string,
    x: number,
    y: number,
    avatarColor: string,
    dialogue: DialogueNode[]
  ) {
    this.id = id;
    this.name = name;
    this.title = title;
    this.pos = new Vector2(x, y);
    this.avatarColor = avatarColor;
    this.dialogue = dialogue;
  }

  public isNear(playerPos: Vector2): boolean {
    return playerPos.distanceTo(this.pos) < 2.2;
  }

  public getNextDialogue(): DialogueNode {
    const d = this.dialogue[this.activeDialogueIdx];
    this.activeDialogueIdx = (this.activeDialogueIdx + 1) % this.dialogue.length;
    return d;
  }
}
