import React, { useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';
import { useAppTheme } from '@theme/useAppTheme';
import { Weight } from '@theme/fonts';
import { formatSoles } from '@shared/utils/format';
import type { Barra } from '../resumen';

const H = 150;
const AXIS_W = 28;
const TOP = 18;
const BASE = 128;
const BAR_W = 24;
const R = 4;

function techo(max: number): number {
  const paso = max > 1000 ? 500 : 100;
  return Math.max(paso, Math.ceil(max / paso) * paso);
}

/** Barra con esquinas superiores redondeadas. */
function barPath(x: number, y: number, w: number): string {
  const r = Math.min(R, BASE - y);
  return `M${x} ${BASE}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${BASE}Z`;
}

/**
 * Un solo color para las barras y la actual en tinta. Solo se rotulan la mejor
 * y la actual; el resto se ve tocando cada barra.
 */
export function BarChart({ barras }: { barras: Barra[] }) {
  const theme = useAppTheme();
  const [w, setW] = useState(0);
  const [sel, setSel] = useState<number | null>(null);

  const max = techo(Math.max(...barras.map((b) => b.valor), 1));
  const plotW = Math.max(0, w - AXIS_W - 4);
  const col = barras.length ? plotW / barras.length : 0;
  const barW = Math.min(BAR_W * (barras.length <= 4 ? 2 : 1), col * 0.7);
  const y = (v: number) => BASE - (v / max) * (BASE - TOP);
  const mejor = barras.reduce((m, b, i) => (b.valor > barras[m].valor ? i : m), 0);
  const grid = [0, 1, 2, 3].map((i) => (max / 3) * i);

  const rotulo = (i: number) => i === sel || i === mejor || barras[i].esActual;

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Ganancias: ${barras
        .filter((b) => !b.futuro)
        .map((b) => `${b.nombre} ${formatSoles(b.valor)}`)
        .join(', ')}`}
    >
      {w > 0 && (
        <Svg width={w} height={H}>
          {grid.map((g) => (
            <React.Fragment key={g}>
              <Line x1={AXIS_W} x2={w - 4} y1={y(g)} y2={y(g)} stroke={theme.divider} strokeWidth={1} />
              <SvgText
                x={AXIS_W - 6}
                y={y(g) + 3}
                fontSize={10}
                fontWeight={Weight.regular}
                fill={theme.textMuted}
                textAnchor="end"
              >
                {Math.round(g)}
              </SvgText>
            </React.Fragment>
          ))}
          {barras.map((b, i) => {
            const cx = AXIS_W + col * i + col / 2;
            const x = cx - barW / 2;
            const top = y(b.valor);
            return (
              <React.Fragment key={i}>
                {b.valor > 0 && (
                  <Path
                    d={barPath(x, top, barW)}
                    fill={b.esActual || i === sel ? theme.text : theme.chartBar}
                  />
                )}
                {b.valor > 0 && rotulo(i) && (
                  <SvgText
                    x={cx}
                    y={top - 5}
                    fontSize={11}
                    fontWeight={Weight.semibold}
                    fill={theme.text}
                    textAnchor="middle"
                  >
                    {Math.round(b.valor)}
                  </SvgText>
                )}
                <SvgText
                  x={cx}
                  y={H - 6}
                  fontSize={11}
                  fontWeight={Weight.semibold}
                  fill={b.esActual ? theme.text : theme.textMuted}
                  textAnchor="middle"
                >
                  {b.etiqueta}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      )}
      {/* Zonas tactiles por barra, encima del grafico */}
      <View style={[StyleSheet.absoluteFillObject, styles.hits, { left: AXIS_W }]}>
        {barras.map((b, i) => (
          <Pressable
            key={i}
            style={styles.hit}
            disabled={b.futuro}
            onPress={() => setSel((s) => (s === i ? null : i))}
            accessibilityRole="button"
            accessibilityLabel={`${b.nombre}: ${formatSoles(b.valor)}`}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hits: { flexDirection: 'row', right: 4 },
  hit: { flex: 1 },
});
