import type { ImageSourcePropType } from 'react-native';

/** Logos de medios de pago (assets/pagos). */
export const LogosPago = {
  yape: require('../../../../assets/pagos/yape.png'),
  plin: require('../../../../assets/pagos/plin.png'),
  efectivo: require('../../../../assets/pagos/efectivo.png'),
} satisfies Record<string, ImageSourcePropType>;

export type LogoPago = keyof typeof LogosPago;
