import { useRef } from 'react';
import { useWindowDimensions, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useTravelColors } from '../theme';
import { MenuHandle } from './MenuHandle';

export interface IVenueDismissHandleProps {
  offset: SharedValue<number>;
  onClose: () => void;
}

export function VenueDismissHandle({
  offset,
  onClose,
}: IVenueDismissHandleProps) {
  const colors = useTravelColors();
  const { height } = useWindowDimensions();
  const dismissing = useRef(false);
  return (
    <MenuHandle
      label="Swipe down to close venue details"
      onToggle={onClose}
      onDrag={(distance) => {
        if (!dismissing.current) {
          offset.set(Math.max(0, distance));
        }
      }}
      onRelease={(distance) => {
        if (dismissing.current) {
          return;
        }
        if (distance < 88) {
          offset.set(withTiming(0, { duration: 180 }));
          return;
        }
        dismissing.current = true;
        offset.set(
          withTiming(height, { duration: 200 }, (finished) => {
            if (finished === true) {
              scheduleOnRN(onClose);
            }
          }),
        );
      }}
    >
      <View
        style={{
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.muted,
        }}
      />
    </MenuHandle>
  );
}
