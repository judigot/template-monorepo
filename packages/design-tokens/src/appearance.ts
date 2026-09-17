/** Component roles, shared by generated CSS and runtime themes. */
export const DEFAULT_APPEARANCE = {
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    pill: '9999px',
    container: '16px',
    panel: '12px',
    dialog: '16px',
    control: '8px',
    button: '8px',
    tag: '9999px',
    menu: '8px',
  },
  type: {
    sans: 'Arial, Helvetica, sans-serif',
    heading: '20px',
    body: '16px',
    small: '13px',
    label: '14px',
    'heading-family': 'Arial, Helvetica, sans-serif',
    'heading-weight': '700',
    'control-weight': '600',
    'line-height': '1.5',
    'heading-tracking': '-0.02em',
  },
  space: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '24px',
    6: '32px',
    page: '24px',
    panel: '24px',
    field: '16px',
    section: '24px',
    'control-inline': '12px',
    'control-block': '10px',
    'button-inline': '20px',
    'button-block': '10px',
  },
  size: { control: '44px', button: '44px', content: '1200px', dialog: '640px' },
  shadow: {
    sm: '0 1px 2px color-mix(in srgb, var(--ds-color-text) 8%, transparent)',
    lg: '0 20px 50px color-mix(in srgb, var(--ds-color-text) 20%, transparent)',
  },
  scheme: { mode: 'light' },
};

export type IAppearance = typeof DEFAULT_APPEARANCE;
export type IAppearanceOverrides = {
  [Group in keyof IAppearance]?: Partial<IAppearance[Group]>;
};

export function createAppearance(
  overrides: IAppearanceOverrides = {},
): IAppearance {
  return {
    radius: { ...DEFAULT_APPEARANCE.radius, ...overrides.radius },
    type: { ...DEFAULT_APPEARANCE.type, ...overrides.type },
    space: { ...DEFAULT_APPEARANCE.space, ...overrides.space },
    size: { ...DEFAULT_APPEARANCE.size, ...overrides.size },
    shadow: { ...DEFAULT_APPEARANCE.shadow, ...overrides.shadow },
    scheme: { ...DEFAULT_APPEARANCE.scheme, ...overrides.scheme },
  };
}

/** X's public CSS scale. Role mapping is documented in docs/theme-references.md. */
export const X_APPEARANCE = createAppearance({
  radius: {
    sm: '8px',
    md: '16px',
    lg: '24px',
    container: '0px',
    panel: '16px',
    dialog: '32px',
    control: '4px',
    button: '9999px',
    tag: '9999px',
    menu: '16px',
  },
  type: {
    sans: 'TwitterChirp, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    'heading-family':
      'TwitterChirp, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    body: '15px',
    small: '13px',
    heading: '20px',
    label: '15px',
    'line-height': '1.3333333333',
    'heading-weight': '700',
    'control-weight': '700',
  },
  space: {
    page: '16px',
    panel: '16px',
    field: '16px',
    section: '20px',
    'button-inline': '16px',
    'button-block': '8px',
  },
  size: { button: '36px', control: '56px', content: '1200px', dialog: '600px' },
  shadow: { sm: 'none', lg: 'none' },
  scheme: { mode: 'dark' },
});

const SYSTEM_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
const DEFAULT_THEME_APPEARANCE = createAppearance();

