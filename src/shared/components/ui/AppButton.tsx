import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { Type } from '@theme/fonts';
import { BorderRadius, Hit, Spacing } from '@theme/spacing';

type Variant = 'primary' | 'signal' | 'ghost';
type Size = 'lg' | 'md';

interface AppButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** primary: tinta de dia / lima de noche. signal: lima siempre. ghost: borde. */
  variant?: Variant;
  /** lg: 56 dp (acciones principales). md: 48 dp. */
  size?: Size;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export function AppButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'lg',
  icon,
  accessibilityLabel,
  accessibilityHint,
  style,
  labelStyle,
}: AppButtonProps) {
  const theme = useAppTheme();
  const inactive = disabled || loading;

  const bg =
    variant === 'primary' ? theme.primary :
    variant === 'signal'  ? theme.signal  : 'transparent';
  const fg =
    variant === 'primary' ? theme.onPrimary :
    variant === 'signal'  ? theme.onSignal  : theme.text;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={[
        styles.button,
        size === 'lg' ? styles.lg : styles.md,
        { backgroundColor: bg },
        variant === 'ghost' && { borderWidth: 1.5, borderColor: theme.divider },
        inactive && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text
            style={[size === 'lg' ? Type.action : Type.bodyStrong, { color: fg }, labelStyle]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  lg: {
    minHeight: Hit.action,
    borderRadius: BorderRadius.lg,
  },
  md: {
    minHeight: Hit.min,
    borderRadius: BorderRadius.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  disabled: {
    opacity: 0.4,
  },
});
