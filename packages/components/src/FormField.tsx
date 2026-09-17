import type { ReactNode } from 'react';

export interface IFormFieldProps {
  children: ReactNode;
  description?: string;
  error?: string;
  htmlFor: string;
  label: string;
}

export function FormField({
  children,
  description,
  error,
  htmlFor,
  label,
}: IFormFieldProps): ReactNode {
  return (
    <div className="ui-form-field">
      <label className="ui-form-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {description !== undefined ? (
        <span className="ui-form-help" id={`${htmlFor}-description`}>
          {description}
        </span>
      ) : null}
      {error !== undefined ? (
        <span className="ui-form-error" id={`${htmlFor}-error`} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