export const THEME_APPEARANCES: Record<string, IAppearance> = {
  default: DEFAULT_THEME_APPEARANCE,
  light: DEFAULT_THEME_APPEARANCE,
  dark: createAppearance({ scheme: { mode: 'dark' } }),
  google: createAppearance({
    radius: {
      container: '12px',
      panel: '8px',
      dialog: '28px',
      control: '4px',
      button: '9999px',
      menu: '4px',
    },
    type: {
      sans: 'Roboto, Arial, sans-serif',
      'heading-family': 'Google Sans, Roboto, Arial, sans-serif',
      body: '14px',
    },
    size: { control: '40px', button: '40px' },
  }),
  youtube: createAppearance({
    radius: {
      container: '12px',
      panel: '12px',
      dialog: '12px',
      control: '2px',
      button: '18px',
      menu: '12px',
    },
    type: {
      sans: 'Roboto, Arial, sans-serif',
      'heading-family': 'Roboto, Arial, sans-serif',
      body: '14px',
    },
    size: { control: '40px', button: '36px' },
  }),
  wikipedia: createAppearance({
    radius: {
      container: '0px',
      panel: '2px',
      dialog: '2px',
      control: '2px',
      button: '2px',
      menu: '2px',
      tag: '2px',
    },
    type: {
      sans: 'Arial, sans-serif',
      'heading-family': 'Georgia, "Times New Roman", serif',
      'heading-weight': '400',
    },
    size: { control: '32px', button: '32px' },
    shadow: { sm: 'none' },
  }),
  netflix: createAppearance({
    radius: {
      container: '4px',
      panel: '4px',
      dialog: '4px',
      control: '2px',
      button: '4px',
      menu: '4px',
    },
    type: {
      sans: 'Helvetica Neue, Arial, sans-serif',
      'heading-family': 'Helvetica Neue, Arial, sans-serif',
    },
  }),
  spotify: createAppearance({
    radius: {
      container: '8px',
      panel: '8px',
      dialog: '8px',
      control: '4px',
      button: '9999px',
      menu: '4px',
    },
    type: {
      sans: 'Circular, Helvetica, Arial, sans-serif',
      'heading-family': 'Circular, Helvetica, Arial, sans-serif',
      'heading-weight': '700',
    },
  }),
  facebook: createAppearance({
    radius: {
      container: '8px',
      panel: '8px',
      dialog: '8px',
      control: '6px',
      button: '6px',
      menu: '8px',
    },
    type: {
      sans: 'Helvetica, Arial, sans-serif',
      'heading-family': 'Helvetica, Arial, sans-serif',
      body: '15px',
    },
  }),
  instagram: createAppearance({
    radius: {
      container: '8px',
      panel: '12px',
      dialog: '12px',
      control: '6px',
      button: '8px',
      menu: '12px',
    },
    type: {
      sans: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      'heading-family':
        'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    },
  }),
  x: X_APPEARANCE,
  reddit: createAppearance({
    radius: {
      container: '16px',
      panel: '16px',
      dialog: '16px',
      control: '20px',
      button: '9999px',
      menu: '12px',
    },
    type: {
      sans: 'Noto Sans, Arial, sans-serif',
      'heading-family': 'Noto Sans, Arial, sans-serif',
      body: '14px',
    },
  }),
  linkedin: createAppearance({
    radius: {
      container: '8px',
      panel: '8px',
      dialog: '8px',
      control: '4px',
      button: '9999px',
      menu: '8px',
    },
    type: {
      sans: 'Source Sans Pro, Arial, sans-serif',
      'heading-family': 'Source Sans Pro, Arial, sans-serif',
    },
  }),
  amazon: createAppearance({
    radius: {
      container: '4px',
      panel: '4px',
      dialog: '8px',
      control: '3px',
      button: '9999px',
      menu: '4px',
    },
    type: { sans: 'Arial, sans-serif', 'heading-family': 'Arial, sans-serif' },
  }),
  microsoft: createAppearance({
    radius: {
      container: '8px',
      panel: '8px',
      dialog: '12px',
      control: '4px',
      button: '4px',
      menu: '4px',
      tag: '4px',
    },
    type: {
      sans: 'Segoe UI, Arial, sans-serif',
      'heading-family': 'Segoe UI, Arial, sans-serif',
      body: '14px',
      'line-height': '1.4285714286',
    },
  }),
  github: createAppearance({
    radius: {
      sm: '3px',
      md: '6px',
      lg: '12px',
      container: '6px',
      panel: '12px',
      dialog: '12px',
      control: '6px',
      button: '6px',
      menu: '6px',
    },
    type: {
      sans: SYSTEM_FONT,
      'heading-family': SYSTEM_FONT,
      body: '14px',
      small: '12px',
      'control-weight': '500',
    },
    space: {
      panel: '16px',
      field: '16px',
      'control-block': '5px',
      'button-block': '5px',
    },
  }),
  notion: createAppearance({
    radius: {
      container: '3px',
      panel: '3px',
      dialog: '6px',
      control: '3px',
      button: '3px',
      menu: '3px',
    },
    type: {
      sans: 'ui-sans-serif, system-ui, sans-serif',
      'heading-family': 'ui-sans-serif, system-ui, sans-serif',
    },
  }),
  chatgpt: createAppearance({
    radius: {
      container: '12px',
      panel: '12px',
      dialog: '12px',
      control: '8px',
      button: '8px',
      menu: '8px',
    },
    type: {
      sans: 'Söhne, ui-sans-serif, system-ui, sans-serif',
      'heading-family': 'Söhne, ui-sans-serif, system-ui, sans-serif',
    },
  }),
  adobe: createAppearance({
    radius: {
      container: '4px',
      panel: '4px',
      dialog: '4px',
      control: '4px',
      button: '9999px',
      menu: '4px',
      tag: '2px',
    },
    type: {
      sans: SYSTEM_FONT,
      'heading-family': SYSTEM_FONT,
      body: '14px',
      label: '14px',
    },
  }),
};
