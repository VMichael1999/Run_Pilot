import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing } from '@theme/spacing';

interface AppListRowProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  showDivider?: boolean;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export function AppListRow({
  title,
  subtitle,
  left,
  right,
  onPress,
  showDivider = false,
  style,
  titleStyle,
  subtitleStyle,
  contentStyle,
}: AppListRowProps) {
  const theme = useAppTheme();
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.row, showDivider && { borderBottomWidth: 1, borderBottomColor: theme.divider }, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {left ? <View style={styles.side}>{left}</View> : null}
      <View style={[styles.content, contentStyle]}>
        <Text style={[styles.title, { color: theme.text }, titleStyle]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.textMuted }, subtitleStyle]}>{subtitle}</Text>
        ) : null}
      </View>
      {right ? <View style={styles.side}>{right}</View> : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  side: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
});
