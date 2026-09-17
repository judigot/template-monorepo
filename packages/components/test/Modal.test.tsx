import { describe, expect, it, mock } from 'bun:test';
import { fireEvent, render, screen } from '@testing-library/react';
import { Modal } from '../src/Modal.tsx';

describe('Modal', () => {
  it('opens a named dialog with footer and closes through the control', () => {
    const onClose = mock(() => undefined);
    render(
      <Modal
        isOpen
        onClose={onClose}
        title="Example dialog"
        footer={<button type="button">Confirm</button>}
      >
        Content
      </Modal>,
    );
    expect(
      screen.getByRole('dialog', { name: 'Example dialog' }),
    ).toBeDefined();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
