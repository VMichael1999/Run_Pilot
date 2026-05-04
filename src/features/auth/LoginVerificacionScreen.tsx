import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@store/useAuthStore';
import type { LoginVerificacionProps } from '@navigation/types';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';

const RESEND_SECONDS = 30;

const keypadRows = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['back', '0', 'empty'],
] as const;

export function LoginVerificacionScreen({ route, navigation }: LoginVerificacionProps) {
  const insets = useSafeAreaInsets();
  const { phone, countryCode } = route.params;
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  const [code, setCode] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [resendSeconds, setResendSeconds] = React.useState(RESEND_SECONDS);
  const shakeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSeconds]);

  React.useEffect(() => {
    if (code.length === 4) {
      void submitCode();
    }
  }, [code]);

  React.useEffect(() => {
    if (!error) return;
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [error]);

  const submitCode = async () => {
    if (code.length !== 4 || isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      // TODO: Llamar al servicio de verificacion
      setAuthenticated('mock-token');
    } catch {
      setError('Codigo incorrecto. Intenta de nuevo.');
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDigitPress = (digit: string) => {
    if (isLoading || code.length >= 4) return;
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

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.title}>Verificacion</Text>
        <Text style={styles.subtitle}>
          Ingresa el codigo enviado a{' '}
          <Text style={styles.phone}>{countryCode} {phone}</Text>
        </Text>
      </View>

      <Animated.View style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}>
        {[0, 1, 2, 3].map((index) => {
          const digit = code[index];
          const isActive = index === code.length && !isLoading;
          const hasError = !!error;
          return (
            <View
              key={index}
              style={[
                styles.otpBox,
                digit && styles.otpBoxFilled,
                isActive && styles.otpBoxActive,
                hasError && styles.otpBoxError,
              ]}
            >
              {digit ? (
                <View style={styles.otpDot} />
              ) : isActive ? (
                <View style={styles.otpCursor} />
              ) : null}
            </View>
          );
        })}
      </Animated.View>

      <View style={styles.feedbackRow}>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <TouchableOpacity onPress={handleResend} disabled={resendSeconds > 0} activeOpacity={0.7}>
            <Text style={[styles.resend, resendSeconds > 0 && styles.resendDisabled]}>
              {resendSeconds > 0
                ? `Reenviar codigo en ${resendSeconds}s`
                : 'No lo recibiste? Reenviar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.keypad}>
        {keypadRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key) => {
              if (key === 'empty') {
                return <View key={key} style={styles.keypadSpacer} />;
              }
              if (key === 'back') {
                return (
                  <TouchableOpacity key={key} style={styles.keyBtn} onPress={handleBackspace} activeOpacity={0.6}>
                    <Ionicons name="backspace-outline" size={24} color={Colors.textPrimary} />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.keyBtn, styles.digitBtn]}
                  onPress={() => handleDigitPress(key)}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <Text style={styles.digitText}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.verifyBtn, (code.length !== 4 || isLoading) && styles.verifyBtnDisabled]}
        onPress={submitCode}
        activeOpacity={0.85}
        disabled={code.length !== 4 || isLoading}
      >
        <Text style={styles.verifyBtnText}>{isLoading ? 'Verificando...' : 'Verificar'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 28,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  textBlock: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  phone: {
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 16,
  },
  otpBox: {
    width: 60,
    height: 68,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  otpBoxActive: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: '#f0f4ff',
  },
  otpBoxError: {
    borderColor: Colors.error,
    backgroundColor: '#fff5f5',
  },
  otpDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary,
  },
  otpCursor: {
    width: 2,
    height: 28,
    borderRadius: 1,
    backgroundColor: Colors.primary,
    opacity: 0.7,
  },
  feedbackRow: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  error: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.error,
    textAlign: 'center',
  },
  resend: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  resendDisabled: {
    color: Colors.textSecondary,
    textDecorationLine: 'none',
  },
  keypad: {
    gap: 10,
    marginBottom: 20,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  keyBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitBtn: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  keypadSpacer: {
    width: 72,
    height: 72,
  },
  digitText: {
    fontSize: 26,
    fontFamily: FontFamily.bold,
    color: Colors.textPrimary,
  },
  verifyBtn: {
    minHeight: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  verifyBtnDisabled: {
    opacity: 0.4,
  },
  verifyBtnText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
    letterSpacing: 0.5,
  },
});
