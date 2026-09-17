# Theme color accessibility

Choose colors as foreground/background pairs. A brand color that works as a
button fill may not work as text on a panel. Dropdown hover, keyboard highlight,
selected tags, placeholders, and validation messages need their own tested pairs.

The token package owns these pairs; components consume CSS variables. Keep
palette values in `packages/design-tokens/src/palette.ts` and regenerate
`tokens.css` after changing the default token output. Runtime theme changes use
the same token generation path.

## Contrast targets

- Ordinary text, help text, and custom dropdown options: 7:1 (WCAG enhanced
  contrast target).
- Text on solid action buttons: at least 4.5:1, including hover.
- Essential control boundaries and focus indicators: at least 3:1 against
  adjacent surfaces.
- Glass surfaces: calculate contrast after compositing transparency over the
  canvas. Floating option lists use opaque surfaces so content behind the list
  cannot undermine readability.

These targets cover color contrast. They do not establish complete WCAG AAA
conformance. Accessibility also requires keyboard operation, accessible names,
usable zoom, clear errors, and assistive-technology testing.

## Component rules

Use `popover` with `popover-text`, `option-hover` with `option-hover-text`, and
`option-selected` with `option-selected-text`. Use `primary-text` and the status
`*-text` tokens for inline text, rather than the corresponding button fill.
Never change a background without checking the foreground. Avoid brightness
filters on interactive controls because they also alter the tested text color.

Preserve the user's light/dark/system preference. Native select and datalist
popups also depend on the browser and operating system; CSS cannot guarantee
identical popup rendering everywhere. Honor native forced colors and retain
visible focus. Test custom tag suggestions with both pointer and keyboard.

## Verification

Run `bun run check` for token, component, and package checks, then
`bun run test:e2e` for production-browser coverage. The theme regression suite
checks actual computed colors across every selectable design system in light
and dark appearances, including hover and keyboard highlights.

Manually check native select/datalist popups on the supported browser/OS matrix,
Windows High Contrast, 200% zoom, and screen-reader announcements before a
product release. Changing palettes requires rerunning contrast checks.

## References

- [shadcn semantic color pairs](https://ui.shadcn.com/docs/theming)
- [Radix color scale roles](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale)
- [WCAG 2.2 enhanced text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html)
- [WCAG 2.2 non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
