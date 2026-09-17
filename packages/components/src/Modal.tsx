import type { ReactNode, RefObject } from 'react';
import { useEffect, useId, useRef } from 'react';

export interface IModalProps {
  children: ReactNode;
  footer?: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function Modal({
  children,
  footer,
  initialFocusRef,
  isOpen,
  onClose,
  title,
}: IModalProps): ReactNode {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog === null) {
      return;
    }

    if (isOpen) {
      const activeElement = document.activeElement;
      previousFocusRef.current =
        activeElement instanceof HTMLElement ? activeElement : null;

      if (!dialog.open) {
        dialog.showModal();
      }

      initialFocusRef?.current?.focus();
      return;
    }

    if (dialog.open) {
      dialog.close();
    }
  }, [initialFocusRef, isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;

    return () => {
      if (dialog === null) {
        return;
      }

      if (dialog.open) {
        dialog.close();
      }
    };
  }, []);

  const handleCancel = (
    event: React.SyntheticEvent<HTMLDialogElement>,
  ): void => {
    event.preventDefault();
    onClose();
  };

  const handleClose = (): void => {
    previousFocusRef.current?.focus();
    if (isOpen) {
      onClose();
    }
  };

  return (
    <dialog
      aria-labelledby={titleId}
      className="ui-modal"
      onCancel={handleCancel}
      onClose={handleClose}
      ref={dialogRef}
    >
      <button
        aria-label="Dismiss dialog backdrop"
        className="ui-modal__backdrop"
        onClick={onClose}
        type="button"
      />
      <div className="ui-modal__surface">
        <header className="ui-modal__header">
          <h2 className="ui-modal__title" id={titleId}>
            {title}
          </h2>
          <button
            aria-label="Close dialog"
            className="ui-modal__close"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </header>
        <div className="ui-modal__body">{children}</div>
        {footer === undefined ? null : (
          <footer className="ui-modal__footer">{footer}</footer>
        )}
      </div>
    </dialog>
  );
}
