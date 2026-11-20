import type { IMenuItem } from './catalog';

export interface IOrderLine {
  itemId: string;
  name: string;
  quantity: number;
  servings: number;
  totalCentavos: number;
}

export interface IGroupEstimate {
  totalCentavos: number;
  servings: number;
  lines: IOrderLine[];
}

interface IPath {
  cost: number;
  count: number;
  ids: string[];
}

function preferred(a: IPath, b: IPath | undefined): boolean {
  if (b === undefined) {
    return true;
  }
  if (a.cost !== b.cost) {
    return a.cost < b.cost;
  }
  if (a.count !== b.count) {
    return a.count < b.count;
  }
  return a.ids.join('|') < b.ids.join('|');
}

/** Exact minimum-cost cover, allowing whole repeated and mixed orders. */
export function estimateGroup(
  items: readonly IMenuItem[],
  people: number,
): IGroupEstimate | null {
  if (!Number.isInteger(people) || people < 1) {
    return null;
  }
  const eligible = items
    .filter(
      (item) =>
        item.eligible &&
        item.available !== false &&
        item.priceCentavos !== null &&
        Number.isSafeInteger(item.priceCentavos) &&
        item.priceCentavos > 0 &&
        item.serves !== null &&
        Number.isSafeInteger(item.serves) &&
        item.serves > 0,
    )
    .sort((a, b) => a.id.localeCompare(b.id));
  if (eligible.length === 0) {
    return null;
  }
  const maxServings = Math.max(...eligible.map((item) => item.serves ?? 0));
  const limit = people + maxServings - 1;
  const dp: (IPath | undefined)[] = Array.from({ length: limit + 1 });
  dp[0] = { cost: 0, count: 0, ids: [] };
  for (let covered = 0; covered <= limit; covered += 1) {
    const current = dp[covered];
    if (current === undefined) {
      continue;
    }
    for (const item of eligible) {
      const servings = item.serves;
      const price = item.priceCentavos;
      if (servings === null || price === null) {
        continue;
      }
      const next = covered + servings;
      if (next > limit) {
        continue;
      }
      const ids = [...current.ids, item.id].sort();
      const candidate = {
        cost: current.cost + price,
        count: current.count + 1,
        ids,
      };
      if (preferred(candidate, dp[next])) {
        dp[next] = candidate;
      }
    }
  }

  let winner: { covered: number; path: IPath } | undefined;
  for (let covered = people; covered <= limit; covered += 1) {
    const path = dp[covered];
    if (path === undefined) {
      continue;
    }
    const current = winner;
    if (
      current === undefined ||
      path.cost < current.path.cost ||
      (path.cost === current.path.cost &&
        (covered < current.covered ||
          (covered === current.covered && preferred(path, current.path))))
    ) {
      winner = { covered, path };
    }
  }
  if (winner === undefined) {
    return null;
  }
  const quantities = new Map<string, number>();
  for (const id of winner.path.ids) {
    quantities.set(id, (quantities.get(id) ?? 0) + 1);
  }
  const lines = eligible
    .filter((item) => quantities.has(item.id))
    .map((item) => {
      const quantity = quantities.get(item.id) ?? 0;
      return {
        itemId: item.id,
        name: item.name + (item.variant === null ? '' : ` · ${item.variant}`),
        quantity,
        servings: (item.serves ?? 0) * quantity,
        totalCentavos: (item.priceCentavos ?? 0) * quantity,
      };
    });
  return { totalCentavos: winner.path.cost, servings: winner.covered, lines };
}

export function pesos(centavos: number): string {
  return (
    '₱' +
    (centavos / 100).toLocaleString('en-PH', {
      minimumFractionDigits: centavos % 100 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })
  );
}

export function orderSummary(estimate: IGroupEstimate): string {
  return estimate.lines
    .map((line) => `${String(line.quantity)} × ${line.name}`)
    .join(', ');
}
