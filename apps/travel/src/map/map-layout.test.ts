import { describe, expect, test } from 'bun:test';
import { mapFrameWidth } from './map-layout';

describe('Explore map layout', () => {
  test('fills a phone viewport without collapsing when centered', () => {
    expect(mapFrameWidth(390)).toBe(358);
    expect(mapFrameWidth(320)).toBe(288);
  });

  test('caps map width on desktop and avoids negative widths', () => {
    expect(mapFrameWidth(1440)).toBe(990);
    expect(mapFrameWidth(16)).toBe(0);
  });
});
