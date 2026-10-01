import { Vector2 } from './Vector2.ts';

/**
 * Explicit unit conversion manager.
 * Isolates game-canvas coordinates (pixels) from physics calculations (SI units: meters).
 * 
 * STANDARD RATIO:
 * 1.0 meter = 40.0 pixels
 * 1.0 pixel = 0.025 meters
 */
export const METERS_TO_PIXELS = 40.0;
export const PIXELS_TO_METERS = 1.0 / METERS_TO_PIXELS;

export class UnitConversion {
  public static metersToPixels(meters: number): number {
    return meters * METERS_TO_PIXELS;
  }

  public static pixelsToMeters(pixels: number): number {
    return pixels * PIXELS_TO_METERS;
  }

  public static metersVectorToPixels(vMeters: Vector2): Vector2 {
    return vMeters.multiply(METERS_TO_PIXELS);
  }

  public static pixelsVectorToMeters(vPixels: Vector2): Vector2 {
    return vPixels.multiply(PIXELS_TO_METERS);
  }

  public static radiansToDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
  }

  public static degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
