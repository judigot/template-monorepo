import type { ComponentProps } from 'react';
import { Button } from 'tamagui';
import { useTravelColors } from '../theme';
import { APP_FONT_FAMILY, CONTROL_RADIUS, FONT_WEIGHT } from '../typography';

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
  const colors = useTravelColors();
  const backgroundColor =
    tone === 'accent' ? colors.accentSoft : colors.surface;
  const foregroundColor =
    labelColor ?? (tone === 'accent' ? colors.accent : colors.ink);
  return (
    <Button
      size={size}
      disabled={disabled}
      onPress={onPress}
      style={{
        backgroundColor,
        borderWidth: 0,
        borderRadius: CONTROL_RADIUS,
      }}
      aria-label={label}
      aria-expanded={expanded}
      textProps={{
        style: {
          color: foregroundColor,
          fontFamily: APP_FONT_FAMILY,
          fontWeight: FONT_WEIGHT.semibold,
        },
      }}
    >
      {children}
    </Button>
  );
}
