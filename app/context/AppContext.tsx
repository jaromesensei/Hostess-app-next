import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Personality } from '../data/mockDogs';

export interface UserDog {
  name: string;
  breed: string;
  age: string;
  gender: 'Male' | 'Female';
  personality: Personality[];
}

interface AppContextType {
  isOnboarded: boolean;
  userDog: UserDog;
  setUserDog: (dog: UserDog) => void;
  completeOnboarding: () => void;
}

const defaultDog: UserDog = {
  name: '',
  breed: '',
  age: '',
  gender: 'Male',
  personality: [],
};

const AppContext = createContext<AppContextType>({
  isOnboarded: false,
  userDog: defaultDog,
  setUserDog: () => {},
  completeOnboarding: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userDog, setUserDog] = useState<UserDog>(defaultDog);

  const completeOnboarding = () => setIsOnboarded(true);

  return (
    <AppContext.Provider value={{ isOnboarded, userDog, setUserDog, completeOnboarding }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
