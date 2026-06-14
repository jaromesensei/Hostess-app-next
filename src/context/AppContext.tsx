import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import { AppState, Dog, HealthRecord, Reminder, Match, Message } from '@/types';
import { storage } from '@/services/storage';
import { MOCK_DOGS } from '@/data/mockDogs';

// ─── State shape ─────────────────────────────────────────────────────────────

const initialState: AppState = {
  dog: null,
  dogs: [],
  activeDogId: null,
  ownerName: '',
  ownerCity: '',
  ownerPhoto: null,
  healthRecords: [],
  reminders: [],
  matches: [],
  likedDogIds: [],
  isOnboardingComplete: false,
};

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'HYDRATE'; payload: AppState }
  | { type: 'SET_DOG'; payload: Dog }
  | { type: 'UPDATE_DOG'; payload: Partial<Dog> }
  | { type: 'ADD_ANOTHER_DOG'; payload: Dog }
  | { type: 'SWITCH_ACTIVE_DOG'; payload: string }
  | { type: 'REMOVE_DOG'; payload: string }
  | { type: 'SET_OWNER'; payload: { name: string; city: string; photo?: string | null } }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'ADD_HEALTH_RECORD'; payload: HealthRecord }
  | { type: 'UPDATE_HEALTH_RECORD'; payload: HealthRecord }
  | { type: 'DELETE_HEALTH_RECORD'; payload: string }
  | { type: 'ADD_REMINDER'; payload: Reminder }
  | { type: 'UPDATE_REMINDER'; payload: Reminder }
  | { type: 'DELETE_REMINDER'; payload: string }
  | { type: 'TOGGLE_REMINDER'; payload: string }
  | { type: 'ADD_MATCH'; payload: Match }
  | { type: 'ADD_MESSAGE'; payload: { matchId: string; message: Message } }
  | { type: 'MARK_MATCH_READ'; payload: string }
  | { type: 'LIKE_DOG'; payload: string }
  | { type: 'UNLIKE_DOG'; payload: string }
  | { type: 'DELETE_ACCOUNT' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE': {
      const saved = action.payload;
      // Migrate old state that lacks dogs[] / activeDogId
      if (!saved.dogs || saved.dogs.length === 0) {
        const dogs = saved.dog ? [saved.dog] : [];
        return { ...saved, dogs, activeDogId: saved.dog?.id ?? null };
      }
      return saved;
    }

    case 'SET_DOG': {
      const newDog = action.payload;
      const idx = state.dogs.findIndex(d => d.id === newDog.id);
      const newDogs = idx >= 0
        ? state.dogs.map((d, i) => i === idx ? newDog : d)
        : [...state.dogs, newDog];
      return { ...state, dog: newDog, dogs: newDogs, activeDogId: newDog.id };
    }

    case 'UPDATE_DOG': {
      if (!state.dog) return state;
      const updated = { ...state.dog, ...action.payload };
      const newDogs = state.dogs.map(d => d.id === updated.id ? updated : d);
      return { ...state, dog: updated, dogs: newDogs };
    }

    case 'ADD_ANOTHER_DOG': {
      const newDog = action.payload;
      return {
        ...state,
        dog: newDog,
        dogs: [...state.dogs, newDog],
        activeDogId: newDog.id,
      };
    }

    case 'SWITCH_ACTIVE_DOG': {
      const target = state.dogs.find(d => d.id === action.payload) ?? null;
      return { ...state, dog: target, activeDogId: action.payload };
    }

    case 'REMOVE_DOG': {
      const remaining = state.dogs.filter(d => d.id !== action.payload);
      const isActive = state.activeDogId === action.payload;
      const newActive = isActive ? (remaining[0] ?? null) : state.dog;
      return {
        ...state,
        dogs: remaining,
        dog: newActive,
        activeDogId: newActive?.id ?? null,
      };
    }

    case 'SET_OWNER':
      return {
        ...state,
        ownerName: action.payload.name,
        ownerCity: action.payload.city,
        ownerPhoto: action.payload.photo ?? state.ownerPhoto,
      };

    case 'COMPLETE_ONBOARDING':
      return { ...state, isOnboardingComplete: true };

    case 'ADD_HEALTH_RECORD':
      return { ...state, healthRecords: [action.payload, ...state.healthRecords] };

    case 'UPDATE_HEALTH_RECORD':
      return {
        ...state,
        healthRecords: state.healthRecords.map(r =>
          r.id === action.payload.id ? action.payload : r
        ),
      };

    case 'DELETE_HEALTH_RECORD':
      return {
        ...state,
        healthRecords: state.healthRecords.filter(r => r.id !== action.payload),
      };

    case 'ADD_REMINDER':
      return { ...state, reminders: [...state.reminders, action.payload] };

    case 'UPDATE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map(r =>
          r.id === action.payload.id ? action.payload : r
        ),
      };

    case 'DELETE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.filter(r => r.id !== action.payload),
      };

    case 'TOGGLE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map(r =>
          r.id === action.payload ? { ...r, isActive: !r.isActive } : r
        ),
      };

    case 'ADD_MATCH':
      return { ...state, matches: [action.payload, ...state.matches] };

    case 'ADD_MESSAGE':
      return {
        ...state,
        matches: state.matches.map(m =>
          m.id === action.matchId
            ? { ...m, messages: [...m.messages, action.payload.message] }
            : m
        ),
      };

    case 'MARK_MATCH_READ':
      return {
        ...state,
        matches: state.matches.map(m =>
          m.id === action.payload ? { ...m, isRead: true } : m
        ),
      };

    case 'LIKE_DOG':
      return state.likedDogIds.includes(action.payload)
        ? state
        : { ...state, likedDogIds: [...state.likedDogIds, action.payload] };

    case 'UNLIKE_DOG':
      return {
        ...state,
        likedDogIds: state.likedDogIds.filter(id => id !== action.payload),
      };

    case 'DELETE_ACCOUNT':
      return { ...initialState };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  setDog: (dog: Dog) => void;
  updateDog: (updates: Partial<Dog>) => void;
  addAnotherDog: (dog: Dog) => void;
  switchActiveDog: (dogId: string) => void;
  removeDog: (dogId: string) => void;
  setOwner: (name: string, city: string, photo?: string | null) => void;
  completeOnboarding: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  addHealthRecord: (record: HealthRecord) => void;
  updateHealthRecord: (record: HealthRecord) => void;
  deleteHealthRecord: (id: string) => void;
  addReminder: (reminder: Reminder) => void;
  updateReminder: (reminder: Reminder) => void;
  deleteReminder: (id: string) => void;
  toggleReminder: (id: string) => void;
  addMatch: (dog: Dog) => Match;
  addMessage: (matchId: string, message: Message) => void;
  markMatchRead: (matchId: string) => void;
  likeDog: (id: string) => void;
  unlikeDog: (id: string) => void;
  todaysReminders: () => Reminder[];
  unreadMatchCount: () => number;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

