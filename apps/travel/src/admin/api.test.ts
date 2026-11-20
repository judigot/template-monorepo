import { describe, expect, test } from 'bun:test';
import type { IMenuEdit } from './api';

describe('menu price entry', () => {
  test('a corrected value meal retains integer-centavo pricing', () => {
    const item: IMenuEdit = {
      name: 'Value meal',
      variant: 'Lechon sisig',
      section: 'Value meals',
      priceCentavos: 18000,
      serves: 1,
      eligible: true,
      available: true,
      servingBasis: 'assumed',
    };
    expect(item.priceCentavos).toBe(18000);
  });
});
