/* oxlint-disable jsx-a11y/prefer-tag-over-role -- custom searchable listbox semantics */
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
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [placement, setPlacement] = useState<'below' | 'above'>('below');
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [selectedTagIndex, setSelectedTagIndex] = useState<number | null>(null);
  const [areTagsSelected, setAreTagsSelected] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
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
    setAreTagsSelected(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === 'a' &&
      value.length === 0 &&
      tags.length > 0
    ) {
      event.preventDefault();
      setAreTagsSelected(true);
      setSelectedTagIndex(tags.length - 1);
      return;
    }
    if (availableSuggestions.length > 0 && event.key === 'ArrowDown') {
      event.preventDefault();
      setIsFocused(true);
      setIsSuggestionsOpen(true);
      setActiveSuggestion(
        (current) => (current + 1) % availableSuggestions.length,
      );
      return;
    }
    if (availableSuggestions.length > 0 && event.key === 'ArrowUp') {
      event.preventDefault();
      setIsFocused(true);
      setIsSuggestionsOpen(true);
      setActiveSuggestion(
        (current) =>
          (current - 1 + availableSuggestions.length) %
          availableSuggestions.length,
      );
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setIsSuggestionsOpen(false);
      return;
    }
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const selectedSuggestion =
        activeSuggestion >= 0
          ? availableSuggestions[activeSuggestion]
          : undefined;
      addTag(selectedSuggestion ?? value);
      return;
    }
    if (event.key === 'Backspace' && value.length === 0 && tags.length > 0) {
      event.preventDefault();
      if (areTagsSelected) {
        onChange([]);
        setAreTagsSelected(false);
        setSelectedTagIndex(null);
        return;
      }
      if (selectedTagIndex === null) {
        setSelectedTagIndex(tags.length - 1);
        return;
      }
      const nextTags = tags.filter((_, index) => index !== selectedTagIndex);
      onChange(nextTags);
      setAreTagsSelected(false);
      setSelectedTagIndex(
        nextTags.length === 0
          ? null
          : Math.min(selectedTagIndex - 1, nextTags.length - 1),
      );
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setIsFocused(true);
    setIsSuggestionsOpen(true);
    setValue(event.target.value);
    setActiveSuggestion(-1);
    setSelectedTagIndex(null);
    setAreTagsSelected(false);
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
            className={`ui-tag${areTagsSelected ? ' is-bulk-selected' : ''}${index === selectedTagIndex ? ' is-selected' : ''}`}
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
          aria-activedescendant={
            isFocused && availableSuggestions.length > 0
              ? `${id}-suggestion-${String(activeSuggestion)}`
              : undefined
          }
          aria-autocomplete="list"
          aria-controls={`${id}-suggestions`}
          aria-expanded={isSuggestionsOpen && availableSuggestions.length > 0}
          role="combobox"
          id={id}
          onBlur={() => {
            setIsFocused(false);
            setIsSuggestionsOpen(false);
          }}
          onChange={handleChange}
          onFocus={() => {
            setIsFocused(true);
            setIsSuggestionsOpen(true);
            setSelectedTagIndex(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            tags.length === 0 ? 'Type and press Enter' : 'Add another'
          }
          value={value}
        />
      </div>
      {isSuggestionsOpen && availableSuggestions.length > 0 ? (
        <div
          id={`${id}-suggestions`}
          className={`ui-tag-suggestions ui-tag-suggestions--${placement}`}
          aria-label={`${label} suggestions`}
          role="listbox"
          ref={suggestionsRef}
        >
          {availableSuggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              id={`${id}-suggestion-${String(index)}`}
              role="option"
              aria-selected={index === activeSuggestion}
            >
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={() => {
                  addTag(suggestion);
                }}
                data-active={index === activeSuggestion ? 'true' : undefined}
              >
                {suggestion}
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
