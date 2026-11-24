import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { AppState } from '../data/types';
import { defaultState } from './workout';

const STORAGE_KEY = 'fitnessity_native_v1';
type Store = {
  state: AppState;
  ready: boolean;
  update: (change: (state: AppState) => AppState) => void;
  notice: (message: string) => void;
  message: string;
  preference: (
    id: string,
    type: 'exercise' | 'workout',
    value: 'like' | 'avoid'
  ) => void;
};
const FitnessityContext = createContext<Store | null>(null);

export function FitnessityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');
  const writeQueue = useRef(Promise.resolve());
  const messageTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  function notice(text: string) {
    clearTimeout(messageTimer.current);
    setMessage(text);
    messageTimer.current = setTimeout(() => setMessage(''), 3200);
  }

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active) return;
        if (raw) {
          const saved = JSON.parse(raw) as AppState;
          if (
            !saved.profile ||
            !Array.isArray(saved.history) ||
            !Array.isArray(saved.meals)
          )
            throw new Error('Invalid saved data');
          setState({
            ...defaultState(),
            ...saved,
            profile: { ...defaultState().profile, ...saved.profile },
          });
        }
      })
      .catch(() => {
        if (active) notice('Opgeslagen gegevens konden niet worden geladen.');
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
      clearTimeout(messageTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    // Serialize writes, including keystroke drafts, so older data cannot overwrite a newer set.
    writeQueue.current = writeQueue.current
      .then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)))
      .catch(() =>
        notice('Opslaan is mislukt. Controleer de vrije ruimte op je apparaat.')
      );
  }, [state, ready]);

  function preference(
    id: string,
    type: 'exercise' | 'workout',
    value: 'like' | 'avoid'
  ) {
    setState((previous) => {
      if (type === 'workout') {
        const preferences = { ...previous.workoutPreferences };
        if (preferences[id] === value) delete preferences[id];
        else preferences[id] = value;
        return { ...previous, workoutPreferences: preferences };
      }
      const active = (
        value === 'like' ? previous.favorites : previous.avoidedExercises
      ).includes(id);
      return {
        ...previous,
        favorites: [
          ...previous.favorites.filter((v) => v !== id),
          ...(!active && value === 'like' ? [id] : []),
        ],
        avoidedExercises: [
          ...previous.avoidedExercises.filter((v) => v !== id),
          ...(!active && value === 'avoid' ? [id] : []),
        ],
      };
    });
  }

  return (
    <FitnessityContext.Provider
      value={{ state, ready, update: setState, notice, message, preference }}
    >
      {children}
    </FitnessityContext.Provider>
  );
}

export function useFitnessity() {
  const store = useContext(FitnessityContext);
  if (!store) throw new Error('FitnessityProvider is missing');
  return store;
}
