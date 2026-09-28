import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '@theme/useAppTheme';
import { Type } from '@theme/fonts';
import { BorderRadius, Hit, HitSlop, Spacing } from '@theme/spacing';

interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
}

export function AppHeader({ title, onBack, right, style, titleStyle, buttonStyle }: AppHeaderProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigation.goBack();
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, backgroundColor: theme.background }, style]}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Volver"
        onPress={handleBack}
        style={[styles.iconButton, { borderColor: theme.divider }, buttonStyle]}
        activeOpacity={0.85}
        hitSlop={HitSlop}
      >
        <Ionicons name="arrow-back" size={22} color={theme.text} />
      </TouchableOpacity>
      <Text accessibilityRole="header" style={[Type.title, styles.title, { color: theme.text }, titleStyle]}>
        {title}
      </Text>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg + 2,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  iconButton: {
    width: Hit.control,
    height: Hit.control,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
  },
  right: {
    minWidth: Hit.control,
    alignItems: 'flex-end',
  },
});
