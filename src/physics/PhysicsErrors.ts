/**
 * Custom error hierarchy for physics calculation safeguards.
 * Ensures zero-division, singularities (e.g. r = 0), and invalid parameters
 * produce clear, deterministic diagnostic exceptions rather than unhandled NaN/Infinity.
 */

export class PhysicsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PhysicsError';
  }
}

export class PhysicsDivisionByZeroError extends PhysicsError {
  constructor(parameterName: string, context?: string) {
    super(`Division by zero encountered: parameter '${parameterName}' cannot be zero${context ? ` in ${context}` : ''}.`);
    this.name = 'PhysicsDivisionByZeroError';
  }
}

export class PhysicsSingularityError extends PhysicsError {
  constructor(parameterName: string, reason: string) {
    super(`Physics singularity encountered at ${parameterName}: ${reason}`);
    this.name = 'PhysicsSingularityError';
  }
}

export class InvalidPhysicsValueError extends PhysicsError {
  constructor(parameterName: string, value: unknown, requirement: string) {
    super(`Invalid physics value for '${parameterName}': received ${value}. Requirement: ${requirement}.`);
    this.name = 'InvalidPhysicsValueError';
  }
}
