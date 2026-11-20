import type { ComponentProps } from 'react';
import { Button } from 'tamagui';
import { useTravelColors } from '../theme';
import { useSystemScheme } from '../theme-scheme';

export function TravelButton({
  children,
  size,
  disabled,
  onPress,
  tone = 'default',
  labelColor,
  'aria-label': label,
  'aria-expanded': expanded,
}: Pick<
  ComponentProps<typeof Button>,
  'children' | 'size' | 'disabled' | 'onPress' | 'aria-label' | 'aria-expanded'
> & { labelColor?: string; tone?: 'default' | 'accent' | 'surface' }) {
  const scheme = useSystemScheme();
  const colors = useTravelColors();
  const backgroundColor =
    tone === 'accent'
      ? colors.accentSoft
      : tone === 'surface'
        ? colors.surface
        : undefined;
  const foregroundColor =
    scheme === 'dark'
      ? colors.ink
      : (labelColor ??
        (tone === 'accent'
          ? colors.accent
          : tone === 'surface'
            ? colors.ink
            : undefined));
  return (
    <Button
      size={size}
      disabled={disabled}
      onPress={onPress}
      style={{ backgroundColor }}
      aria-label={label}
      aria-expanded={expanded}
      textProps={{ style: { color: foregroundColor } }}
    >
      {children}
    </Button>
  );
}
