import React from 'react';
import { Platform } from 'react-native';
import { render } from '@testing-library/react-native';
import { RoutePolyline } from '../RoutePolyline';
import { useMapStyle } from '../mapStyle';
import { useThemeStore } from '@store/useThemeStore';

const mockPolyline = jest.fn();
jest.mock('react-native-maps', () => ({
  Polyline: (props: object) => {
    mockPolyline(props);
    return null;
  },
}));
jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));

const ruta = [
  { latitude: -12.08, longitude: -77.0 },
  { latitude: -12.1, longitude: -76.97 },
];

beforeEach(() => mockPolyline.mockClear());

describe('RoutePolyline', () => {
  it('dia: borde blanco y ruta negra; en iOS el color va tambien en strokeColors (react-native-maps#5253)', () => {
    useThemeStore.setState({ preference: 'light' });
    Platform.OS = 'ios';
    render(<RoutePolyline coordinates={ruta} />);
    const [borde, linea] = mockPolyline.mock.calls.map((c) => c[0]);
    expect(borde).toMatchObject({ strokeColor: '#FFFFFF', strokeColors: ['#FFFFFF'], strokeWidth: 9 });
    expect(linea).toMatchObject({ strokeColor: '#000000', strokeColors: ['#000000'], strokeWidth: 5 });
  });

  it('noche: ruta verde con borde negro', () => {
    useThemeStore.setState({ preference: 'dark' });
    render(<RoutePolyline coordinates={ruta} />);
    const [borde, linea] = mockPolyline.mock.calls.map((c) => c[0]);
    expect(borde.strokeColor).toBe('#000000');
    expect(linea.strokeColor).toBe('#3DCB7E');
  });

  it('Android no recibe strokeColors: alli strokeColor funciona y la prop no existe', () => {
    useThemeStore.setState({ preference: 'light' });
    Platform.OS = 'android';
    render(<RoutePolyline coordinates={ruta} />);
    expect(mockPolyline.mock.calls[1][0].strokeColors).toBeUndefined();
    Platform.OS = 'ios';
  });

  it('sin ruta no dibuja nada', () => {
    render(<RoutePolyline coordinates={[ruta[0]]} />);
    expect(mockPolyline).not.toHaveBeenCalled();
  });
});

describe('useMapStyle', () => {
  function Probe({ onStyle }: { onStyle: (s: unknown[]) => void }) {
    onStyle(useMapStyle());
    return null;
  }

  it('claro = Google por defecto; oscuro = estilo noche', () => {
    let estilo: unknown[] = [];
    useThemeStore.setState({ preference: 'light' });
    render(<Probe onStyle={(s) => { estilo = s; }} />);
    expect(estilo).toEqual([]);
    useThemeStore.setState({ preference: 'dark' });
    render(<Probe onStyle={(s) => { estilo = s; }} />);
    expect(estilo.length).toBeGreaterThan(10);
  });
});
