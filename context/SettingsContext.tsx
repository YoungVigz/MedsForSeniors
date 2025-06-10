// SettingsContext.tsx
import React, { createContext, ReactNode, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsContextType {
  isSeniorMode: boolean;
  setIsSeniorMode: (val: boolean) => void;
}

// Domyślne wartości zostaną nadpisane w Providerze
export const SettingsContext = createContext<SettingsContextType>({
  isSeniorMode: false,
  setIsSeniorMode: () => {},
});

interface ProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<ProviderProps> = ({ children }) => {
  const [isSeniorMode, setIsSeniorModeState] = useState<boolean>(false);

  // 1.1. Po zamontowaniu: wczytujemy z AsyncStorage, czy jest Senior Mode
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('isSeniorMode');
        if (stored !== null) {
          setIsSeniorModeState(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('Błąd przy wczytywaniu isSeniorMode', e);
      }
    })();
  }, []);

  // 1.2. Gdy zmieni się isSeniorMode, zapisujemy do AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem('isSeniorMode', JSON.stringify(isSeniorMode));
      } catch (e) {
        console.warn('Błąd przy zapisie isSeniorMode', e);
      }
    })();
  }, [isSeniorMode]);

  // 1.3. Setter, który zmienia stan lokalny (zapis do Storage obsługuje efekt wyżej)
  const setIsSeniorMode = (val: boolean) => {
    setIsSeniorModeState(val);
  };

  return (
    <SettingsContext.Provider value={{ isSeniorMode, setIsSeniorMode }}>
      {children}
    </SettingsContext.Provider>
  );
};
