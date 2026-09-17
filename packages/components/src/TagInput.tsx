import type { ChangeEvent, KeyboardEvent, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

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
  const [selectedTagIndex, setSelectedTagIndex] = useState<number | null>(null);
  const [placement, setPlacement] = useState<'below' | 'above'>('below');
  const suggestionsRef = useRef<HTMLUListElement | null>(null);
  const availableSuggestions = useMemo(() => {
    const query = value.trim().toLowerCase();
    return suggestions.filter(
      (suggestion) =>
        !tags.includes(suggestion) &&
        (query.length === 0 || suggestion.toLowerCase().includes(query)),
    );
  }, [suggestions, tags, value]);

  useEffect(() => {
    const list = suggestionsRef.current;
    if (!isFocused || list === null) {
      return;
    }
    const rect = list.getBoundingClientRect();
    const shouldFlip =
      rect.bottom > window.innerHeight && rect.top > rect.height;
    setPlacement(shouldFlip ? 'above' : 'below');
  }, [isFocused, availableSuggestions.length]);

  const addTag = (tag: string): void => {
    const normalized = tag.trim();
    if (normalized.length === 0 || tags.includes(normalized)) {
      return;
    }
    onChange([...tags, normalized]);
    setValue('');
    setSelectedTagIndex(null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(value);
      return;
    }
    if (event.key === 'Backspace' && value.length === 0 && tags.length > 0) {
      event.preventDefault();
      if (selectedTagIndex === null) {
        setSelectedTagIndex(tags.length - 1);
        return;
      }
      const nextTags = tags.filter((_, index) => index !== selectedTagIndex);
      onChange(nextTags);
      setSelectedTagIndex(
        nextTags.length === 0
          ? null
          : Math.min(selectedTagIndex - 1, nextTags.length - 1),
      );
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setValue(event.target.value);
    setSelectedTagIndex(null);
  };

  return (
    <div className="ui-tag-field">
      <span className="ui-form-label" id={`${id}-label`}>
        {label}
      </span>
      <div className={`ui-tag-input${isFocused ? ' is-focused' : ''}`}>
        {tags.map((tag, index) => (
          <span
            aria-selected={index === selectedTagIndex}
            className={`ui-tag${index === selectedTagIndex ? ' is-selected' : ''}`}
            key={tag}
          >
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
            setSelectedTagIndex(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            tags.length === 0 ? 'Type and press Enter' : 'Add another'
          }
          value={value}
        />
      </div>
      {isFocused && availableSuggestions.length > 0 ? (
        <ul
          className={`ui-tag-suggestions ui-tag-suggestions--${placement}`}
          aria-label={`${label} suggestions`}
          ref={suggestionsRef}
        >
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
