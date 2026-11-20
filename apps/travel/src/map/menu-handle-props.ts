import type { ReactNode } from 'react';

export interface IMenuHandleProps {
  children: ReactNode;
  open: boolean;
  onToggle: () => void;
  onDrag: (dy: number) => void;
  onRelease: (dy: number) => void;
}
