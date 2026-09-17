import type { ReactNode } from 'react';

export interface IFormFieldProps {
  children: ReactNode;
  description?: string;
  error?: string;
  htmlFor: string;
  label: string;
}

/** Accessible label/description/error composition for native and shadcn-style controls. */
export function FormField({
  children,
  description,
  error,
  htmlFor,
  label,
}: IFormFieldProps): ReactNode {
  const descriptionId = `${htmlFor}-description`;
  const errorId = `${htmlFor}-error`;
  return (
    <div className="ui-form-field">
      <label className="ui-form-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {description !== undefined ? (
        <span className="ui-form-help" id={descriptionId}>
          {description}
        </span>
      ) : null}
      {error !== undefined ? (
        <span className="ui-form-error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
