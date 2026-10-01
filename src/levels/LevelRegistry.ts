import { LevelBase } from './LevelBase.ts';
import { Level01_DistanceDisplacement } from './Level01_DistanceDisplacement.ts';
import { Level02_SpeedVelocity } from './Level02_SpeedVelocity.ts';
import { Level03_Acceleration } from './Level03_Acceleration.ts';
import { Level04_UARM } from './Level04_UARM.ts';
import { Level05_RotationRevolution } from './Level05_RotationRevolution.ts';
import { Level06_LinearVsRotational } from './Level06_LinearVsRotational.ts';
import { Level07_TangentialCentripetal } from './Level07_TangentialCentripetal.ts';
import { Level08_CentripetalForce } from './Level08_CentripetalForce.ts';

export class LevelRegistry {
  public static createLevel(id: number): LevelBase {
    switch (id) {
      case 1:
        return new Level01_DistanceDisplacement();
      case 2:
        return new Level02_SpeedVelocity();
      case 3:
        return new Level03_Acceleration();
      case 4:
        return new Level04_UARM();
      case 5:
        return new Level05_RotationRevolution();
      case 6:
        return new Level06_LinearVsRotational();
      case 7:
        return new Level07_TangentialCentripetal();
      case 8:
        return new Level08_CentripetalForce();
      default:
        return new Level01_DistanceDisplacement();
    }
  }

  public static getLevelMetadata(): Array<{ id: number; title: string; subtitle: string }> {
    return [
      { id: 1, title: 'Level 1: Distance vs. Displacement', subtitle: 'The Drone Delivery Challenge' },
      { id: 2, title: 'Level 2: Speed vs. Velocity', subtitle: 'The Vector Circuit' },
      { id: 3, title: 'Level 3: Acceleration', subtitle: 'Precision Braking Zone' },
      { id: 4, title: 'Level 4: UARM Kinematics', subtitle: 'The Launch Ramp' },
      { id: 5, title: 'Level 5: Rotation & Period', subtitle: 'Orbital Transfer Station' },
      { id: 6, title: 'Level 6: Linear vs. Rotational Speed', subtitle: 'Centrifuge Carousel' },
      { id: 7, title: 'Level 7: Tangential Velocity & ac', subtitle: 'Frictionless Ice Curve' },
      { id: 8, title: 'Level 8: Centripetal Force', subtitle: 'Tension & Spin Drum' }
    ];
  }
}
