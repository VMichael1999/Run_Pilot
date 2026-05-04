import React from 'react';
import { StyleSheet, TextInput, type TextInputProps, type StyleProp, type TextStyle } from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';

interface AppTextInputProps extends TextInputProps {
  inputStyle?: StyleProp<TextStyle>;
}

export function AppTextInput({ inputStyle, placeholderTextColor, ...props }: AppTextInputProps) {
  const theme = useAppTheme();

  return (
    <TextInput
      placeholderTextColor={placeholderTextColor ?? theme.textDisabled}
      style={[styles.input, { backgroundColor: theme.surfaceMuted, color: theme.text }, inputStyle]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
  },
});
