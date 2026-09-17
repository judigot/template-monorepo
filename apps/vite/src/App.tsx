import { getHello } from '@monorepo/api-client';
import { Showcase } from '@monorepo/components';
import {
  applyTokenGroups,
  createThemeTokenGroups,
  THEMES,
} from '@monorepo/design-tokens';
import { useEffect, useState } from 'react';
import { ProfileForm } from './examples/ProfileForm.tsx';

interface IHelloLoading {
  status: 'loading';
}

interface IHelloSuccess {
  status: 'success';
  message: string;
}

interface IHelloError {
  status: 'error';
  message: string;
}

type IHelloState = IHelloLoading | IHelloSuccess | IHelloError;

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';
const isThemeName = (value: string): value is keyof typeof THEMES =>
  value in THEMES;

function App() {
  const [hello, setHello] = useState<IHelloState>({ status: 'loading' });
  const [theme, setTheme] = useState<keyof typeof THEMES>('default');

  useEffect(() => {
    const controller = new AbortController();

    getHello({ baseUrl: API_BASE_URL, signal: controller.signal })
      .then((response) => {
        setHello({ status: 'success', message: response.message });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        console.error(error);
        setHello({ status: 'error', message: 'Could not reach the API.' });
      });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    applyTokenGroups(
      createThemeTokenGroups(theme),
      document.documentElement.style,
    );
    document.documentElement.dataset.designSystem = theme;
  }, [theme]);

  return (
    <div className="ui-app-shell">
      <div className="ui-hello-card">
        <p className="mb-6 flex justify-center">
          <span data-testid="framework-badge" className="ui-hello-badge">
            Vite
          </span>
        </p>
        {hello.status === 'loading' && (
          <output className="ui-hello-loading">Loading…</output>
        )}
        {hello.status === 'success' && (
          <h1 className="ui-hello-title">{hello.message}</h1>
        )}
        {hello.status === 'error' && (
          <p className="ui-hello-error" role="alert">
            {hello.message}
          </p>
        )}
      </div>
      <div className="ui-theme-switcher">
        <label htmlFor="design-system-theme">Design system</label>
        <select
          id="design-system-theme"
          value={theme}
          onChange={(event) => {
            if (isThemeName(event.target.value)) {
              setTheme(event.target.value);
            }
          }}
        >
          <option value="default">Default</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <optgroup label="Popular systems">
            <option value="google">Google</option>
            <option value="youtube">YouTube</option>
            <option value="wikipedia">Wikipedia</option>
            <option value="netflix">Netflix</option>
            <option value="spotify">Spotify</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="x">X</option>
            <option value="reddit">Reddit</option>
            <option value="linkedin">LinkedIn</option>
            <option value="amazon">Amazon</option>
            <option value="microsoft">Microsoft</option>
            <option value="github">GitHub</option>
            <option value="notion">Notion</option>
            <option value="chatgpt">ChatGPT</option>
            <option value="adobe">Adobe</option>
          </optgroup>
        </select>
      </div>
      <main className="ui-workspace-grid">
        <Showcase />
        <ProfileForm />
      </main>
    </div>
  );
}

export default App;
