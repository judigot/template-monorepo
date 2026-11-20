import { Button, Text, YStack } from 'tamagui';
import { useTravelColors } from '../theme';

export interface IEmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: IEmptyStateProps) {
  const colors = useTravelColors();
  return (
    <YStack
      borderWidth={1}
      rounded={22}
      items="center"
      gap="3"
      style={{
        padding: 24,
        backgroundColor: colors.surface,
        borderColor: colors.line,
      }}
    >
      <Text
        fontSize={20}
        fontWeight="800"
        style={{ textAlign: 'center', color: colors.ink }}
      >
        {title}
      </Text>
      <Text fontSize={14} style={{ textAlign: 'center', color: colors.muted }}>
        {message}
      </Text>
      {actionLabel !== undefined && onAction !== undefined ? (
        <Button
          onPress={onAction}
          style={{ backgroundColor: colors.accent, color: colors.onAccent }}
        >
          {actionLabel}
        </Button>
      ) : null}
    </YStack>
  );
}
