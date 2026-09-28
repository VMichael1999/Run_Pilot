import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import { useConductorStore } from '@store/useConductorStore';
import { mockSolicitudes } from '../data/mockSolicitudes';
import { AppButton, AppTextInput, AvatarPasajero, Chip, StarRating } from '@shared/components/ui';
import { useAppTheme } from '@theme/useAppTheme';
import { Weight, Type } from '@theme/fonts';
import { Hit, Spacing } from '@theme/spacing';
import { Duration } from '@theme/motion';

type Props = NativeStackScreenProps<ConductorStackParamList, 'Calificar'>;

/** Etiquetas rapidas. Aun no se envian: el store solo guarda las estrellas. */
const ETIQUETAS = [
  'Puntual',
  'Amable',
  'Indicó bien el recojo',
  'Respetuoso con el auto',
  'Hizo esperar',
];

const VOLVER_MS = 1200;

export function CalificarScreen({ route, navigation }: Props) {
  const { solicitudId } = route.params;
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const [estrellas,  setEstrellas]  = useState(0);
  const [etiquetas,  setEtiquetas]  = useState<string[]>([]);
  const [comentario, setComentario] = useState('');
  const [enviado,    setEnviado]    = useState(false);

  const solicitudStore         = useConductorStore((s) => s.solicitudActual);
  const delHistorial           = useConductorStore((s) => s.historial.find((v) => v.id === solicitudId));
  const estadoViaje            = useConductorStore((s) => s.estadoViaje);
  const setSolicitudActual     = useConductorStore((s) => s.setSolicitudActual);
  const actualizarCalificacion = useConductorStore((s) => s.actualizarCalificacion);

  // Store primero (viajes simulados con id dinamico), luego el historial
  // (calificar despues desde Historial) y por ultimo los datos de ejemplo
  const solicitud =
    (solicitudStore?.id === solicitudId ? solicitudStore : null) ??
    delHistorial?.solicitud ??
    mockSolicitudes.find((s) => s.id === solicitudId);

  const pasajero = solicitud?.pasajero;

  // Vuelve a donde se abrio: al inicio si viene del viaje (Viaje se reemplazo
  // por esta pantalla), al historial si se califico despues
  const volver = () => {
    // Recien terminado: el viaje del historial guarda la misma solicitud que el store
    const esElDelStore = solicitudStore != null &&
      (solicitudStore.id === solicitudId || delHistorial?.solicitud.id === solicitudStore.id);
    if (!estadoViaje && esElDelStore) setSolicitudActual(null);
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.reset({ index: 0, routes: [{ name: 'ConductorHome' }] });
  };

  const handleEnviar = () => {
    if (estrellas === 0) return;
    actualizarCalificacion(solicitudId, estrellas);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEnviado(true);
  };

  useEffect(() => {
    if (!enviado) return;
    const t = setTimeout(volver, VOLVER_MS);
    return () => clearTimeout(t);
  }, [enviado]);

  const toggle = (e: string) =>
    setEtiquetas((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]));

  if (!pasajero) return null;

  if (enviado) {
    return (
      <View style={[styles.done, { backgroundColor: theme.background }]}>
        <Animated.View entering={FadeIn.duration(Duration.base)} style={styles.doneBody}>
          <View style={[styles.okc, { backgroundColor: theme.onlineSoft }]}>
            <Ionicons name="checkmark" size={28} color={theme.online} />
          </View>
          <Text accessibilityRole="header" style={[Type.title, styles.center, { color: theme.text }]}>
            Calificación enviada
          </Text>
          <Text style={[Type.body, styles.center, { color: theme.textMuted }]}>
            Le diste {estrellas} {estrellas === 1 ? 'estrella' : 'estrellas'} a {pasajero.nombre}.
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.pad,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl + 2 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.pax}>
          <AvatarPasajero nombre={pasajero.nombre} apellido={pasajero.apellido} size={52} />
          <Text accessibilityRole="header" style={[styles.titulo, { color: theme.text }]}>
            ¿Cómo fue el viaje con {pasajero.nombre}?
          </Text>
        </View>

        <StarRating value={estrellas} onChange={setEstrellas} />

        <View style={styles.block}>
          <Text accessibilityRole="header" style={[Type.sectionTitle, { color: theme.text }]}>¿Qué destacarías?</Text>
          <View style={styles.chips}>
            {ETIQUETAS.map((e) => (
              <Chip key={e} label={e} selected={etiquetas.includes(e)} onToggle={() => toggle(e)} />
            ))}
          </View>
        </View>

        <AppTextInput
          placeholder="Comentario opcional"
          accessibilityLabel="Comentario opcional"
          multiline
          value={comentario}
          onChangeText={setComentario}
          textAlignVertical="top"
          inputStyle={styles.field}
        />

        <AppButton
          label="Enviar calificación"
          onPress={handleEnviar}
          disabled={estrellas === 0}
          accessibilityHint={estrellas === 0 ? 'Elige primero de 1 a 5 estrellas' : undefined}
        />
        <TouchableOpacity
          accessibilityRole="button"
          onPress={volver}
          style={styles.textBtn}
          activeOpacity={0.6}
        >
          <Text style={[Type.bodyStrong, styles.underline, { color: theme.textMuted }]}>Omitir</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  pad: { paddingHorizontal: 18, gap: Spacing.lg },
  pax: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: Spacing.sm },
  titulo: { ...Type.question, flex: 1 },
  block: { gap: Spacing.sm + 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  field: { minHeight: 56 },
  textBtn: { minHeight: Hit.min, alignItems: 'center', justifyContent: 'center' },
  underline: { textDecorationLine: 'underline' },
  done: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing['2xl'] },
  doneBody: { alignItems: 'center', gap: Spacing.md },
  okc: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
