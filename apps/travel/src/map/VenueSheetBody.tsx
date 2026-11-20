import { type ReactNode, useEffect, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { type SharedValue, withTiming } from 'react-native-reanimated';
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
  const body = useRef<HTMLDivElement>(null);
  const { height } = useWindowDimensions();

  useEffect(() => {
    const viewport = body.current;
    if (viewport === null) {
      return;
    }
    let start: { x: number; y: number } | null = null;
    let dragging = false;
    let dismissing = false;

    const begin = (x: number, y: number) => {
      if (!dismissing && viewport.scrollTop <= 1) {
        start = { x, y };
      }
    };

    function move(x: number, y: number) {
      if (start === null) {
        return false;
      }
      const distance = y - start.y;
      const horizontal = Math.abs(x - start.x);
      if (
        !dragging &&
        (distance < -6 || (horizontal > 8 && horizontal > distance))
      ) {
        start = null;
        return false;
      }
      if (!dragging && distance <= 8) {
        return false;
      }
      dragging = true;
      offset.set(Math.max(0, distance));
      return true;
    }

    function finish(y: number, canceled: boolean) {
      const active = dragging && start !== null;
      const dismiss =
        dragging && !canceled && start !== null && y - start.y >= 88;
      start = null;
      dragging = false;
      if (active) {
        dismissing = dismiss;
        offset.set(
          withTiming(dismiss ? height : 0, { duration: 200 }, (finished) => {
            if (dismiss && finished === true) {
              scheduleOnRN(onClose);
            }
          }),
        );
      }
      return active;
    }

    const onDown = (event: PointerEvent) => {
      if (
        event.pointerType !== 'touch' &&
        event.isPrimary &&
        event.button === 0
      ) {
        begin(event.clientX, event.clientY);
      }
    };
    const onMove = (event: PointerEvent) => {
      if (
        event.pointerType !== 'touch' &&
        event.buttons === 1 &&
        move(event.clientX, event.clientY)
      ) {
        viewport.setPointerCapture(event.pointerId);
        event.preventDefault();
      }
    };
    const onUp = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') {
        finish(event.clientY, false);
      }
    };
    const onCancel = () => {
      finish(0, true);
    };
    const onPointerCancel = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') {
        onCancel();
      }
    };
    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch !== undefined && event.touches.length === 1) {
        begin(touch.clientX, touch.clientY);
      } else {
        onCancel();
      }
    };
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch !== undefined && move(touch.clientX, touch.clientY)) {
        event.preventDefault();
      }
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (finish(event.changedTouches[0]?.clientY ?? 0, false)) {
        event.preventDefault();
      }
    };
    viewport.addEventListener('pointerdown', onDown);
    viewport.addEventListener('pointermove', onMove);
    viewport.addEventListener('pointerup', onUp);
    viewport.addEventListener('pointercancel', onPointerCancel);
    viewport.addEventListener('touchstart', onTouchStart);
    viewport.addEventListener('touchmove', onTouchMove, { passive: false });
    viewport.addEventListener('touchend', onTouchEnd);
    viewport.addEventListener('touchcancel', onCancel);
    return () => {
      viewport.removeEventListener('pointerdown', onDown);
      viewport.removeEventListener('pointermove', onMove);
      viewport.removeEventListener('pointerup', onUp);
      viewport.removeEventListener('pointercancel', onPointerCancel);
      viewport.removeEventListener('touchstart', onTouchStart);
      viewport.removeEventListener('touchmove', onTouchMove);
      viewport.removeEventListener('touchend', onTouchEnd);
      viewport.removeEventListener('touchcancel', onCancel);
    };
  }, [height, offset, onClose]);

  return (
    <div
      ref={body}
      data-testid="venue-sheet-body"
      style={{
        overflowY: 'auto',
        overscrollBehaviorY: 'contain',
        minHeight: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '0 20px 26px',
          gap: 16,
        }}
      >
        {children}
      </div>
    </div>
  );
}
