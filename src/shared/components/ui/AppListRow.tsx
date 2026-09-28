import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { Type } from '@theme/fonts';
import { Hit, Spacing } from '@theme/spacing';

interface AppListRowProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  showDivider?: boolean;
  accessibilityLabel?: string;
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
  accessibilityLabel,
  style,
  titleStyle,
  subtitleStyle,
  contentStyle,
}: AppListRowProps) {
  const theme = useAppTheme();

  const body = (
    <>
      {left ? <View style={styles.side}>{left}</View> : null}
      <View style={[styles.content, contentStyle]}>
        <Text style={[Type.label, { color: theme.text }, titleStyle]}>{title}</Text>
        {subtitle ? (
          <Text style={[Type.caption, styles.subtitle, { color: theme.textMuted }, subtitleStyle]}>{subtitle}</Text>
        ) : null}
      </View>
      {right ? <View style={styles.side}>{right}</View> : null}
    </>
  );

  const rowStyle = [
    styles.row,
    showDivider && { borderBottomWidth: 1, borderBottomColor: theme.divider },
    style,
  ];

  if (!onPress) return <View style={rowStyle}>{body}</View>;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (subtitle ? `${title}, ${subtitle}` : title)}
      style={rowStyle}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {body}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: Hit.min,
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
  subtitle: {
    marginTop: Spacing.xxs,
  },
});
