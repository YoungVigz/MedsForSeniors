import { Text, TextProps, StyleProp, TextStyle } from 'react-native';
import { useFontSize } from '@/hooks/useFontSize';

interface AppTextProps extends TextProps {
  baseSize?: number;
  style?: StyleProp<TextStyle>;
}

export const AppText: React.FC<AppTextProps> = ({ baseSize = 16, style, ...props }) => {
  const fontSize = useFontSize(baseSize);

  return (
    <Text {...props} style={[{ fontSize }, style]} />
  );
};