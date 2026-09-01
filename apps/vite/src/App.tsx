import { getHello } from '@bigbang/api-client';
import { useEffect, useState } from 'react';

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

function App() {
  const [hello, setHello] = useState<IHelloState>({ status: 'loading' });

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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white/90 rounded-3xl shadow-2xl px-10 py-16">
        <p className="mb-6 flex justify-center">
          <span
            data-testid="framework-badge"
            className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1 text-sm font-semibold uppercase tracking-widest text-white"
          >
            Vite
          </span>
        </p>
        {hello.status === 'loading' && (
          <output className="block text-2xl text-center text-gray-500">
            Loading…
          </output>
        )}
        {hello.status === 'success' && (
          <h1 className="text-5xl md:text-6xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 drop-shadow-lg tracking-tight">
            {hello.message}
          </h1>
        )}
        {hello.status === 'error' && (
          <p className="text-2xl text-center text-red-600" role="alert">
            {hello.message}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
