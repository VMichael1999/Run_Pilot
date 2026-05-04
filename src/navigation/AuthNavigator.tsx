import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types';
import { LoginScreen } from '@features/auth/LoginScreen';
import { LoginVerificacionScreen } from '@features/auth/LoginVerificacionScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="LoginVerificacion" component={LoginVerificacionScreen} />
    </Stack.Navigator>
  );
}
