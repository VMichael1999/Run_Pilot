import { useEffect, useState } from 'react';

/** Segundos transcurridos desde `desdeMs`, actualizados cada segundo. 0 si no hay inicio. */
export function useSegundosDesde(desdeMs: number | null): number {
  const [ahora, setAhora] = useState(Date.now());
  useEffect(() => {
    if (desdeMs === null) return;
    setAhora(Date.now());
    const iv = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(iv);
  }, [desdeMs]);
  return desdeMs === null ? 0 : Math.max(0, Math.floor((ahora - desdeMs) / 1000));
}

/** "2:05". */
export const cronometro = (seg: number) => `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`;
