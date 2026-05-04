import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import { useConductorStore } from '@store/useConductorStore';
import { AvatarPasajero } from '@shared/components/ui/AvatarPasajero';
import { mockSolicitudes } from '../data/mockSolicitudes';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

type Props = NativeStackScreenProps<ConductorStackParamList, 'Calificar'>;

const TOTAL_ESTRELLAS = 5;

export function CalificarScreen({ route, navigation }: Props) {
  const { solicitudId } = route.params;
  const insets = useSafeAreaInsets();
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviado, setEnviado]     = useState(false);

  const solicitudStore         = useConductorStore((s) => s.solicitudActual);
  const setSolicitudActual      = useConductorStore((s) => s.setSolicitudActual);
  const actualizarCalificacion  = useConductorStore((s) => s.actualizarCalificacion);

  // Usar el store como fuente primaria (cubre viajes simulados con id dinamico)
  const solicitud =
    (solicitudStore?.id === solicitudId ? solicitudStore : null) ??
    mockSolicitudes.find((s) => s.id === solicitudId);

  const pasajero = solicitud?.pasajero;

  const irAlHome = () => {
    setSolicitudActual(null); // limpiar solicitud completada
    navigation.reset({ index: 0, routes: [{ name: 'ConductorHome' }] });
  };

  const handleEnviar = () => {
    if (estrellas === 0) return;
    actualizarCalificacion(solicitudId, estrellas);
    setEnviado(true);
    setTimeout(irAlHome, 1500);
  };

  if (!pasajero) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {enviado ? (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
            </View>
            <Text style={styles.successTitle}>¡Gracias!</Text>
            <Text style={styles.successSubtitle}>Calificación enviada</Text>
          </View>
        ) : (
          <>
            <Text style={styles.titulo}>Califica al pasajero</Text>
            <Text style={styles.subtitulo}>
              ¿Cómo fue tu experiencia con este pasajero?
            </Text>

            <View style={styles.avatarSection}>
              <AvatarPasajero fotoUrl={pasajero.fotoUrl} size={96} />
              <Text style={styles.nombre}>
                {pasajero.nombre} {pasajero.apellido}
              </Text>
              <View style={styles.infoRow}>
                <Ionicons name="star" size={13} color={Colors.warning} />
                <Text style={styles.infoText}>
                  {pasajero.calificacion.toFixed(1)} · {pasajero.totalViajes} viajes
                </Text>
              </View>
            </View>

            <View style={styles.estrellasContainer}>
              {Array.from({ length: TOTAL_ESTRELLAS }).map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setEstrellas(i + 1)}
                  activeOpacity={0.7}
                  style={styles.estrellaBtn}
                >
                  <Ionicons
                    name={i < estrellas ? 'star' : 'star-outline'}
                    size={40}
                    color={i < estrellas ? Colors.warning : Colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {estrellas > 0 && (
              <Text style={styles.etiquetaEstrellas}>
                {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][estrellas]}
              </Text>
            )}

            <TextInput
              style={styles.comentarioInput}
              placeholder="Comentario opcional..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={3}
              value={comentario}
              onChangeText={setComentario}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.enviarBtn,
                estrellas === 0 && styles.enviarBtnDisabled,
              ]}
              onPress={handleEnviar}
              activeOpacity={0.85}
              disabled={estrellas === 0}
            >
              <Text style={styles.enviarText}>ENVIAR CALIFICACIÓN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.omitirBtn}
              onPress={irAlHome}
              activeOpacity={0.7}
            >
              <Text style={styles.omitirText}>Omitir por ahora</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  titulo: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitulo: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#eef2f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  nombre: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  estrellasContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  estrellaBtn: {
    padding: 4,
  },
  etiquetaEstrellas: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.warning,
    marginBottom: Spacing.xl,
  },
  comentarioInput: {
    width: '100%',
    minHeight: 90,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
  },
  enviarBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadow.md,
    marginBottom: Spacing.md,
  },
  enviarBtnDisabled: {
    backgroundColor: Colors.textDisabled,
  },
  enviarText: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    letterSpacing: 0.5,
  },
  omitirBtn: {
    paddingVertical: Spacing.sm,
  },
  omitirText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing['3xl'],
  },
  successIcon: {
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['3xl'],
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  successSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
});
