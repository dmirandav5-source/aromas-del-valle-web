// Pruebas del motor contra los valores de control del Excel (supuestos por defecto).
// Tolerancia: ±1 sol en montos; ±0.0001 en tasas y razones.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { calcular, SUPUESTOS_DEFAULT } from '../engine.js';

const r = calcular(SUPUESTOS_DEFAULT);
const esc = Object.fromEntries(r.escenarios.map((e) => [e.id, e]));
const base = esc.base;

const soles = (actual, esperado, tol = 1) => expect(Math.abs(actual - esperado)).toBeLessThanOrEqual(tol);
const tasa = (actual, esperado, tol = 0.0001) => expect(Math.abs(actual - esperado)).toBeLessThanOrEqual(tol);

describe('supuestos por defecto', () => {
  it('server/data/supuestos.default.json es idéntico a shared/defaults.js', () => {
    const ruta = fileURLToPath(new URL('../../server/data/supuestos.default.json', import.meta.url));
    expect(JSON.parse(readFileSync(ruta, 'utf8'))).toEqual(SUPUESTOS_DEFAULT);
  });
});

describe('costos, márgenes y volumen', () => {
  it('U = 49.50', () => tasa(r.costos.U, 49.5));
  it('contribución por kg', () => {
    const [t, on, b] = r.costos.canales;
    tasa(t.contrib, 130.5);
    tasa(on.contrib, 79.02);
    tasa(b.contrib, 32.5);
  });
  it('kg0 y uso de la capacidad', () => {
    tasa(r.costos.kg0, 10485.2421, 0.01);
    tasa(r.costos.usoCapacidad, 0.4369);
  });
  it('% del caso suma 90.4 %', () => tasa(r.costos.pctCasoTotal, 0.904));
  it('método unitario', () => {
    soles(r.costos.metodoUnitario[0].Ct, 519019.48);
    soles(r.costos.metodoUnitario[1].Ct, 791234.83);
  });
});

describe('tasas y préstamo', () => {
  it('tasas', () => {
    tasa(r.tasas.im, 0.0113476);
    tasa(r.tasas.kdNeto, 0.102225);
    tasa(r.tasas.ke, 0.10855);
    tasa(r.tasas.cppc, 0.103806);
    tasa(r.tasas.cppcReal, 0.082163);
    tasa(r.tasas.tmarInflada, 0.1832);
    tasa(r.tasas.tmarAntes, 0.22695);
    tasa(r.tasas.ib, 0.122549);
  });
  it('préstamo', () => {
    soles(r.prestamo.completo.cuota, 16316.15, 0.01);
    soles(r.prestamo.completo.totalInteres, 107381.34, 0.01);
    soles(r.prestamo.fase1.cuota, 8837.91, 0.01);
    soles(r.prestamo.completo.anual[0].interes, 56905.90, 0.01);
    soles(r.prestamo.completo.meses[35].saldoFinal, 0, 0.001);
  });
  it('factores', () => {
    tasa(r.factores.ap, 0.305409);
    tasa(r.factores.af, 0.145409);
    tasa(r.factores.apPrestamo, 0.033992);
  });
});

describe('flujos del escenario base', () => {
  it('Fase 1', () => {
    [-260000, 10192.84, 58535.57, 96719.41, 150370.0, 378102.21].forEach((v, t) => soles(base.fase1.flujo[t], v));
  });
  it('Tiendas', () => {
    [-220000, -94221, -27914, 46393, 63393, 131393].forEach((v, t) => soles(base.tiendas[t], v));
  });
  it('financiero', () => {
    [0, -259524.77].forEach((v, t) => soles(base.financiero.completo.flujo[t], v));
    soles(base.financiero.fase1.flujo[1], -84867.82);
  });
});

describe('VPN por escenario', () => {
  const tabla = {
    pesimista: [-139467.55, -489341.8, -628809.35],
    base: [117319.82, -194678.31, -77358.49],
    optimista: [430319.34, 88194.64, 518513.98],
  };
  for (const [id, [f1, ti, to]] of Object.entries(tabla)) {
    it(id, () => {
      soles(esc[id].ind.fase1.vpn, f1);
      soles(esc[id].ind.tiendas.vpn, ti);
      soles(esc[id].ind.total.vpn, to);
    });
  }
  it('VPN esperado', () => {
    soles(r.resumen.vpn.fase1.esperado, 131372.86);
    soles(r.resumen.vpn.total.esperado, -66253.09);
  });
});

