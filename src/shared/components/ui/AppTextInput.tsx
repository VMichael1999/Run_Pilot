import React from 'react';
import { StyleSheet, TextInput, type TextInputProps, type StyleProp, type TextStyle } from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { Type } from '@theme/fonts';
import { BorderRadius, Hit, Spacing } from '@theme/spacing';

interface AppTextInputProps extends TextInputProps {
  inputStyle?: StyleProp<TextStyle>;
}

export function AppTextInput({ inputStyle, placeholderTextColor, ...props }: AppTextInputProps) {
  const theme = useAppTheme();

  return (
    <TextInput
      placeholderTextColor={placeholderTextColor ?? theme.textMuted}
      style={[
        styles.input,
        { backgroundColor: theme.surface, borderColor: theme.divider, color: theme.text },
        inputStyle,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    ...Type.body,
    minHeight: Hit.action,
    borderWidth: 1.5,
    borderRadius: BorderRadius.control,
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.md,
  },
});
