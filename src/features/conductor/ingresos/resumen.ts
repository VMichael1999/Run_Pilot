import type { ViajeCompletado } from '../types';
import { desgloseCobro, distritoDe, esEfectivo } from '@shared/utils/cobro';
import { indiceLunes } from '@shared/utils/fecha';
import { inicioDelDia } from '@shared/utils/format';
import { mockIngresos } from '../data/mockIngresos';

export interface ViajeResumen {
  id: string;
  fechaMs: number;
  ruta: string;
  tarifa: number;
  comision: number;
  ganancia: number;
  efectivo: boolean;
}

/** Viajes del historial con su ganancia neta, del mas reciente al mas antiguo. */
export function viajesConGanancia(historial: ViajeCompletado[], comision: number): ViajeResumen[] {
  return [...historial]
    .sort((a, b) => b.fechaMs - a.fechaMs)
    .map((v) => {
      const o = v.solicitud.paradas.find((p) => p.esOrigen);
      const d = v.solicitud.paradas.find((p) => !p.esOrigen);
      const cobro = desgloseCobro(v.solicitud.precio, comision);
      return {
        id: v.id,
        fechaMs: v.fechaMs,
        ruta: o && d ? `${distritoDe(o.direccion)} → ${distritoDe(d.direccion)}` : 'Viaje',
        ...cobro,
        efectivo: esEfectivo(v.solicitud.metodoPago),
      };
    });
}

const suma = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) * 100) / 100;

export interface Barra {
  etiqueta: string;
  nombre: string;
  valor: number;
  esActual: boolean;
  futuro: boolean;
}

export interface Periodo {
  total: number;
  viajes: number;
  horas: number;
  barras: Barra[];
  lista: ViajeResumen[];
}

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

/** Hoy: todo sale del historial real. */
export function periodoHoy(viajes: ViajeResumen[], ahora = Date.now()): Periodo {
  const desde = inicioDelDia(ahora);
  const lista = viajes.filter((v) => v.fechaMs >= desde);
  return {
    total: suma(lista.map((v) => v.ganancia)),
    viajes: lista.length,
    horas: mockIngresos.horasHoy,
    barras: [],
    lista,
  };
}

/** Semana: dias anteriores de ejemplo, hoy real, dias que faltan en 0. */
export function periodoSemana(viajes: ViajeResumen[], ahora = Date.now()): Periodo {
  const hoy = periodoHoy(viajes, ahora);
  const idx = indiceLunes(ahora);
  const barras = DIAS.map((nombre, i) => ({
    etiqueta: i === idx ? 'Hoy' : nombre.charAt(0),
    nombre: i === idx ? `${nombre} (hoy)` : nombre,
    valor: i < idx ? mockIngresos.gananciaPorDia[i] : i === idx ? hoy.total : 0,
    esActual: i === idx,
    futuro: i > idx,
  }));
  const viajesPrevios = mockIngresos.viajesPorDia.slice(0, idx).reduce((a, b) => a + b, 0);
  return {
    total: suma(barras.map((b) => b.valor)),
    viajes: viajesPrevios + hoy.viajes,
    horas: mockIngresos.horasSemana + mockIngresos.horasHoy,
    barras,
    lista: hoy.lista,
  };
}

/** Mes: semanas anteriores de ejemplo y la semana actual calculada. */
export function periodoMes(viajes: ViajeResumen[], ahora = Date.now()): Periodo {
  const semana = periodoSemana(viajes, ahora);
  const previas = mockIngresos.gananciaPorSemanaMes;
  const barras = [...previas, semana.total].map((valor, i, arr) => ({
    etiqueta: i === arr.length - 1 ? 'Esta' : `S${i + 1}`,
    nombre: i === arr.length - 1 ? 'Esta semana' : `Semana ${i + 1}`,
    valor,
    esActual: i === arr.length - 1,
    futuro: false,
  }));
  return {
    total: suma(barras.map((b) => b.valor)),
    viajes: mockIngresos.viajesMes + semana.viajes,
    horas: mockIngresos.horasMes + semana.horas,
    barras,
    lista: semana.lista,
  };
}
