import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@store/useAuthStore';
import type { LoginVerificacionProps } from '@navigation/types';
import { formatTelefono } from '@shared/utils/format';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, Type } from '@theme/fonts';
import { BorderRadius, Hit, HitSlop, Spacing } from '@theme/spacing';

const RESEND_SECONDS = 30;
const LARGO = 4;

const teclas = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'blank', '0', 'back'] as const;

/** Cursor que parpadea en la casilla activa (sin parpadeo con movimiento reducido). */
function Cursor({ color }: { color: string }) {
  const reduced = useReducedMotion();
  const o = useSharedValue(1);
  React.useEffect(() => {
    if (reduced) return;
    o.value = withRepeat(withSequence(withTiming(1, { duration: 500 }), withTiming(0, { duration: 0 }), withTiming(0, { duration: 500 })), -1);
  }, [reduced, o]);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[styles.cursor, { backgroundColor: color }, style]} />;
}

export function LoginVerificacionScreen({ route, navigation }: LoginVerificacionProps) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { phone, countryCode } = route.params;
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  const [code, setCode] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [resendSeconds, setResendSeconds] = React.useState(RESEND_SECONDS);
  const shake = useSharedValue(0);

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

  // Error: la fila tiembla y el telefono vibra
  React.useEffect(() => {
    if (!error) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    shake.value = withSequence(
      withTiming(10, { duration: 60 }),
      withTiming(-10, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(-8, { duration: 60 }),
      withTiming(0, { duration: 60 }),
    );
  }, [error]);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const submitCode = async () => {
    if (code.length !== LARGO || isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      // TODO: Llamar al servicio de verificacion
      setAuthenticated('mock-token');
    } catch {
      setError('Código incorrecto. Revisa el SMS e inténtalo de nuevo.');
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDigitPress = (digit: string) => {
    if (isLoading || code.length >= LARGO) return;
    if (error) setError('');
    setCode(`${code}${digit}`);
  };

  const handleBackspace = () => {
    if (isLoading || code.length === 0) return;
    setCode(code.slice(0, -1));
  };

  const handleResend = () => {
    if (resendSeconds > 0) return;
    setResendSeconds(RESEND_SECONDS);
    setCode('');
    setError('');
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

        <Animated.View
          style={[styles.otpRow, shakeStyle]}
          accessible
          accessibilityLabel={`Código de verificación, ${code.length} de ${LARGO} dígitos`}
        >
          {Array.from({ length: LARGO }).map((_, index) => {
            const digit = code[index];
            const activa = index === code.length && !isLoading;
            return (
              <View
                key={index}
                style={[
                  styles.otpBox,
                  {
                    backgroundColor: theme.surface,
                    borderColor: error ? theme.danger : activa ? theme.text : theme.divider,
                  },
                ]}
              >
                {digit ? (
                  <Text style={[styles.otpDigit, { color: theme.text }]}>{digit}</Text>
                ) : activa ? (
                  <Cursor color={theme.text} />
                ) : null}
              </View>
            );
          })}
        </Animated.View>

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
  otpRow: { flexDirection: 'row', gap: Spacing.sm + 2 },
  otpBox: {
    flex: 1,
    height: 64,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpDigit: { fontFamily: FontFamily.semibold, fontSize: 28 },
  cursor: { width: 2, height: 28, borderRadius: 1 },
  feedback: { minHeight: Hit.min, justifyContent: 'center' },
  timerRow: { flexDirection: 'row', alignItems: 'baseline' },
  timer: { fontFamily: FontFamily.semibold, minWidth: 34 },
  resendBtn: { minHeight: Hit.min, justifyContent: 'center', alignSelf: 'flex-start' },
  resend: { fontFamily: FontFamily.semibold, fontSize: 14, textDecorationLine: 'underline' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  key: { width: '31.5%', flexGrow: 1, height: 54, borderRadius: BorderRadius.control },
  keyCenter: { alignItems: 'center', justifyContent: 'center' },
  keyText: { fontFamily: FontFamily.medium, fontSize: 22 },
});
