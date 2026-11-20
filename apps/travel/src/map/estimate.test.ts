import { describe, expect, test } from 'bun:test';
import {
  affordableItems,
  CEBU_VIEWPORT,
  type IMenuItem,
  inViewport,
  TATANGS_CURATED,
} from './catalog';
import { estimateGroup } from './estimate';

const menu = TATANGS_CURATED.menuItems;
const valueMeal = menu.find((item) => item.id === 'value-belly');
if (valueMeal === undefined) {
  throw new Error('Missing test menu item');
}
const total = (people: number) =>
  estimateGroup(menu, people)?.totalCentavos ?? null;

describe('Explore group budgeting', () => {
  test('never qualifies Tatangs with a cheap side or unpriced portion', () => {
    expect(total(1)).toBe(18000);
    expect(total(2)).toBe(20000);
    expect(total(3)).toBe(38000);
    expect(total(4)).toBe(40000);
    expect(total(6)).toBe(60000);
    expect(total(20)).toBe(200000);
  });
  test('budget equality is inclusive', () => {
    expect((total(2) ?? Infinity) <= 19900).toBe(false);
    expect((total(2) ?? Infinity) <= 20000).toBe(true);
    expect((total(6) ?? Infinity) <= 50000).toBe(false);
    expect((total(6) ?? Infinity) <= 60000).toBe(true);
  });
  test('sharing platter beats three singles', () => {
    const singles: IMenuItem = {
      ...valueMeal,
      id: 'single',
      name: 'Single',
    };
    const platter: IMenuItem = {
      ...singles,
      id: 'platter',
      name: 'Platter',
      priceCentavos: 14000,
      serves: 2,
      servingBasis: 'printed',
    };
    const outcome = estimateGroup([singles, platter], 3);
    expect(outcome?.totalCentavos).toBe(28000);
    expect(outcome?.lines.map((line) => [line.itemId, line.quantity])).toEqual([
      ['platter', 2],
    ]);
  });
  test('ties prefer lower surplus, fewer orders, and stable IDs', () => {
    const base = valueMeal;
    const eligible: IMenuItem[] = [
      { ...base, id: 'b', priceCentavos: 10000, serves: 2 },
      { ...base, id: 'a', priceCentavos: 10000, serves: 2 },
      { ...base, id: 'z', priceCentavos: 10000, serves: 3 },
    ];
    expect(estimateGroup(eligible, 2)?.lines[0]?.itemId).toBe('a');
  });
  test('menu items track price changes while preserving unknown serving counts', () => {
    expect(
      affordableItems(TATANGS_CURATED, 17900, 1).some(
        ({ item }) => item.id === 'value-belly',
      ),
    ).toBe(false);
    expect(
      affordableItems(TATANGS_CURATED, 18000, 1).some(
        ({ item }) => item.id === 'value-belly',
      ),
    ).toBe(true);
    const exact = affordableItems(TATANGS_CURATED, 20000, 2);
    expect(exact.some(({ item }) => item.id === 'value-belly')).toBe(false);
    expect(
      exact.some(
        ({ item, groupTotal }) =>
          item.id === 'sisig-sharing' && groupTotal === 20000,
      ),
    ).toBe(true);
    expect(
      exact.some(
        ({ item, groupTotal }) => item.id === 'dinuguan' && groupTotal === null,
      ),
    ).toBe(true);
  });
  test('viewport excludes places after panning away', () => {
    expect(inViewport(TATANGS_CURATED, CEBU_VIEWPORT)).toBe(true);
    expect(
      inViewport(TATANGS_CURATED, {
        west: 124,
        east: 124.1,
        south: 10.3,
        north: 10.4,
      }),
    ).toBe(false);
  });
});
