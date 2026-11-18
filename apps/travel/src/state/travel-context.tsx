import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export interface ITravelState {
  savedIds: readonly string[];
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
}

const TravelContext = createContext<ITravelState | undefined>(undefined);

export function TravelProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<readonly string[]>([]);

  const toggleSaved = useCallback((id: string) => {
    setSavedIds((current) =>
      current.includes(id)
        ? current.filter((savedId) => savedId !== id)
        : [...current, id],
    );
  }, []);

  const isSaved = useCallback(
    (id: string) => savedIds.includes(id),
    [savedIds],
  );
  const state = useMemo(
    () => ({ savedIds, toggleSaved, isSaved }),
    [savedIds, toggleSaved, isSaved],
  );

  return (
    <TravelContext.Provider value={state}>{children}</TravelContext.Provider>
  );
}

export function useTravel(): ITravelState {
  const state = useContext(TravelContext);
  if (state === undefined) {
    throw new Error('useTravel must be called within TravelProvider');
  }

  return state;
}
