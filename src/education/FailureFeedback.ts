export interface PhysicsFailureContext {
  levelId: number;
  reason: 'out_of_bounds' | 'wrong_zone' | 'insufficient_force' | 'overshot' | 'undershot' | 'time_out';
  requiredFc?: number;
  availableFc?: number;
  expectedDisplacement?: number;
  actualDisplacement?: number;
  expectedSpeed?: number;
  actualSpeed?: number;
  details?: string;
}

export class FailureFeedback {
  public static generateExplanation(ctx: PhysicsFailureContext): {
    title: string;
    description: string;
    mathBreakdown?: string;
  } {
    switch (ctx.reason) {
      case 'insufficient_force':
        return {
          title: 'Insufficient Centripetal Inward Force',
          description:
            'Your vehicle followed its tangential velocity straight off the path due to Newton’s First Law (inertia). Without enough inward force, circular motion cannot be maintained.',
          mathBreakdown: `Required Fc = mv²/r = ${ctx.requiredFc?.toFixed(1) ?? '?'} N | Available Inward Force = ${ctx.availableFc?.toFixed(1) ?? '0.0'} N`
        };

      case 'overshot':
        return {
          title: 'Stopping Distance Exceeded (Kinematic Overshoot)',
          description:
            'Your initial velocity was too high for the available braking acceleration. By Torricelli’s equation (vf² = vi² + 2aΔx), required stopping distance exceeded the landing pad.',
          mathBreakdown: `Actual Stopping Distance: ${ctx.actualDisplacement?.toFixed(2) ?? '?'} m | Zone Limit: ${ctx.expectedDisplacement?.toFixed(2) ?? '?'} m`
        };

      case 'undershot':
        return {
          title: 'Insufficient Kinetic Energy / Acceleration',
          description:
            'The vehicle decelerated to zero before reaching the required target zone.',
          mathBreakdown: `Displacement Reached: ${ctx.actualDisplacement?.toFixed(2) ?? '?'} m | Required: ${ctx.expectedDisplacement?.toFixed(2) ?? '?'} m`
        };

      case 'out_of_bounds':
        return {
          title: 'Trajectory Deviation',
          description:
            ctx.details ||
            'The object collided with a barrier because its velocity vector was not aligned with the permitted corridor.'
        };

      case 'time_out':
        return {
          title: 'Target Window Expired',
          description:
            'The platform or rotating bridge moved out of phase. Review the period T = t/N and angular speed ω to synchronize your crossing.'
        };

      case 'wrong_zone':
      default:
        return {
          title: 'Mission Incomplete',
          description: ctx.details || 'Payload did not dock in the specified target coordinates.'
        };
    }
  }
}
