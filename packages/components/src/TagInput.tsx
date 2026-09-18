/* oxlint-disable jsx-a11y/prefer-tag-over-role -- custom searchable listbox semantics */
import type {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
  ReactNode,
} from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface ITagInputProps {
  id: string;
  label: string;
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  tags: string[];
}

const serializeTags = (values: string[]): string => values.join(',');

const parseClipboardTags = (value: string): string[] =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const copyTags = (values: string[]): void => {
  if ('clipboard' in navigator) {
    void navigator.clipboard.writeText(serializeTags(values));
  }
};

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
  const [pulseTagIndex, setPulseTagIndex] = useState<number | null>(null);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const tagRefs = useRef<(HTMLSpanElement | null)[]>([]);
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

  useEffect(() => {
    if (selectedTagIndex === null) {
      return;
    }
    tagRefs.current[selectedTagIndex]?.focus();
  }, [selectedTagIndex]);

  const addTag = (tag: string): void => {
    const normalized = tag.trim();
    if (normalized.length === 0) {
      return;
    }
    const existingIndex = tags.findIndex((item) => item === normalized);
    if (existingIndex >= 0) {
      setPulseTagIndex(existingIndex);
      window.setTimeout(() => {
        setPulseTagIndex(null);
      }, 250);
      return;
    }
    onChange([...tags, normalized]);
    setValue('');
    setSelectedTagIndex(null);
    setAreTagsSelected(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (
      areTagsSelected &&
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === 'x'
    ) {
      event.preventDefault();
      copyTags(tags);
      onChange([]);
      setAreTagsSelected(false);
      setSelectedTagIndex(null);
      setIsFocused(true);
      setIsSuggestionsOpen(true);
      inputRef.current?.focus();
      return;
    }
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
    if (
      value.length === 0 &&
      tags.length > 0 &&
      (event.key === 'ArrowLeft' || event.key === 'ArrowRight')
    ) {
      event.preventDefault();
      setAreTagsSelected(false);
      setSelectedTagIndex((current) => {
        if (current === null) {
          return tags.length - 1;
        }
        const delta = event.key === 'ArrowLeft' ? -1 : 1;
        return Math.max(0, Math.min(tags.length - 1, current + delta));
      });
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

  const handlePaste = (event: ClipboardEvent<HTMLElement>): void => {
    const pastedTags = parseClipboardTags(event.clipboardData.getData('text'));
    if (pastedTags.length <= 1) {
      return;
    }
    event.preventDefault();
    const additions = pastedTags.filter(
      (tag, index) => !tags.includes(tag) && pastedTags.indexOf(tag) === index,
    );
    if (additions.length === 0) {
      return;
    }
    onChange([...tags, ...additions]);
    setValue('');
    setSelectedTagIndex(null);
    setAreTagsSelected(false);
  };

  const focusInputFromTag = (index: number, key: string): void => {
    setSelectedTagIndex(null);
    setAreTagsSelected(false);
    setPulseTagIndex(index);
    inputRef.current?.focus();
    if (key.length === 1) {
      setValue(key);
    }
    window.setTimeout(() => {
      setPulseTagIndex(null);
    }, 250);
  };

  const handleFieldBlur = (nextFocus: EventTarget | null): void => {
    if (
      nextFocus instanceof HTMLElement &&
      nextFocus.closest('.ui-tag-field') !== null
    ) {
      return;
    }
    setIsFocused(false);
    setIsSuggestionsOpen(false);
    setSelectedTagIndex(null);
    setAreTagsSelected(false);
  };

  return (
    /* biome-ignore lint/a11y/noStaticElementInteractions: blur is used to detect focus leaving the composite field */
    <div
      className="ui-tag-field"
      onBlur={(event) => {
        handleFieldBlur(event.relatedTarget);
      }}
    >
      <span className="ui-form-label" id={`${id}-label`}>
        {label}
      </span>
      <div className={`ui-tag-input${isFocused ? ' is-focused' : ''}`}>
        {tags.map((tag, index) => (
          <span
            aria-selected={index === selectedTagIndex}
            role="option"
            className={`ui-tag${areTagsSelected ? ' is-bulk-selected' : ''}${index === selectedTagIndex ? ' is-selected' : ''}${pulseTagIndex === index ? ' is-pulsing' : ''}`}
            key={tag}
            onKeyDown={(event) => {
              if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === 'a'
              ) {
                event.preventDefault();
                setAreTagsSelected(true);
                setSelectedTagIndex(tags.length - 1);
              } else if (
                areTagsSelected &&
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === 'c'
              ) {
                event.preventDefault();
                copyTags(tags);
              } else if (
                areTagsSelected &&
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === 'x'
              ) {
                event.preventDefault();
                copyTags(tags);
                onChange([]);
                setAreTagsSelected(false);
                setSelectedTagIndex(null);
                setIsFocused(true);
                setIsSuggestionsOpen(true);
                inputRef.current?.focus();
              } else if (
                event.key === 'ArrowLeft' ||
                event.key === 'ArrowRight'
              ) {
                event.preventDefault();
                const delta = event.key === 'ArrowLeft' ? -1 : 1;
                setSelectedTagIndex(
                  Math.max(0, Math.min(tags.length - 1, index + delta)),
                );
              } else if (event.key === 'Backspace' || event.key === 'Delete') {
                event.preventDefault();
                if (areTagsSelected) {
                  onChange([]);
                  setAreTagsSelected(false);
                  setSelectedTagIndex(null);
                  setIsFocused(true);
                  setIsSuggestionsOpen(true);
                  inputRef.current?.focus();
                  return;
                }
                const nextTags = tags.filter(
                  (_, tagIndex) => tagIndex !== index,
                );
                onChange(nextTags);
                setSelectedTagIndex(
                  nextTags.length === 0
                    ? null
                    : Math.min(index, nextTags.length - 1),
                );
              } else if (
                event.key.length === 1 &&
                !event.ctrlKey &&
                !event.metaKey
              ) {
                focusInputFromTag(index, event.key);
              }
            }}
            onCopy={(event) => {
              if (areTagsSelected) {
                event.clipboardData.setData('text/plain', serializeTags(tags));
                event.preventDefault();
              }
            }}
            onPaste={handlePaste}
            onClick={() => {
              setAreTagsSelected(false);
              setSelectedTagIndex(index);
              setIsFocused(false);
              setIsSuggestionsOpen(false);
            }}
            onMouseDown={(event) => {
              event.currentTarget.focus();
            }}
            ref={(element) => {
              tagRefs.current[index] = element;
            }}
            tabIndex={index === selectedTagIndex ? 0 : -1}
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={(event) => {
                event.stopPropagation();
                onChange(tags.filter((item) => item !== tag));
                setAreTagsSelected(false);
                setSelectedTagIndex(null);
                setIsFocused(true);
                setIsSuggestionsOpen(true);
                inputRef.current?.focus();
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
          ref={inputRef}
          onBlur={(event) => {
            handleFieldBlur(event.relatedTarget);
          }}
          onChange={handleChange}
          onPaste={handlePaste}
          onCopy={(event) => {
            if (areTagsSelected) {
              event.clipboardData.setData('text/plain', serializeTags(tags));
              event.preventDefault();
            }
          }}
          onFocus={() => {
            setIsFocused(true);
            setIsSuggestionsOpen(true);
            setSelectedTagIndex(null);
            setAreTagsSelected(false);
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
                onClick={() => {
                  addTag(suggestion);
                  setIsFocused(true);
                  setIsSuggestionsOpen(true);
                  setSelectedTagIndex(null);
                  setAreTagsSelected(false);
                  inputRef.current?.focus();
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
