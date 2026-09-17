# Theme reference profiles

The showcase uses independent palette and appearance profiles so a runtime
theme switch exercises the complete token pipeline (color, type, spacing,
radius, size, shadow, and color scheme). These are component-showcase
references, not copied product screens or client assets.

## Sources and confidence

- **X**: measured from the public X stylesheet served at
  <https://abs.twimg.com/x-web/x-web/assets/styles-BsvnZTph.css>. The profile
  uses the documented black canvas, TwitterChirp stack, 15px body text,
  56px controls, pill buttons, and the stylesheet's 8/16/24/32px radius scale.
- **GitHub**: based on the official Primer foundations documentation at
  <https://primer.style/product/primitives/radii/> and
  <https://primer.style/product/primitives/typography/> (3/6/12px radii and
  system/Mona-style typography).
- **Microsoft**: based on Fluent 2's public component guidance at
  <https://fluent2.microsoft.design/components/web/react/button/>, including
  Segoe UI, compact controls, and 4/8px corner treatment.
- **Adobe**: based on Spectrum's public component guidance at
  <https://spectrum.adobe.com/page/field/>, including compact controls,
  4px field rounding, and pill actions.

The remaining named profiles (Google, YouTube, Wikipedia, Netflix, Spotify,
Facebook, Instagram, Reddit, LinkedIn, Amazon, Notion, and ChatGPT) are
curated, accessible reference presets. Those products do not publish a
complete, stable set of signed-in component tokens, so the repository does not
claim pixel-perfect equivalence. Each profile is intentionally isolated in
`packages/design-tokens/src/appearance.ts` and `palette.ts`; changing a brand
does not require editing component CSS.

## Adding a profile

Add the structural palette to `palette.ts`, add appearance values to
`appearance.ts`, regenerate `tokens.css`, and add a runtime test. Keep all
component CSS semantic: use `var(--ds-...)`, never a second hard-coded palette.
