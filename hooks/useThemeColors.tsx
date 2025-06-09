// hooks/useThemeColors.ts
import { useContext } from 'react';
import { SettingsContext } from '@/context/SettingsContext';

export const useThemeColors = () => {
  const { isHighContrast } = useContext(SettingsContext);

  return {
    background: isHighContrast ? '#ffffff' : '#25292e',
    text: isHighContrast ? '#000000' : '#ffffff',
    accent: isHighContrast ? '#000000' : '#126A91',
    switchTrack: isHighContrast ? '#ddd' : '#666',
    switchTrackActive: isHighContrast ? '#333' : '#cce6f4',
    switchThumb: isHighContrast ? '#000' : '#ccc',
    switchThumbActive: isHighContrast ? '#fff' : '#fff',
    iconInactive: isHighContrast ? '#999' : '#fff',
    headerBackground: isHighContrast ? '#f5f5f5' : '#25292e',
    tabBarBackground: isHighContrast ? '#f5f5f5' : '#25292e',
    inputBackground: isHighContrast ? '#ffffff' : '#ffffff',
    inputBorder: isHighContrast ? '#000000' : '#000000',
  };
};
