import { useWindowDimensions, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useTravelColors } from '../theme';
import type { IVenueDismissHandleProps } from './VenueDismissHandle';

export function VenueDismissHandle({
  offset,
  onClose,
}: IVenueDismissHandleProps) {
  const colors = useTravelColors();
  const { height } = useWindowDimensions();
  const dismissing = useSharedValue(false);
  const pan = usePanGesture({
    activeOffsetY: 8,
    failOffsetX: [-24, 24],
    maxPointers: 1,
    onUpdate: ({ translationY }) => {
      if (!dismissing.get()) {
        offset.set(Math.max(0, translationY));
      }
    },
    onDeactivate: ({ canceled, translationY, velocityY }) => {
      if (dismissing.get()) {
        return;
      }
      if (
        !canceled &&
        (translationY >= 88 || (translationY >= 24 && velocityY >= 650))
      ) {
        dismissing.set(true);
        offset.set(
          withTiming(height, { duration: 200 }, (finished) => {
            if (finished === true) {
              scheduleOnRN(onClose);
            }
          }),
        );
      } else {
        offset.set(withTiming(0, { duration: 180 }));
      }
    },
  });

  return (
    <GestureDetector gesture={pan}>
      <View
        collapsable={false}
        style={{ alignItems: 'center', justifyContent: 'center', height: 44 }}
      >
        <View
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.muted,
          }}
        />
      </View>
    </GestureDetector>
  );
}
