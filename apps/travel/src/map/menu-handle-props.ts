import type { ReactNode } from 'react';

export interface MenuHandleProps {
  children: ReactNode;
  open: boolean;
  onToggle: () => void;
  onDrag: (dy: number) => void;
  onRelease: (dy: number) => void;
}
