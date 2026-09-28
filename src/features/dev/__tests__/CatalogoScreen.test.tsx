import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { CatalogoScreen } from '../CatalogoScreen';

jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ goBack: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-haptics', () => ({ notificationAsync: jest.fn(), selectionAsync: jest.fn(), NotificationFeedbackType: {} }));
jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));

it('el catalogo renderiza todos los componentes sin romperse', () => {
  render(<CatalogoScreen />);
  expect(screen.getByText('Botones')).toBeTruthy();
  expect(screen.getByText('Cargando (skeleton)')).toBeTruthy();
  expect(screen.getByText('Tipografía (General Sans)')).toBeTruthy();
  expect(screen.getByText('BKL-482')).toBeTruthy();
});
