import type { Dispatch, ReactNode, SetStateAction } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { IExploreCamera } from '../map/place';

export interface IExploreState {
  budget: number;
  people: number;
  camera: IExploreCamera;
}

export interface ITravelState {
  explore: IExploreState;
  setExplore: Dispatch<SetStateAction<IExploreState>>;
  savedIds: readonly string[];
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
}

const TravelContext = createContext<ITravelState | undefined>(undefined);

export function TravelProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<readonly string[]>([]);
  const [explore, setExplore] = useState<IExploreState>({
    budget: 500,
    people: 1,
    camera: {
      center: [123.900296875, 10.3318875],
      zoom: 15.5,
      bounds: { west: 123.88, south: 10.315, east: 123.92, north: 10.35 },
    },
  });

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
    () => ({ savedIds, toggleSaved, isSaved, explore, setExplore }),
    [savedIds, toggleSaved, isSaved, explore],
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
