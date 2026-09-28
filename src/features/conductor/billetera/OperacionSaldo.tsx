import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AmountField, AppButton, AppHeader, AppSectionTitle, OptionRow, Segmented } from '@shared/components/ui';
import { formatSoles } from '@shared/utils/format';
import { useAppTheme } from '@theme/useAppTheme';
import { Type } from '@theme/fonts';
import { Spacing } from '@theme/spacing';
import { Duration } from '@theme/motion';

export interface Opcion {
  id: string;
  /** Para el boton: "con Yape", "a tu cuenta bancaria". */
  corto: string;
  nombre: string;
  detalle: string;
  icono: string;
}

interface Props {
  titulo: string;
  /** Texto sobre el saldo, p. ej. "Saldo actual" o "Disponible para retirar". */
  saldoLabel: string;
  saldo: number;
  montosRapidos: { value: string; label: string }[];
  seccionOpciones: string;
  opciones: readonly Opcion[];
  min: number;
  max: number;
  /** Mensaje cuando el monto supera el maximo. */
  errorMax: string;
  /** "Recargar S/ 50.00 con Yape". */
  accion: (monto: string, opcion: Opcion) => string;
  /** Resultado que se muestra al confirmar. */
  resultado: (monto: number, opcion: Opcion) => { titulo: string; detalle: string };
  onListo: () => void;
}

/**
 * Pantalla comun de Recargar y Retirar: monto (escrito o rapido), una opcion
 * de una lista y un boton que repite monto y destino antes de confirmar.
 */
export function OperacionSaldo(p: Props) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const [monto, setMonto] = useState('');
  const [opcionId, setOpcionId] = useState<string | null>(null);
  const [hecho, setHecho] = useState<{ titulo: string; detalle: string } | null>(null);

  const valor = Number(monto) || 0;
  const opcion = p.opciones.find((o) => o.id === opcionId) ?? null;
  const error =
    monto === '' ? undefined :
    valor < p.min ? `El monto mínimo es ${formatSoles(p.min)}.` :
    valor > p.max ? p.errorMax : undefined;
  const listo = !!opcion && valor >= p.min && valor <= p.max;

  // El segmento rapido se marca solo si el monto escrito coincide
  const rapido = p.montosRapidos.find((m) => Number(m.value) === valor)?.value ?? '';

  const confirmar = () => {
    if (!listo || !opcion) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setHecho(p.resultado(valor, opcion));
  };

  if (hecho) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.background }]}>
        <AppHeader title={p.titulo} onBack={p.onListo} />
        <Animated.View entering={FadeIn.duration(Duration.base)} style={[styles.done, { paddingBottom: insets.bottom + Spacing.xl }]}>
          <View style={styles.doneBody}>
            <View style={[styles.okc, { backgroundColor: theme.onlineSoft }]}>
              <Ionicons name="checkmark" size={28} color={theme.online} />
            </View>
            <Text accessibilityRole="header" style={[Type.title, styles.center, { color: theme.text }]}>{hecho.titulo}</Text>
            <Text style={[Type.body, styles.center, { color: theme.textMuted }]}>{hecho.detalle}</Text>
          </View>
          <AppButton label="Volver a la billetera" onPress={p.onListo} />
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: theme.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader title={p.titulo} />
      <ScrollView
        contentContainerStyle={[styles.pad, { paddingBottom: insets.bottom + Spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[Type.detail, { color: theme.textMuted }]}>
          {p.saldoLabel}: <Text style={[Type.label, { color: theme.text }]}>{formatSoles(p.saldo)}</Text>
        </Text>

        <AmountField value={monto} onChange={setMonto} accessibilityLabel="Monto en soles" error={error} />
        <Segmented options={p.montosRapidos} value={rapido} onChange={setMonto} />

        <View style={styles.gap}>
          <AppSectionTitle>{p.seccionOpciones}</AppSectionTitle>
          <View accessibilityRole="radiogroup" style={styles.gap}>
            {p.opciones.map((o) => (
              <OptionRow
                key={o.id}
                titulo={o.nombre}
                detalle={o.detalle}
                icono={o.icono as never}
                selected={o.id === opcionId}
                onPress={() => setOpcionId(o.id)}
              />
            ))}
          </View>
        </View>

        <AppButton
          label={opcion && valor > 0 ? p.accion(formatSoles(valor), opcion) : p.titulo}
          onPress={confirmar}
          disabled={!listo}
          accessibilityHint={!listo ? 'Escribe o elige un monto y una opción' : undefined}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  pad: { paddingHorizontal: 18, paddingTop: Spacing.xs, gap: Spacing.lg },
  gap: { gap: Spacing.sm },
  done: { flex: 1, paddingHorizontal: 18, justifyContent: 'space-between' },
  doneBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  okc: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
