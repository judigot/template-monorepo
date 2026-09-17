import { describe, expect, it, mock } from 'bun:test';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TagInput } from '../src/TagInput.tsx';

describe('TagInput suggestions', () => {
  it('selects the active suggestion with arrows and Enter', async () => {
    const onChange = mock(() => undefined);
    render(
      <TagInput
        id="tags"
        label="Tags"
        onChange={onChange}
        suggestions={['React', 'Relay']}
        tags={[]}
      />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(2);
    });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await waitFor(() => {
      expect(
        screen
          .getByRole('option', { name: 'React' })
          .getAttribute('aria-selected'),
      ).toBe('true');
    });
    expect(
      screen
        .getByRole('option', { name: 'React' })
        .getAttribute('aria-selected'),
    ).toBe('true');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['React']);
  });

  it('closes suggestions on Escape while retaining focus', async () => {
    render(
      <TagInput
        id="tags"
        label="Tags"
        onChange={() => undefined}
        suggestions={['React']}
        tags={[]}
      />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    await waitFor(() => {
      expect(screen.getByRole('option')).toBeDefined();
    });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('option')).toBeNull();
  });

  it('selects then removes the last tag with consecutive Backspace presses', () => {
    const onChange = mock(() => undefined);
    render(
      <TagInput
        id="tags"
        label="Tags"
        onChange={onChange}
        tags={['Ada', 'Grace']}
      />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(
      screen
        .getByText('Grace')
        .closest('.ui-tag')
        ?.getAttribute('aria-selected'),
    ).toBe('true');
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(onChange).toHaveBeenCalledWith(['Ada']);
  });

  it('closes suggestions when focus leaves the input', async () => {
    render(
      <TagInput
        id="tags"
        label="Tags"
        onChange={() => undefined}
        suggestions={['React']}
        tags={[]}
      />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeNull();
    });
    fireEvent.blur(input);
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});
