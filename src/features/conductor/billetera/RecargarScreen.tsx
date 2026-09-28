import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import { MONTO_MAX_RECARGA, MONTO_MIN, metodosRecarga, mockBilletera } from '../data/mockIngresos';
import { formatSoles } from '@shared/utils/format';
import { OperacionSaldo } from './OperacionSaldo';

type Props = NativeStackScreenProps<ConductorStackParamList, 'Recargar'>;

/** Recargar saldo. Aun no hay pasarela: se muestra la solicitud como hecha. */
export function RecargarScreen({ navigation }: Props) {
  return (
    <OperacionSaldo
      titulo="Recargar saldo"
      saldoLabel="Saldo actual"
      saldo={mockBilletera.saldo}
      montosRapidos={[
        { value: '20', label: 'S/ 20' },
        { value: '50', label: 'S/ 50' },
        { value: '100', label: 'S/ 100' },
      ]}
      montoInicial="20"
      seccionOpciones="Método de recarga"
      opciones={metodosRecarga}
      min={MONTO_MIN}
      max={MONTO_MAX_RECARGA}
      errorMax={`El monto máximo por recarga es ${formatSoles(MONTO_MAX_RECARGA)}.`}
      accion={(m, o) => `Recargar ${m} ${o.corto}`}
      resultado={(m, o) =>
        o.id === 'agente'
          ? {
              titulo: 'Código de pago generado',
              detalle: `Paga ${formatSoles(m)} en un agente BCP o Kasnet con el código 482 931. El saldo se acredita en unas horas.`,
            }
          : {
              titulo: 'Recarga en proceso',
              detalle: `Solicitaste ${formatSoles(m)} con ${o.nombre}. Verás el saldo cuando se confirme el pago.`,
            }
      }
      onListo={() => navigation.goBack()}
    />
  );
}
