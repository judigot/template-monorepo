import { useRef } from 'react';
import { Pressable } from 'react-native';
import type { IMenuHandleProps } from './menu-handle-props';

export function MenuHandle({
  children,
  open,
  onToggle,
  onDrag,
  onRelease,
}: IMenuHandleProps) {
  const start = useRef(0);
  const dragged = useRef(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Matching places and menu items"
      aria-expanded={open}
      onTouchStart={(event) => {
        start.current = event.nativeEvent.pageY;
        dragged.current = false;
      }}
      onTouchMove={(event) => {
        const dy = event.nativeEvent.pageY - start.current;
        if (Math.abs(dy) > 4) {
          dragged.current = true;
        }
        if (dragged.current) {
          onDrag(dy);
        }
      }}
      onTouchEnd={(event) => {
        if (dragged.current) {
          onRelease(event.nativeEvent.pageY - start.current);
        }
      }}
      onTouchCancel={() => {
        dragged.current = true;
        onRelease(0);
      }}
      onPress={() => {
        if (!dragged.current) {
          onToggle();
        }
      }}
      style={{ height: 46, alignItems: 'center', justifyContent: 'center' }}
    >
      {children}
    </Pressable>
  );
}
