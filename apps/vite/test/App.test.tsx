import { afterEach, describe, expect, it, mock } from 'bun:test';
import { render, screen, waitFor } from '@testing-library/react';
import App from '@/App.tsx';

const originalFetch = globalThis.fetch;

function mockFetchOnce(response: Response): void {
  globalThis.fetch = mock(() =>
    Promise.resolve(response),
  ) as unknown as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('App', () => {
  it('shows a loading state while the request is in flight', () => {
    globalThis.fetch = mock(
      () => new Promise<Response>(() => undefined),
    ) as unknown as typeof fetch;

    render(<App />);
    expect(screen.getByRole('status').textContent).toContain('Loading');
  });

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

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading').textContent).toBe('Hello, world!');
    });
    expect(requested).toBe(true);
  });

  it('identifies itself as the Vite frontend', () => {
    globalThis.fetch = mock(
      () => new Promise<Response>(() => undefined),
    ) as unknown as typeof fetch;

    render(<App />);
    expect(screen.getByTestId('framework-badge').textContent).toBe('Vite');
  });

  it('renders an error state when the API responds with an error', async () => {
    mockFetchOnce(new Response('Internal Server Error', { status: 500 }));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain(
        'Could not reach the API.',
      );
    });
  });
});
