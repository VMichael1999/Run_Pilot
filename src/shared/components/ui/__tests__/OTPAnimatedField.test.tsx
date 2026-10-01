import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { OTPAnimatedField } from '../OTPAnimatedField';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name, testID }: { name: string; testID?: string }) => null,
}));

describe('OTPAnimatedField', () => {
  it('renderiza la etiqueta de accesibilidad con el progreso del código', () => {
    render(<OTPAnimatedField length={4} code="12" status="idle" />);
    expect(screen.getByLabelText('Código de verificación, 2 de 4 dígitos')).toBeTruthy();
  });

  it('muestra los dígitos ingresados en pantalla', () => {
    render(<OTPAnimatedField length={4} code="481" status="idle" />);
    expect(screen.getByText('4')).toBeTruthy();
    expect(screen.getByText('8')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.queryByText('2')).toBeNull();
  });

  it('permite una longitud personalizada (ej. 6 dígitos)', () => {
    render(<OTPAnimatedField length={6} code="123456" status="idle" />);
    expect(screen.getByLabelText('Código de verificación, 6 de 6 dígitos')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText('6')).toBeTruthy();
  });

  it('se renderiza sin errores en estado verifying (cargando orbital)', () => {
    const { toJSON } = render(<OTPAnimatedField length={4} code="1234" status="verifying" />);
    expect(toJSON()).toBeTruthy();
  });

  it('se renderiza sin errores en estado success', () => {
    const { toJSON } = render(<OTPAnimatedField length={4} code="1234" status="success" />);
    expect(toJSON()).toBeTruthy();
  });

  it('se renderiza sin errores en estado error', () => {
    const { toJSON } = render(<OTPAnimatedField length={4} code="1234" status="error" hasError={true} />);
    expect(toJSON()).toBeTruthy();
  });
});
