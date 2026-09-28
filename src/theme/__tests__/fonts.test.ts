import { Type, Weight } from '../fonts';

describe('Type', () => {
  it('ningun rol carga una fuente externa: todos usan la letra del sistema con fontWeight', () => {
    for (const [rol, estilo] of Object.entries(Type)) {
      expect({ rol, fontFamily: (estilo as { fontFamily?: string }).fontFamily }).toEqual({ rol, fontFamily: undefined });
      expect(Object.values(Weight)).toContain(estilo.fontWeight);
    }
  });

  it('titulos, nombres, menu, estado y cifras van en negrita (700)', () => {
    const negrita = ['title', 'display', 'heading', 'panelTitle', 'sectionTitle', 'name', 'status', 'menu', 'price', 'priceXL', 'hero', 'amount', 'kpi'] as const;
    for (const rol of negrita) expect({ rol, peso: Type[rol].fontWeight }).toEqual({ rol, peso: '700' });
  });

  it('botones y etiquetas en semibold (600); texto corrido en regular (400)', () => {
    expect(Type.action.fontWeight).toBe('600');
    expect(Type.label.fontWeight).toBe('600');
    expect(Type.body.fontWeight).toBe('400');
    expect(Type.detail.fontWeight).toBe('400');
  });
});
