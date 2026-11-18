import { Button, Text, YStack } from 'tamagui';
import { COLORS } from '../theme';

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
  return (
    <YStack
      borderWidth={1}
      rounded={22}
      padding="6"
      items="center"
      gap="3"
      style={{ backgroundColor: COLORS.surface, borderColor: COLORS.line }}
    >
      <Text
        fontSize={20}
        fontWeight="800"
        textAlign="center"
        style={{ color: COLORS.ink }}
      >
        {title}
      </Text>
      <Text fontSize={14} textAlign="center" style={{ color: COLORS.muted }}>
        {message}
      </Text>
      {actionLabel !== undefined && onAction !== undefined ? (
        <Button
          color="#ffffff"
          onPress={onAction}
          style={{ backgroundColor: COLORS.accent }}
        >
          {actionLabel}
        </Button>
      ) : null}
    </YStack>
  );
}
