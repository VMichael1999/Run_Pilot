import React, { useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@navigation/types';
import { useAuthStore } from '@store/useAuthStore';
import { AppButton } from '@shared/components/ui';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, Type } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const COUNTRY_CODE = '+51';
const LARGO = 9;

/** "987654321" -> "987 654 321" mientras se escribe. */
const agrupar = (d: string) => d.replace(/(\d{3})(?=\d)/g, '$1 ');

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const setPhone = useAuthStore((state) => state.setPhone);
  const inputRef = useRef<TextInput>(null);

  const [phone, setPhoneLocal] = useState('');
  const [focused, setFocused] = useState(false);

  // Celulares peruanos: 9 digitos y empiezan con 9
  const valido = phone.length === LARGO && phone.startsWith('9');
  const error = phone.length > 0 && !phone.startsWith('9')
    ? 'Los celulares en Perú empiezan con 9.'
    : '';

  const handleSubmit = () => {
    if (!valido) return;
    setPhone(phone, COUNTRY_CODE);
    navigation.navigate('LoginVerificacion', { phone, countryCode: COUNTRY_CODE });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 26, paddingBottom: insets.bottom + Spacing['2xl'] },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.logo}
            accessibilityRole="image"
            accessibilityLabel="Run Pilot"
          />
          <Text accessibilityRole="header" style={[Type.display, styles.title, { color: theme.text }]}>
            Ingresa con tu número de celular.
          </Text>
          <Text style={[Type.body, styles.lead, { color: theme.textMuted }]}>
            Te enviaremos un código de 4 dígitos por SMS.
          </Text>
        </View>

        <View style={styles.form}>
          <Pressable style={styles.phoneRow} onPress={() => inputRef.current?.focus()} accessible={false}>
            <View style={[styles.field, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
              <Text style={[styles.fieldText, { color: theme.text }]}>{COUNTRY_CODE}</Text>
            </View>
            <View
              style={[
                styles.field,
                styles.flex,
                {
                  backgroundColor: theme.surface,
                  borderColor: error ? theme.danger : focused ? theme.text : theme.divider,
                },
              ]}
            >
              <TextInput
                ref={inputRef}
                accessibilityLabel="Número de celular"
                accessibilityHint="9 dígitos, sin el +51"
                style={[styles.fieldText, styles.input, { color: theme.text }]}
                value={agrupar(phone)}
                onChangeText={(t) => setPhoneLocal(t.replace(/\D/g, '').slice(0, LARGO))}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoComplete="tel"
                maxLength={LARGO + 2}
                placeholder="987 654 321"
                placeholderTextColor={theme.textMuted}
                returnKeyType="send"
                onSubmitEditing={handleSubmit}
                autoFocus
              />
            </View>
          </Pressable>
          {error ? (
            <Text accessibilityLiveRegion="polite" style={[Type.detail, { color: theme.danger }]}>{error}</Text>
          ) : null}
          <AppButton label="Enviar código" onPress={handleSubmit} disabled={!valido} />
        </View>

        <Text style={[Type.caption, styles.legal, { color: theme.textMuted }]}>
          Al continuar aceptas los <Text style={[styles.link, { color: theme.text }]}>Términos</Text> y la{' '}
          <Text style={[styles.link, { color: theme.text }]}>Política de privacidad</Text>.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 22, justifyContent: 'space-between', gap: 18 },
  logo: { width: 52, height: 52, borderRadius: 12 },
  title: { marginTop: Spacing['4xl'] },
  lead: { marginTop: Spacing.sm + 2 },
  form: { gap: 14 },
  phoneRow: { flexDirection: 'row', gap: Spacing.sm },
  field: {
    minHeight: 58,
    borderWidth: 1.5,
    borderRadius: BorderRadius.control,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  fieldText: { ...Type.field },
  input: { letterSpacing: 0.4, paddingVertical: Spacing.md },
  legal: { textAlign: 'center' },
  link: { textDecorationLine: 'underline' },
});