const DAY_MAP: Record<number, string> = {
  0: 'SUN', 1: 'MON', 2: 'TUE', 3: 'WED', 4: 'THU', 5: 'FRI', 6: 'SAT',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    storage.loadAppState().then(saved => {
      if (saved) dispatch({ type: 'HYDRATE', payload: saved });
    });
  }, []);

  useEffect(() => {
    storage.saveAppState(state);
  }, [state]);

  const setDog = useCallback((dog: Dog) =>
    dispatch({ type: 'SET_DOG', payload: dog }), []);

  const updateDog = useCallback((updates: Partial<Dog>) =>
    dispatch({ type: 'UPDATE_DOG', payload: updates }), []);

  const addAnotherDog = useCallback((dog: Dog) =>
    dispatch({ type: 'ADD_ANOTHER_DOG', payload: dog }), []);

  const switchActiveDog = useCallback((dogId: string) =>
    dispatch({ type: 'SWITCH_ACTIVE_DOG', payload: dogId }), []);

  const removeDog = useCallback((dogId: string) =>
    dispatch({ type: 'REMOVE_DOG', payload: dogId }), []);

  const setOwner = useCallback((name: string, city: string, photo?: string | null) =>
    dispatch({ type: 'SET_OWNER', payload: { name, city, photo } }), []);

  const completeOnboarding = useCallback(async () => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });
    const starterMatches = MOCK_DOGS.slice(0, 3).map(dog => ({
      id: `match_${dog.id}_${Date.now()}`,
      dog,
      matchedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg_${dog.id}_1`,
          senderId: dog.id,
          text: `היי! ראיתי את הכלב שלך — נראה מדהים! 🐾 אולי ניפגש בפארק?`,
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        },
      ],
      isRead: false,
    }));
    starterMatches.forEach(m => dispatch({ type: 'ADD_MATCH', payload: m }));
  }, []);

  const deleteAccount = useCallback(async () => {
    await storage.clearAll();
    dispatch({ type: 'DELETE_ACCOUNT' });
  }, []);

  const addHealthRecord = useCallback((record: HealthRecord) =>
    dispatch({ type: 'ADD_HEALTH_RECORD', payload: record }), []);

  const updateHealthRecord = useCallback((record: HealthRecord) =>
    dispatch({ type: 'UPDATE_HEALTH_RECORD', payload: record }), []);

  const deleteHealthRecord = useCallback((id: string) =>
    dispatch({ type: 'DELETE_HEALTH_RECORD', payload: id }), []);

  const addReminder = useCallback((reminder: Reminder) =>
    dispatch({ type: 'ADD_REMINDER', payload: reminder }), []);

  const updateReminder = useCallback((reminder: Reminder) =>
    dispatch({ type: 'UPDATE_REMINDER', payload: reminder }), []);

  const deleteReminder = useCallback((id: string) =>
    dispatch({ type: 'DELETE_REMINDER', payload: id }), []);

  const toggleReminder = useCallback((id: string) =>
    dispatch({ type: 'TOGGLE_REMINDER', payload: id }), []);

  const addMatch = useCallback((dog: Dog): Match => {
    const match: Match = {
      id: `match_${dog.id}_${Date.now()}`,
      dog,
      matchedAt: new Date().toISOString(),
      messages: [],
      isRead: false,
    };
    dispatch({ type: 'ADD_MATCH', payload: match });
    return match;
  }, []);

  const addMessage = useCallback((matchId: string, message: Message) =>
    dispatch({ type: 'ADD_MESSAGE', payload: { matchId, message } }), []);

  const markMatchRead = useCallback((matchId: string) =>
    dispatch({ type: 'MARK_MATCH_READ', payload: matchId }), []);

  const likeDog = useCallback((id: string) =>
    dispatch({ type: 'LIKE_DOG', payload: id }), []);

  const unlikeDog = useCallback((id: string) =>
    dispatch({ type: 'UNLIKE_DOG', payload: id }), []);

  const todaysReminders = useCallback((): Reminder[] => {
    const today = DAY_MAP[new Date().getDay()];
    return state.reminders.filter(r => r.isActive && r.days.includes(today));
  }, [state.reminders]);

  const unreadMatchCount = useCallback((): number =>
    state.matches.filter(m => !m.isRead).length, [state.matches]);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        setDog,
        updateDog,
        addAnotherDog,
        switchActiveDog,
        removeDog,
        setOwner,
        completeOnboarding,
        deleteAccount,
        addHealthRecord,
        updateHealthRecord,
        deleteHealthRecord,
        addReminder,
        updateReminder,
        deleteReminder,
        toggleReminder,
        addMatch,
        addMessage,
        markMatchRead,
        likeDog,
        unlikeDog,
        todaysReminders,
        unreadMatchCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
