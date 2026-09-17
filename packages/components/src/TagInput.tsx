import type { ChangeEvent, KeyboardEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';

export interface ITagInputProps {
  id: string;
  label: string;
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  tags: string[];
}

export function TagInput({
  id,
  label,
  onChange,
  suggestions = [],
  tags,
}: ITagInputProps): ReactNode {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const availableSuggestions = useMemo(() => {
    const query = value.trim().toLowerCase();
    return suggestions.filter(
      (suggestion) =>
        !tags.includes(suggestion) &&
        (query.length === 0 || suggestion.toLowerCase().includes(query)),
    );
  }, [suggestions, tags, value]);

  const addTag = (tag: string): void => {
    const normalized = tag.trim();
    if (normalized.length === 0 || tags.includes(normalized)) {
      return;
    }
    onChange([...tags, normalized]);
    setValue('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(value);
    }
    if (event.key === 'Backspace' && value.length === 0 && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setValue(event.target.value);
  };

  return (
    <div className="ui-tag-field">
      <span className="ui-form-label" id={`${id}-label`}>
        {label}
      </span>
      <div className={`ui-tag-input${isFocused ? ' is-focused' : ''}`}>
        {tags.map((tag) => (
          <span className="ui-tag" key={tag}>
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => {
                onChange(tags.filter((item) => item !== tag));
              }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          aria-labelledby={`${id}-label`}
          id={id}
          onBlur={() => {
            setIsFocused(false);
          }}
          onChange={handleChange}
          onFocus={() => {
            setIsFocused(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            tags.length === 0 ? 'Type and press Enter' : 'Add another'
          }
          value={value}
        />
      </div>
      {isFocused && availableSuggestions.length > 0 ? (
        <ul className="ui-tag-suggestions" aria-label={`${label} suggestions`}>
          {availableSuggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={() => {
                  addTag(suggestion);
                }}
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
