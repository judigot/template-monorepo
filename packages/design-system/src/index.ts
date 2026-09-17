import { createTokenGroups } from '@monorepo/design-tokens';

export type { IPalette, ITokenGroup } from '@monorepo/design-tokens';
export {
  applyTokenGroups,
  COLOR_TOKENS,
  createColorTokens,
  createTokenGroups,
  renderTokensCss,
  THEMES,
} from '@monorepo/design-tokens';

const groups = createTokenGroups();
export const DESIGN_TOKENS: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = Object.fromEntries(
  groups.map(({ cssPrefix, tokens }) => [
    cssPrefix,
    Object.fromEntries(
      Object.keys(tokens).map((name) => [
        name,
        `var(--ds-${cssPrefix}-${name})`,
      ]),
    ),
  ]),
);
