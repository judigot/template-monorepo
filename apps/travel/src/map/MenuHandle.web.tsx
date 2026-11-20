import { useRef } from 'react';
import type { MenuHandleProps } from './menu-handle-props';

export function MenuHandle({
  children,
  open,
  onToggle,
  onDrag,
  onRelease,
}: MenuHandleProps) {
  const start = useRef<number | null>(null);
  const dragged = useRef(false);
  return (
    <button
      type="button"
      aria-label="Matching places and menu items"
      aria-expanded={open}
      onPointerDown={(event) => {
        if (!event.isPrimary || event.button !== 0) {
          return;
        }
        event.currentTarget.setPointerCapture(event.pointerId);
        start.current = event.clientY;
        dragged.current = false;
      }}
      onPointerMove={(event) => {
        if (!event.isPrimary || start.current === null) {
          return;
        }
        const dy = event.clientY - start.current;
        if (Math.abs(dy) > 4) {
          dragged.current = true;
        }
        if (dragged.current) {
          onDrag(dy);
        }
      }}
      onPointerUp={(event) => {
        if (!event.isPrimary || start.current === null) {
          return;
        }
        if (dragged.current) {
          onRelease(event.clientY - start.current);
        }
        start.current = null;
      }}
      onPointerCancel={() => {
        start.current = null;
        dragged.current = true;
        onRelease(0);
      }}
      onClick={(event) => {
        if (event.detail === 0 || !dragged.current) {
          onToggle();
        }
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        height: 46,
        border: 0,
        background: 'transparent',
        touchAction: 'none',
        userSelect: 'none',
        cursor: 'grab',
      }}
    >
      {children}
    </button>
  );
}
