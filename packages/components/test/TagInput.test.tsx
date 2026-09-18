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
    expect(screen.getByText('Grace').closest('.ui-tag')?.className).toContain(
      'is-selected',
    );
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

  it('moves the active chip border with Left and Right arrows', () => {
    render(
      <TagInput
        id="tags"
        label="Tags"
        onChange={() => undefined}
        tags={['Ada', 'Grace', 'Linus']}
      />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'ArrowLeft' });
    expect(screen.getByText('Linus').closest('.ui-tag')?.className).toContain(
      'is-selected',
    );
    fireEvent.keyDown(input, { key: 'ArrowLeft' });
    expect(screen.getByText('Grace').closest('.ui-tag')?.className).toContain(
      'is-selected',
    );
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    expect(screen.getByText('Linus').closest('.ui-tag')?.className).toContain(
      'is-selected',
    );
  });

  it('focuses a chip when it is clicked', () => {
    render(
      <TagInput
        id="tags"
        label="Tags"
        onChange={() => undefined}
        tags={['Ada', 'Grace']}
      />,
    );
    const chip = screen.getByText('Ada').closest('.ui-tag');
    if (chip === null) {
      throw new Error('Expected Ada chip');
    }
    fireEvent.click(chip);
    expect(document.activeElement).toBe(chip);
    expect(chip.className).toContain('is-selected');
  });

  it('selects every tag with Ctrl+A and anchors the border on the last tag', () => {
    const onChange = mock(() => undefined);
    render(
      <TagInput
        id="tags"
        label="Tags"
        onChange={onChange}
        tags={['Ada', 'Grace']}
      />,
    );
    fireEvent.keyDown(screen.getByRole('combobox'), {
      key: 'a',
      ctrlKey: true,
    });
    expect(screen.getByText('Ada').closest('.ui-tag')?.className).toContain(
      'is-bulk-selected',
    );
    expect(screen.getByText('Grace').closest('.ui-tag')?.className).toContain(
      'is-selected',
    );
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Backspace' });
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('closes suggestions when focus leaves the input', async () => {
    render(
      <TagInput
        id="tags"
        label="Tags"
        onChange={() => undefined}
        suggestions={['React']}
        tags={['Ada', 'Grace']}
      />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'a', ctrlKey: true });
    expect(screen.getByText('Ada').closest('.ui-tag')?.className).toContain(
      'is-bulk-selected',
    );
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeNull();
    });
    fireEvent.blur(input);
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.getByText('Ada').closest('.ui-tag')?.className).not.toContain(
      'is-bulk-selected',
    );
    expect(
      screen.getByText('Grace').closest('.ui-tag')?.className,
    ).not.toContain('is-selected');
  });
});
