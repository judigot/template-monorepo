/* eslint-disable react/jsx-props-no-spreading -- wrappers intentionally forward native input props. */

import { Eye, EyeOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { useId, useState } from 'react';

export interface IFormOption {
  label: string;
  value: string;
}
export function InputGroup({
  children,
  prefix,
  suffix,
}: {
  children: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
}): ReactNode {
  return (
    <div className="ui-input-group">
      {prefix !== undefined ? (
        <span className="ui-input-group__addon">{prefix}</span>
      ) : null}
      {children}
      {suffix !== undefined ? (
        <span className="ui-input-group__addon">{suffix}</span>
      ) : null}
    </div>
  );
}
export function PasswordInput(
  props: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>,
): ReactNode {
  const [visible, setVisible] = useState(false);
  return (
    <InputGroup
      suffix={
        <button
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="ui-password-toggle"
          onClick={() => {
            setVisible((current) => !current);
          }}
          type="button"
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </button>
      }
    >
      <input
        {...props}
        className="ui-form-control"
        type={visible ? 'text' : 'password'}
      />
    </InputGroup>
  );
}
export function Combobox({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: IFormOption[];
  value: string;
  onChange: (value: string) => void;
}): ReactNode {
  const listId = useId();
  return (
    <label className="ui-form-field" htmlFor={id}>
      <span className="ui-form-label">{label}</span>
      <input
        className="ui-form-control"
        id={id}
        list={listId}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        value={value}
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </datalist>
    </label>
  );
}
export function DatePicker(
  props: React.InputHTMLAttributes<HTMLInputElement>,
): ReactNode {
  return <input {...props} className="ui-form-control" type="date" />;
}
export function FileUpload(
  props: React.InputHTMLAttributes<HTMLInputElement>,
): ReactNode {
  return (
    <input
      {...props}
      accept={props.accept ?? 'image/png,image/jpeg,application/pdf'}
      className="ui-form-control"
      type="file"
    />
  );
}
export function CheckboxGroup({
  legend,
  options,
  values,
  onChange,
}: {
  legend: string;
  options: IFormOption[];
  values: string[];
  onChange: (values: string[]) => void;
}): ReactNode {
  return (
    <fieldset className="ui-form-options">
      <legend className="ui-form-legend">{legend}</legend>
      {options.map((option) => (
        <label className="ui-form-option" key={option.value}>
          <input
            checked={values.includes(option.value)}
            onChange={(event) => {
              onChange(
                event.target.checked
                  ? [...values, option.value]
                  : values.filter((value) => value !== option.value),
              );
            }}
            type="checkbox"
            value={option.value}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
export function RadioGroup({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: IFormOption[];
  value: string;
  onChange: (value: string) => void;
}): ReactNode {
  return (
    <fieldset className="ui-form-options">
      <legend className="ui-form-legend">{legend}</legend>
      {options.map((option) => (
        <label className="ui-form-option" key={option.value}>
          <input
            checked={value === option.value}
            name={name}
            onChange={() => {
              onChange(option.value);
            }}
            type="radio"
            value={option.value}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