describe('indicadores base', () => {
  const i = base.ind;
  it('VAE', () => {
    soles(i.fase1.vae, 35830.57);
    soles(i.total.vae, -23626.01);
  });
  it('TIR interpolada y exacta', () => {
    tasa(i.fase1.tirInterp.tir, 0.276014);
    tasa(i.total.tirInterp.tir, 0.119579);
    tasa(i.fase1.tirExacta, 0.274728);
    tasa(i.total.tirExacta, 0.118134);
    expect(i.fase1.tirInterp.i1).toBe(0.25);
    expect(i.fase1.tirInterp.i2).toBe(0.3);
  });
  it('TIR «No existe» en tiendas pesimista', () => {
    expect(esc.pesimista.ind.tiendas.tirInterp.existe).toBe(false);
  });
  it('TER', () => {
    tasa(i.fase1.ter.ter, 0.249698);
    tasa(i.total.ter.ter, 0.124541);
  });
  it('B/C', () => {
    tasa(i.fase1.bc, 1.4512);
    tasa(i.total.bc, 0.86);
    tasa(i.tiendas.bc, 0.3954);
  });
  it('recuperación', () => {
    tasa(i.fase1.recuperacion, 4.348293);
    expect(i.total.recuperacion).toBeNull();
    tasa(i.totalFin.recuperacion, 4.985646);
  });
  it('antes de impuestos', () => {
    soles(i.fase1AI.vpn, 119058.96);
    soles(i.totalAI.vpn, -138470.23);
    soles(i.fase1AI.vae, 42195.59);
  });
  it('VPN financiero', () => {
    soles(i.totalFin.vpn, 3481.9);
    soles(i.fase1Fin.vpn, 161108.37);
  });
});

describe('incremental, equilibrio, gradiente e inflación', () => {
  it('ΔB/C', () => {
    const d = Object.fromEntries(r.incremental.porEscenario.map((x) => [x.id, x.dBC]));
    tasa(d.pesimista, -0.1134);
    tasa(d.base, 0.3343);
    tasa(d.optimista, 1.3768);
    tasa(r.incremental.tirIncremental, -0.085295);
  });
  it('equilibrio de tiendas', () => {
    soles(r.equilibrio.lima.ventasContable, 348387.1);
    soles(r.equilibrio.lima.ventasEq, 408906.58);
    soles(r.equilibrio.aqp.ventasEq, 254891.53);
    soles(r.equilibrio.lima.economico, 524495, 5);
    soles(r.equilibrio.aqp.economico, 327559, 5);
  });
  it('equilibrio Fase 1', () => {
    soles(r.equilibrio.fase1.A, 133957.31);
    tasa(r.equilibrio.fase1.Q, 1695.233, 0.001);
  });
  it('gradiente geométrico', () => {
    soles(r.factores.gradiente.vpInc, 994179.7);
    soles(r.factores.gradiente.diferencia, 0, 1e-6);
    tasa(r.factores.gradiente.paGeo, 4.461562);
  });
  it('inflación', () => {
    soles(r.inflacion.vpnCorriente, 117319.82);
    soles(r.inflacion.diferencia, 0, 1e-6);
  });
});

describe('sensibilidad (VPN total y Fase 1 con −20 % / +20 %)', () => {
  // Valores de la hoja Sensibilidad del Excel
  const excel = {
    cfTiendas: [83305, -238022, 117320, 117320],
    cmT: [-235333, 80616, 117320, 117320],
    ventasTiendas: [-231241, 76524, 117320, 117320],
    g: [-155427, 7036, 39251, 201715],
    costoProd: [-7760, -146957, 186918, 47722],
    inversion: [-11641, -143619, 150882, 83215],
    tmar: [-19683, -126842, 162354, 78456],
    cf1: [-44118, -110599, 150560, 84079],
    flete: [-53714, -101003, 140965, 93675],
    b2b: [-95686, -59187, 98992, 135492],
  };
  const filas = Object.fromEntries(r.sensibilidad.filas.map((f) => [f.id, f]));
  for (const [id, [tm, tM, fm, fM]] of Object.entries(excel)) {
    it(id, () => {
      soles(filas[id].totalMenos, tm);
      soles(filas[id].totalMas, tM);
      soles(filas[id].fase1Menos, fm);
      soles(filas[id].fase1Mas, fM);
    });
  }
  it('ordenada de mayor a menor rango', () => {
    expect(r.sensibilidad.filas[0].id).toBe('cfTiendas');
    const rangos = r.sensibilidad.filas.map((f) => f.rangoTotal);
    expect([...rangos].sort((a, b) => b - a)).toEqual(rangos);
  });
});

describe('recálculo', () => {
  it('cambiar FLima a 172,800 sube el VPN total', () => {
    const r2 = calcular({ ...SUPUESTOS_DEFAULT, FLima: 172800 });
    expect(r2.base.ind.total.vpn).toBeGreaterThan(base.ind.total.vpn);
    expect(r2.base.ind.fase1.vpn).toBeCloseTo(base.ind.fase1.vpn, 6);
  });
});
