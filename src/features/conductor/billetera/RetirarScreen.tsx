import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import { MONTO_MIN, destinosRetiro, mockBilletera } from '../data/mockIngresos';
import { formatSoles } from '@shared/utils/format';
import { OperacionSaldo } from './OperacionSaldo';

type Props = NativeStackScreenProps<ConductorStackParamList, 'Retirar'>;

/** Retirar saldo a una cuenta, billetera digital o en efectivo en un agente. */
export function RetirarScreen({ navigation }: Props) {
  const saldo = mockBilletera.saldo;
  return (
    <OperacionSaldo
      titulo="Retirar saldo"
      saldoLabel="Disponible para retirar"
      saldo={saldo}
      montosRapidos={[
        { value: '20', label: 'S/ 20' },
        { value: '50', label: 'S/ 50' },
        { value: saldo.toFixed(2), label: 'Todo' },
      ]}
      seccionOpciones="¿Dónde lo recibes?"
      opciones={destinosRetiro}
      min={MONTO_MIN}
      max={saldo}
      errorMax="No puedes retirar más que tu saldo disponible."
      accion={(m, o) => `Retirar ${m} ${o.corto}`}
      resultado={(m, o) =>
        o.id === 'agente'
          ? {
              titulo: 'Código de retiro listo',
              detalle: `Muestra el código 715 208 en un agente BCP o Kasnet para retirar ${formatSoles(m)}. Vale por 24 horas.`,
            }
          : {
              titulo: 'Retiro solicitado',
              detalle: `${formatSoles(m)} ${o.corto}. ${o.detalle}.`,
            }
      }
      onListo={() => navigation.goBack()}
    />
  );
}
