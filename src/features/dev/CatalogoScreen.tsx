import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AppButton,
  AppHeader,
  AppSectionTitle,
  AppTextInput,
  Chip,
  CountdownRing,
  InfoNote,
  MapButton,
  MapPill,
  Plate,
  RouteStops,
  Segmented,
  Skeleton,
  SlideToConfirm,
  SosButton,
  StarRating,
  StatusDot,
  Tag,
} from '@shared/components/ui';
import { useAppTheme } from '@theme/useAppTheme';
import { Type, type TypeRole } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';

/**
 * Catalogo de componentes del sistema "Senal". Solo existe en __DEV__ para
 * revisar estados, claro/oscuro y texto grande sin recorrer toda la app.
 */
export function CatalogoScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const [estrellas, setEstrellas] = useState(4);
  const [chip, setChip] = useState(true);
  const [seg, setSeg] = useState<'a' | 'b' | 'c'>('b');
  const [slides, setSlides] = useState(0);

  const roles = Object.keys(Type) as TypeRole[];
  const colores = Object.entries(theme).filter(
    ([, v]) => typeof v === 'string' && v.startsWith('#'),
  ) as [string, string][];

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <AppHeader title="Catálogo" />
      <ScrollView contentContainerStyle={[styles.pad, { paddingBottom: insets.bottom + Spacing['3xl'] }]}>
        <AppSectionTitle>Botones</AppSectionTitle>
        <AppButton label="Llegué al punto de recojo" onPress={() => {}} />
        <AppButton label="Enviar código" disabled onPress={() => {}} />
        <AppButton label="Cargando" loading onPress={() => {}} />
        <AppButton label="Recargar" variant="signal" size="md" onPress={() => {}} />
        <AppButton label="Desconectarme" variant="ghost" size="md" onPress={() => {}} />
        <SlideToConfirm label={`Desliza para aceptar (${slides})`} onConfirm={() => setSlides((n) => n + 1)} />
        <SlideToConfirm tone="primary" label="Desliza para finalizar" onConfirm={() => {}} />

        <AppSectionTitle>Estado y etiquetas</AppSectionTitle>
        <View style={styles.wrap}>
          <MapPill>
            <StatusDot online={false} />
            <Text style={[Type.label, { color: theme.text }]}>Desconectado</Text>
          </MapPill>
          <MapPill>
            <StatusDot online />
            <Text style={[Type.label, { color: theme.text }]}>Conectado</Text>
          </MapPill>
          <MapButton icon="menu-outline" accessibilityLabel="Menú" onPress={() => {}} />
          <SosButton />
        </View>
        <View style={styles.wrap}>
          <Tag label="RunX" />
          <Tag label="Efectivo" tone="cash" />
          <Tag label="Yape" tone="digital" />
          <Tag label="Confirmado" tone="success" />
          <Tag label="Por confirmar" tone="signal" />
          <Plate placa="BKL-482" />
        </View>
        <View style={styles.wrap}>
          <Chip label="Puntual" selected={chip} onToggle={() => setChip((c) => !c)} />
          <Chip label="Hizo esperar" selected={!chip} onToggle={() => setChip((c) => !c)} />
        </View>
        <Segmented
          options={[
            { value: 'a', label: 'Hoy' },
            { value: 'b', label: 'Semana' },
            { value: 'c', label: 'Mes' },
          ]}
          value={seg}
          onChange={setSeg}
        />
        <View style={styles.wrap}>
          <CountdownRing segundos={24} total={30} />
          <CountdownRing segundos={4} total={30} />
        </View>
        <StarRating value={estrellas} onChange={setEstrellas} />

        <AppSectionTitle>Tarjetas y entradas</AppSectionTitle>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
          <RouteStops
            origen={{ direccion: 'Av. Javier Prado Este 2465, San Borja', detalle: 'Frente al Banco de la Nación' }}
            destino={{ direccion: 'Av. La Encalada 1388, Surco', detalle: '6.8 km · 18 min de viaje' }}
          />
        </View>
        <InfoNote title="Más demanda en Miraflores.">Está a 6 min de donde estás.</InfoNote>
        <AppTextInput placeholder="Comentario opcional" accessibilityLabel="Ejemplo de campo" />

        <AppSectionTitle>Cargando (skeleton)</AppSectionTitle>
        <View style={[styles.card, styles.gap, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
          <Skeleton width={120} height={28} />
          <Skeleton width="80%" />
          <Skeleton width="60%" />
          <Skeleton height={56} radius={BorderRadius.lg} />
        </View>

        <AppSectionTitle>Tipografía (General Sans)</AppSectionTitle>
        {roles.map((r) => (
          <View key={r} style={[styles.typeRow, { borderBottomColor: theme.divider }]}>
            <Text style={[Type[r], { color: theme.text }]} numberOfLines={1}>
              {r.startsWith('price') || r === 'hero' ? 'S/ 18.50' : 'Av. Javier Prado'}
            </Text>
            <Text style={[Type.caption, { color: theme.textMuted }]}>
              {r} · {Type[r].fontSize}
            </Text>
          </View>
        ))}

        <AppSectionTitle>Colores del tema actual</AppSectionTitle>
        <View style={styles.wrap}>
          {colores.map(([k, v]) => (
            <View key={k} style={styles.sw}>
              <View style={[styles.swBox, { backgroundColor: v, borderColor: theme.divider }]} />
              <Text style={[Type.caption, { color: theme.textMuted }]}>{k}</Text>
            </View>
          ))}
        </View>
        <View style={styles.wrap}>
          <Ionicons name="information-circle-outline" size={16} color={theme.textMuted} />
          <Text style={[Type.caption, styles.flex, { color: theme.textMuted }]}>
            Cambia claro/oscuro en Configuración y el tamaño de texto del sistema para revisar cada estado.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: 18, gap: Spacing.md },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.sm },
  card: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: 14 },
  gap: { gap: Spacing.sm },
  typeRow: { paddingVertical: Spacing.sm, borderBottomWidth: 1, gap: 2 },
  sw: { width: 92, gap: 4 },
  swBox: { height: 36, borderRadius: BorderRadius.sm, borderWidth: 1 },
});
