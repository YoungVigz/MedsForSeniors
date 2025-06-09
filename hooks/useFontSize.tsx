import { useContext } from 'react';
import { SettingsContext } from '@/context/SettingsContext';

export const useFontSize = (baseSize: number = 16): number => {
  const { fontSizeLevel } = useContext(SettingsContext);
  return baseSize + fontSizeLevel * 4;
};
