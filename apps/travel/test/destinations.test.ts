import { describe, expect, test } from 'bun:test';
import { DESTINATIONS, filterDestinations } from '../src/data/destinations';

describe('filterDestinations', () => {
  test('lists all destinations with an empty query and all-region filter', () => {
    expect(filterDestinations(DESTINATIONS, '', 'all')).toHaveLength(4);
  });

  test('searches names, countries, and descriptions without case sensitivity', () => {
    expect(
      filterDestinations(DESTINATIONS, 'JAPAN', 'all').map((item) => item.id),
    ).toEqual(['kyoto']);
    expect(
      filterDestinations(DESTINATIONS, 'island', 'all').map((item) => item.id),
    ).toEqual(['siargao']);
  });

  test('filters destinations by continent and combines with search', () => {
    expect(
      filterDestinations(DESTINATIONS, '', 'europe').map((item) => item.id),
    ).toEqual(['amalfi', 'swiss-alps']);
    expect(filterDestinations(DESTINATIONS, 'kyoto', 'europe')).toEqual([]);
  });

  test('ignores surrounding spaces in the search query', () => {
    expect(
      filterDestinations(DESTINATIONS, '  siargao  ', 'all').map(
        (item) => item.id,
      ),
    ).toEqual(['siargao']);
  });
});
