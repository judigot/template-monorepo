import { useColorScheme } from 'react-native';

export function useSystemScheme(): 'dark' | 'light' {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}
