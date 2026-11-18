import { Button, Text, YStack } from 'tamagui';
import { COLORS } from '../theme';

export interface IEmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, actionLabel, onAction }: IEmptyStateProps) {
  return (
    <YStack
      backgroundColor={COLORS.surface}
      borderColor={COLORS.line}
      borderWidth={1}
      borderRadius={22}
      padding="$6"
      alignItems="center"
      gap="$3"
    >
      <Text fontSize={20} color={COLORS.ink} fontWeight="800" textAlign="center">
        {title}
      </Text>
      <Text fontSize={14} color={COLORS.muted} textAlign="center">
        {message}
      </Text>
      {actionLabel !== undefined && onAction !== undefined ? (
        <Button backgroundColor={COLORS.accent} color="#ffffff" onPress={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </YStack>
  );
}
