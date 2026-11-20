/** Map frame must have an explicit width when centered in a React Native flex layout. */
export function mapFrameWidth(viewportWidth: number): number {
  return Math.max(0, Math.min(990, viewportWidth - 32));
}
