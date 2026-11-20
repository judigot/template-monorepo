import type { ReactNode } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  GestureDetector,
  GestureStateManager,
  useNativeGesture,
  usePanGesture,
} from 'react-native-gesture-handler';
import Animated, {
  type SharedValue,
  useAnimatedScrollHandler,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

interface IVenueSheetBodyProps {
  children: ReactNode;
  offset: SharedValue<number>;
  onClose: () => void;
}

export function VenueSheetBody({
  children,
  offset,
  onClose,
}: IVenueSheetBodyProps) {
  const { height } = useWindowDimensions();
  const scrollOffset = useSharedValue(0);
  const start = useSharedValue({ x: 0, y: 0 });
  const active = useSharedValue(false);
  const dismissing = useSharedValue(false);
  const scroll = useNativeGesture();
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollOffset.set(event.contentOffset.y);
  });
  const pan = usePanGesture({
    manualActivation: true,
    maxPointers: 1,
    block: scroll,
    onTouchesDown: ({ allTouches, handlerTag }) => {
      const touch = allTouches[0];
      if (touch === undefined || scrollOffset.get() > 1 || dismissing.get()) {
        GestureStateManager.fail(handlerTag);
      } else {
        start.set({ x: touch.absoluteX, y: touch.absoluteY });
      }
    },
    onTouchesMove: ({ allTouches, handlerTag }) => {
      const touch = allTouches[0];
      if (touch === undefined || active.get()) {
        return;
      }
      const dx = Math.abs(touch.absoluteX - start.get().x);
      const dy = touch.absoluteY - start.get().y;
      if (dy < -6 || (dx > 8 && dx > dy) || allTouches.length > 1) {
        GestureStateManager.fail(handlerTag);
      } else if (dy > 8) {
        active.set(true);
        GestureStateManager.activate(handlerTag);
      }
    },
    onTouchesUp: ({ handlerTag }) => {
      if (!active.get()) {
        GestureStateManager.fail(handlerTag);
      }
    },
    onFinalize: () => {
      active.set(false);
    },
    onUpdate: ({ translationY }) => {
      offset.set(Math.max(0, translationY));
    },
    onDeactivate: ({ canceled, translationY, velocityY }) => {
      const dismiss =
        !canceled &&
        (translationY >= 88 || (translationY >= 24 && velocityY >= 650));
      dismissing.set(dismiss);
      offset.set(
        withTiming(dismiss ? height : 0, { duration: 200 }, (finished) => {
          if (dismiss && finished === true) {
            scheduleOnRN(onClose);
          }
        }),
      );
    },
  });
  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={{ flexShrink: 1 }}>
        <GestureDetector gesture={scroll}>
          <Animated.ScrollView
            bounces={false}
            overScrollMode="never"
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 26,
              gap: 16,
            }}
          >
            {children}
          </Animated.ScrollView>
        </GestureDetector>
      </Animated.View>
    </GestureDetector>
  );
}
