import { describe, expect, it } from 'bun:test';
import { DESIGN_TOKENS } from '../src/index.ts';

describe('design-system token API', () => {
  it('exposes var-only leaves for every generated group', () => {
    const leaves: string[] = [];
    const visit = (value: unknown): void => {
      if (typeof value === 'string') {
        leaves.push(value);
      } else if (value !== null && typeof value === 'object') {
        Object.values(value).forEach(visit);
      }
    };
    visit(DESIGN_TOKENS);
    expect(leaves.length).toBeGreaterThan(20);
    expect(leaves.every((value) => /^var\(--[a-z0-9-]+\)$/.test(value))).toBe(
      true,
    );
  });
});
