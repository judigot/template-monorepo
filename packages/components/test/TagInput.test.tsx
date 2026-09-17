import { describe, expect, it, vi } from 'bun:test';
import { fireEvent, render, screen } from '@testing-library/react';
import { TagInput } from '../src/TagInput.tsx';

describe('TagInput', () => {
  it('selects then removes tags with consecutive Backspace presses', () => {
    const onChange = vi.fn();
    render(
      <TagInput
        id="recipients"
        label="Recipients"
        onChange={onChange}
        tags={['Ada', 'Grace']}
      />,
    );
    const input = screen.getByRole('textbox');

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

  it('closes suggestions when focus leaves the input', () => {
    render(
      <TagInput
        id="technologies"
        label="Technologies"
        onChange={vi.fn()}
        suggestions={['React']}
        tags={[]}
      />,
    );
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    expect(screen.queryByRole('list')).not.toBeNull();
    fireEvent.blur(input);
    expect(screen.queryByRole('list')).toBeNull();
  });
});
