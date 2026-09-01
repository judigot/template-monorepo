import { afterEach, describe, expect, it, mock } from 'bun:test';
import { render, screen } from '@testing-library/react';
import ErrorPage from '@/app/error.tsx';
import Loading from '@/app/loading.tsx';
import HomePage from '@/app/page.tsx';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('HomePage', () => {
  it('requests the API and renders the returned message', async () => {
    let requested = false;
    globalThis.fetch = mock(() => {
      requested = true;
      return Promise.resolve(
        new Response(JSON.stringify({ message: 'Hello, world!' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }) as unknown as typeof fetch;

    render(await HomePage());

    expect(screen.getByRole('heading').textContent).toBe('Hello, world!');
    expect(requested).toBe(true);
    expect(screen.getByTestId('framework-badge').textContent).toBe('Next.js');
  });

  it('rejects when the API is unavailable so error.tsx takes over', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response('Bad Gateway', { status: 502 })),
    ) as unknown as typeof fetch;

    let caught: unknown;
    try {
      await HomePage();
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
  });
});

describe('Loading', () => {
  it('renders a loading indicator', () => {
    render(<Loading />);
    expect(screen.getByRole('status').textContent).toContain('Loading');
  });
});

describe('ErrorPage', () => {
  it('renders an error message with a retry button', () => {
    render(
      <ErrorPage
        error={new Error('boom')}
        reset={() => {
          /* no-op for the test */
        }}
      />,
    );

    expect(screen.getByRole('alert').textContent).toContain(
      'Could not reach the API.',
    );
    expect(screen.getByRole('button').textContent).toBe('Try again');
  });
});
