import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@store/useAuthStore';
import type { LoginVerificacionProps } from '@navigation/types';
import { formatTelefono } from '@shared/utils/format';
import { OTPAnimatedField, type OTPStatus } from '@shared/components/ui';
import { useAppTheme } from '@theme/useAppTheme';
import { Weight, Type } from '@theme/fonts';
import { BorderRadius, Hit, HitSlop, Spacing } from '@theme/spacing';

const RESEND_SECONDS = 30;
const LARGO = 4;

const teclas = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'blank', '0', 'back'] as const;

export function LoginVerificacionScreen({ route, navigation }: LoginVerificacionProps) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { phone, countryCode } = route.params;
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  const [code, setCode] = React.useState('');
  const [status, setStatus] = React.useState<OTPStatus>('idle');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [resendSeconds, setResendSeconds] = React.useState(RESEND_SECONDS);

  React.useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSeconds]);

  React.useEffect(() => {
    if (code.length === LARGO) {
      void submitCode();
    }
  }, [code]);

  // Error: feedback háptico si ocurre un fallo
  React.useEffect(() => {
    if (!error) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [error]);

  const submitCode = async () => {
    if (code.length !== LARGO || isLoading) return;
    setIsLoading(true);
    setStatus('verifying');
    setError('');

    try {
      if (code === '0000') {
        // 1. Fase de Verificación Orbital (mínimo 1.6s)
        await new Promise((resolve) => setTimeout(resolve, 1600));

        // 2. Transición a error (las casillas vuelven a la fila, sacuden y enrojecen)
        setStatus('error');
        setError('Código incorrecto. Revisa el SMS e inténtalo de nuevo.');

        // 3. Pausa para completar la vuelta a la fila y la sacudida antes de resetear
        await new Promise((resolve) => setTimeout(resolve, 1300));
        setCode('');
        setStatus('idle');
        return;
      }

      // 1. Fase de Verificación Orbital:
      // Las casillas vuelan hacia la circunferencia y rotan en órbita continua
      await new Promise((resolve) => setTimeout(resolve, 1600));

      // 2. Fase de Éxito:
      // Las casillas colapsan al centro, surge el badge elástico y se dibuja el checkmark (1.0s)
      setStatus('success');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // 3. Pausa contemplativa con el checkmark completado antes de entrar al mapa
      await new Promise((resolve) => setTimeout(resolve, 1300));
      setAuthenticated('mock-token');
    } catch {
      setStatus('error');
      setError('Código incorrecto. Revisa el SMS e inténtalo de nuevo.');
      await new Promise((resolve) => setTimeout(resolve, 1300));
      setCode('');
      setStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDigitPress = (digit: string) => {
    if (isLoading || status === 'verifying' || status === 'success' || code.length >= LARGO) return;
    if (error) {
      setError('');
      setStatus('idle');
    }
    setCode(`${code}${digit}`);
  };

  const handleBackspace = () => {
    if (isLoading || status === 'verifying' || status === 'success' || code.length === 0) return;
    if (error) {
      setError('');
      setStatus('idle');
    }
    setCode(code.slice(0, -1));
  };

  const handleResend = () => {
    if (resendSeconds > 0) return;
    setResendSeconds(RESEND_SECONDS);
    setCode('');
    setError('');
    setStatus('idle');
  };

  const telefono = formatTelefono(phone, countryCode);
  const mmss = `0:${String(resendSeconds).padStart(2, '0')}`;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top + Spacing.sm, paddingBottom: insets.bottom + 22 },
      ]}
    >
      <View style={styles.top}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Volver y cambiar el número"
          onPress={() => navigation.goBack()}
          hitSlop={HitSlop}
          style={[styles.back, { borderColor: theme.divider }]}
        >
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.textBlock}>
          <Text accessibilityRole="header" style={[Type.title, { color: theme.text }]}>
            Escribe el código que enviamos al {telefono}
          </Text>
          <Text style={[Type.detail, { color: theme.textMuted }]}>Llega por SMS en unos segundos.</Text>
        </View>

        <OTPAnimatedField
          length={LARGO}
          code={code}
          status={status}
          hasError={!!error}
          accessibilityLabel={`Código de verificación, ${code.length} de ${LARGO} dígitos`}
        />

        <View style={styles.feedback}>
          {error ? (
            <Text accessibilityLiveRegion="assertive" style={[Type.detail, { color: theme.danger }]}>{error}</Text>
          ) : resendSeconds > 0 ? (
            // Fila aparte para dar ancho fijo al contador (sin cifras tabulares)
            <View style={styles.timerRow} accessible accessibilityLabel={`Reenviar código en ${resendSeconds} segundos`}>
              <Text style={[Type.detail, { color: theme.textMuted }]}>Reenviar código en </Text>
              <Text style={[Type.detail, styles.timer, { color: theme.text }]}>{mmss}</Text>
            </View>
          ) : (
            <TouchableOpacity accessibilityRole="button" onPress={handleResend} style={styles.resendBtn}>
              <Text style={[styles.resend, { color: theme.text }]}>Reenviar código</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.keypad}>
        {teclas.map((key) => {
          if (key === 'blank') return <View key={key} style={styles.key} />;
          if (key === 'back') {
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel="Borrar"
                onPress={handleBackspace}
                disabled={isLoading}
                style={({ pressed }) => [styles.key, styles.keyCenter, pressed && { backgroundColor: theme.divider }]}
              >
                <Ionicons name="backspace-outline" size={24} color={theme.text} />
              </Pressable>
            );
          }
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={key}
              onPress={() => handleDigitPress(key)}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.key,
                styles.keyCenter,
                { backgroundColor: pressed ? theme.divider : theme.surface },
              ]}
            >
              <Text style={[styles.keyText, { color: theme.text }]}>{key}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, justifyContent: 'space-between' },
  top: { gap: 18 },
  back: {
    width: Hit.control,
    height: Hit.control,
    borderRadius: BorderRadius.control,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { gap: 6 },
  feedback: { minHeight: Hit.min, justifyContent: 'center' },
  timerRow: { flexDirection: 'row', alignItems: 'baseline' },
  timer: { fontWeight: Weight.semibold, minWidth: 34 },
  resendBtn: { minHeight: Hit.min, justifyContent: 'center', alignSelf: 'flex-start' },
  resend: { ...Type.label, textDecorationLine: 'underline' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  key: { width: '31.5%', flexGrow: 1, height: 54, borderRadius: BorderRadius.control },
  keyCenter: { alignItems: 'center', justifyContent: 'center' },
  keyText: { ...Type.key },
});
