// Motor de cálculo de Aromas del Valle.
// JavaScript puro, sin dependencias: lo usan el frontend (recálculo en vivo),
// el backend (/api/resultados) y las pruebas (Vitest).
// Reproduce las fórmulas del Excel «Aromas_del_Valle_modelo_paso_a_paso.xlsx».
// Cada comentario indica la hoja y la fila del Excel que replica.

import { SUPUESTOS_DEFAULT } from './defaults.js';

export { SUPUESTOS_DEFAULT };

const YEARS = [0, 1, 2, 3, 4, 5]; // el flujo del Excel está fijo en 5 años (2026–2030)

// ───────────────────────── Factores del curso ─────────────────────────

// (P/F, i, t) factor de valor presente de un pago único
export const PF = (i, t) => 1 / Math.pow(1 + i, t);
// (F/P, i, t) factor de valor futuro de un pago único
export const FP = (i, t) => Math.pow(1 + i, t);
// (P/A, i, n) factor de valor presente de una serie uniforme
export const PA = (i, n) => (Math.pow(1 + i, n) - 1) / (i * Math.pow(1 + i, n));
// (A/P, i, n) factor de recuperación de capital
export const AP = (i, n) => (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
// (A/F, i, n) factor de fondo de amortización
export const AF = (i, n) => i / (Math.pow(1 + i, n) - 1);
// (F/A, i, n) factor de valor futuro de una serie uniforme
export const FA = (i, n) => (Math.pow(1 + i, n) - 1) / i;
// (P/A, g, i, n) gradiente geométrico
export const PAgeo = (g, i, n) =>
  g === i ? n / (1 + i) : (1 - Math.pow((1 + g) / (1 + i), n)) / (i - g);

const sum = (arr) => arr.reduce((a, b) => a + (b ?? 0), 0);
const sumProduct = (a, b) => a.reduce((acc, x, k) => acc + (x ?? 0) * (b[k] ?? 0), 0);

// ───────────────────────── Indicadores ─────────────────────────

// VPN = Σ F_t (P/F, i, t)
export function vpn(flujos, i) {
  return flujos.reduce((acc, F, t) => acc + (F ?? 0) * PF(i, t), 0);
}

// TIR exacta por bisección (hoja Flujo_*, columna «TIR exacta»).
export function tirExacta(flujos) {
  const f = (r) => vpn(flujos, r);
  let lo = -0.99;
  let hi = 10;
  let flo = f(lo);
  const fhi = f(hi);
  if (!Number.isFinite(flo) || !Number.isFinite(fhi) || flo * fhi > 0) return null;
  for (let k = 0; k < 300; k++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (Math.abs(fm) < 1e-9 || hi - lo < 1e-13) return mid;
    if (fm * flo > 0) {
      lo = mid;
      flo = fm;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

// Grilla de tasas de la tabla auxiliar: −40 % a 60 % en pasos de 5 %
export const GRILLA_TIR = Array.from({ length: 21 }, (_, k) => (k * 5 - 40) / 100);

// TIR por interpolación lineal entre las dos tasas de la grilla donde el VPN cambia de signo.
// TIR = i1 + VPN1 / (VPN1 − VPN2) · (i2 − i1)
export function tirInterpolada(flujos) {
  const grid = GRILLA_TIR.map((i) => ({ i, vpn: vpn(flujos, i) }));
  const vals = grid.map((g) => g.vpn);
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  if (max < 0 || min > 0) return { grid, existe: false, i1: null, vpn1: null, i2: null, vpn2: null, tir: null };
  // Equivale a MATCH(0; VPN; −1) del Excel: último VPN ≥ 0 antes del cambio de signo.
  let k = 1;
  while (k < grid.length && (grid[k].vpn >= 0) === (grid[k - 1].vpn >= 0)) k++;
  if (k >= grid.length) {
    // El VPN toca 0 justo en un extremo de la grilla
    const g0 = grid.find((g) => g.vpn === 0) ?? grid[grid.length - 1];
    return { grid, existe: true, i1: g0.i, vpn1: g0.vpn, i2: null, vpn2: null, tir: g0.i };
  }
  const { i: i1, vpn: vpn1 } = grid[k - 1];
  const { i: i2, vpn: vpn2 } = grid[k];
  const tir = i1 + (vpn1 / (vpn1 - vpn2)) * (i2 - i1);
  return { grid, existe: true, i1, vpn1, i2, vpn2, tir };
}

// TER (TIR modificada): VP de los negativos a i_b; VF de los positivos a la TMAR al año n.
// TER = (VF_pos / VP_neg)^(1/n) − 1
export function ter(flujos, ib, tmar, n) {
  const vpNeg = flujos.reduce((acc, F, t) => acc + (F < 0 ? -F * Math.pow(1 + ib, -t) : 0), 0);
  const vfPos = flujos.reduce((acc, F, t) => acc + (F > 0 ? F * Math.pow(1 + tmar, n - t) : 0), 0);
  const valor = vpNeg === 0 || vfPos === 0 ? null : Math.pow(vfPos / vpNeg, 1 / n) - 1;
  return { vpNeg, vfPos, ter: valor };
}

// Periodo de recuperación descontado con interpolación lineal dentro del año.
export function recuperacion(flujos, pf) {
  const vp = flujos.map((F, t) => (F ?? 0) * pf[t]);
  const acumulado = [];
  vp.forEach((v, t) => acumulado.push(v + (t > 0 ? acumulado[t - 1] : 0)));
  const candidatos = [];
  for (let t = 1; t < vp.length; t++) {
    if (acumulado[t - 1] < 0 && acumulado[t] >= 0) candidatos.push(t - 1 + -acumulado[t - 1] / vp[t]);
  }
  return { vp, acumulado, anios: candidatos.length ? Math.min(...candidatos) : null };
}

// Calcula todos los indicadores de un flujo.
function indicadores(clave, nombre, flujos, { i, pf, apFactor, ib, tmar, n, conTer = true }) {
  const valor = sumProduct(flujos, pf);
  const vpBen = flujos.reduce((acc, F, t) => acc + (F > 0 ? F * pf[t] : 0), 0);
  const vpCos = flujos.reduce((acc, F, t) => acc + (F < 0 ? -F * pf[t] : 0), 0);
  const rec = recuperacion(flujos, pf);
  return {
    clave,
    nombre,
    flujos,
    tasa: i,
    vpn: valor,
    vae: valor * apFactor, // VAE = VPN (A/P, i, n)
    vpBen,
    vpCos,
    bc: vpCos === 0 ? null : vpBen / vpCos, // B/C = VP beneficios / VP costos
    recuperacion: rec.anios,
    vpAnual: rec.vp,
    acumulado: rec.acumulado,
    tirInterp: tirInterpolada(flujos),
    tirExacta: tirExacta(flujos),
    ter: conTer ? ter(flujos, ib, tmar, n) : null,
  };
}

// ───────────────────────── Tasas (hoja Tasas) ─────────────────────────

export function calcTasas(s) {
  const im = Math.pow(1 + s.tea, 1 / 12) - 1; // i_m = (1 + i_a)^(1/12) − 1
  const kdNeto = s.tea * (1 - s.T); // K'd = Kd (1 − T)
  const ke = s.Rf + s.beta * s.primaMercado; // CAPM: Re = Rf + β (Rm − Rf)
  const We = 1 - s.Wd;
  const cppc = s.Wd * kdNeto + We * ke; // CPPC = Wd·Kd(1 − T) + We·Ke
  const cppcReal = (cppc - s.f) / (1 + s.f); // i = (if − f) / (1 + f)
  const tmarInflada = s.tmar + s.f + s.tmar * s.f; // if = i + f + i·f
  const tmarAntes = s.tmar / (1 - s.T); // TMAR antes de impuestos
  const ib = (s.tea - s.f) / (1 + s.f); // costo real del préstamo (TER)
  return {
    im,
    kdNeto,
    ke,
    We,
    cppc,
    cppcReal,
    tmar: s.tmar,
    primaRiesgo: s.tmar - cppcReal,
    tmarInflada,
    tmarAntes,
    ib,
    cumple: s.tmar >= cppcReal,
  };
}

// ───────────────────────── Costos y márgenes (hoja Costos_Margenes) ─────────────────────────

export function calcCostos(s) {
  const U = sum(s.costos.map((c) => c.valor));
  const rubros = s.costos.map((c) => ({ ...c, pct: U ? c.valor / U : 0 }));
  const pctCasoTotal = sum(s.costos.map((c) => c.pctCaso ?? 0));
  const vT = s.facturacion * s.shTienda;
  const vOn = s.facturacion * s.shOnline;
  const vB = s.facturacion * s.shB2B;

  const pasarelaSoles = s.pasarela * s.pOnline;
  const comisionSoles = s.comB2B * s.pB2B;
  const canal = (id, nombre, p, flete, pasarela, mkt, comision) => {
    const cv = U + flete + pasarela + mkt + comision;
    return { id, nombre, p, costo: U, flete, pasarela, mkt, comision, cv, contrib: p - cv, margen: p ? (p - cv) / p : 0 };
  };
  const canales = [
    canal('tienda', 'Tienda Cusco', s.pTienda, 0, 0, 0, 0),
    canal('online', 'Online', s.pOnline, s.flete, pasarelaSoles, s.mkt, 0),
    canal('b2b', 'B2B', s.pB2B, 0, 0, 0, comisionSoles),
  ];
  const [cT, cOn, cB] = canales;

  const volumen = [
    { id: 'tienda', nombre: 'Tienda Cusco (solo café)', ventas: vT * s.cafeTienda, precio: s.pTienda },
    { id: 'online', nombre: 'Online', ventas: vOn, precio: s.pOnline },
    { id: 'b2b', nombre: 'B2B', ventas: vB, precio: s.pB2B },
  ].map((v) => ({ ...v, kg: v.ventas / v.precio }));
  const kg0 = sum(volumen.map((v) => v.kg));
  const capActualAnual = s.cap0 * s.dias;
  const capNuevaAnual = s.cap1 * s.dias;

  return {
    U,
    rubros,
    pctCasoTotal,
    verdeMermaPct: rubros.slice(0, 2).reduce((a, r) => a + r.pct, 0),
    verdeMermaCaso: rubros.slice(0, 2).reduce((a, r) => a + (r.pctCaso ?? 0), 0),
    ventas2025: { tienda: vT, online: vOn, b2b: vB },
    canales,
    cmT: cT.margen,
    cmOn: cOn.margen, // (pOnline − U − flete − pasarela·pOnline − mkt) / pOnline
    cmB: cB.margen, // (pB2B·(1 − comB2B) − U) / pB2B
    volumen,
    ventasVolumenTotal: sum(volumen.map((v) => v.ventas)),
    kg0,
    capActualAnual,
    usoCapacidad: kg0 / capActualAnual,
    capNuevaAnual,
    capNuevaSobreActual: capNuevaAnual / kg0,
  };
}

// ───────────────────────── Préstamo (hoja Prestamo) ─────────────────────────

export function calcPrestamo(P, im, nm) {
  const cuota = P * AP(im, nm); // A = P (A/P, i_m, n)
  const meses = [];
  let saldo = P;
  for (let m = 1; m <= nm; m++) {
    const interes = saldo * im;
    const amort = cuota - interes;
    const saldoFinal = saldo - amort;
    meses.push({ mes: m, anio: Math.ceil(m / 12), saldoInicial: saldo, interes, amort, cuota, saldoFinal });
    saldo = saldoFinal;
  }
  const nAnios = Math.max(5, Math.ceil(nm / 12));
  const anual = Array.from({ length: nAnios }, (_, k) => {
    const delAnio = meses.filter((x) => x.anio === k + 1);
    return {
      anio: k + 1,
      interes: sum(delAnio.map((x) => x.interes)),
      amort: sum(delAnio.map((x) => x.amort)),
      cuota: sum(delAnio.map((x) => x.cuota)),
    };
  });
  return {
    P,
    cuota,
    meses,
    anual,
    totalInteres: sum(anual.map((a) => a.interes)),
    totalAmort: sum(anual.map((a) => a.amort)),
    totalCuota: sum(anual.map((a) => a.cuota)),
  };
}

// ───────────────────────── Flujo de un escenario (hojas Flujo_*) ─────────────────────────

function flujoTienda(S, inv, wc0, F, s) {
  const ventas = YEARS.map((t) => (t === 0 ? null : S * s.ramp[t - 1])); // v_t = S · maduración
  const contrib = ventas.map((v) => (v === null ? null : v * s.cmT));
  const cf = YEARS.map((t) => (t === 0 ? null : -F));
  const dep = YEARS.map((t) => (t === 0 ? null : -inv * s.dT));
  const ebit = YEARS.map((t) => (t === 0 ? null : contrib[t] + cf[t] + dep[t]));
  const imp = ebit.map((e) => (e === null ? null : -e * s.T));
  const uodi = ebit.map((e, t) => (e === null ? null : e + imp[t]));
  const depMas = dep.map((d) => (d === null ? null : -d));
  const inversion = YEARS.map((t) => (t === 0 ? -inv : null));
  const ctReq = YEARS.map((t) => (t === 0 ? wc0 : Math.max(wc0, ventas[t] * s.wcPct))); // MAX(inicial; 10 % de ventas)
  const ctVar = YEARS.map((t) => (t === 0 ? -ctReq[0] : -(ctReq[t] - ctReq[t - 1])));
  const ctRec = YEARS.map((t) => (t === 5 ? ctReq[5] : null));
  const flujo = YEARS.map(
    (t) => (uodi[t] ?? 0) + (depMas[t] ?? 0) + (inversion[t] ?? 0) + ctVar[t] + (ctRec[t] ?? 0),
  );
  return { ventas, contrib, cf, dep, ebit, imp, uodi, depMas, inversion, ctReq, ctVar, ctRec, flujo };
}

function flujoEscenario(esc, s, ctx) {
  const { tasas, costos, prestamo } = ctx;
  const pf = YEARS.map((t) => PF(s.tmar, t)); // (P/F, TMAR, t)
  const pfAI = YEARS.map((t) => PF(tasas.tmarAntes, t)); // (P/F, TMAR antes de imp., t)
  const { online: vOn, b2b: vB } = costos.ventas2025;

  // ── Fase 1 ──
  const online = YEARS.map((t) => (t === 0 ? null : vOn * (Math.pow(1 + esc.g, t) - 1))); // V_2025 [(1+g)^t − 1]
  const b2b = YEARS.map((t) => (t === 0 ? null : vB * esc.b2b * Math.min(t / 3, 1))); // crece lineal hasta el año 3
  const kg = YEARS.map((t) => (t === 0 ? null : costos.kg0 + online[t] / s.pOnline + b2b[t] / s.pB2B));
  const contribOnline = online.map((v) => (v === null ? null : v * costos.cmOn));
  const contribB2B = b2b.map((v) => (v === null ? null : v * costos.cmB));
  const ahorros = kg.map((k) => (k === null ? null : k * (s.ahMerma + s.ahEmp)));
  const cf = YEARS.map((t) => (t === 0 ? null : -s.cf1));
  const ebitda = YEARS.map((t) => (t === 0 ? null : contribOnline[t] + contribB2B[t] + ahorros[t] + cf[t]));
  const depAnual = s.invMaq * s.dMaq + s.invInt * s.dInt;
  const dep = YEARS.map((t) => (t === 0 ? null : -depAnual));
  const ebit = YEARS.map((t) => (t === 0 ? null : ebitda[t] + dep[t]));
  const imp = ebit.map((e) => (e === null ? null : -e * s.T)); // EBIT negativo → escudo fiscal
  const uodi = ebit.map((e, t) => (e === null ? null : e + imp[t]));
  const depMas = dep.map((d) => (d === null ? null : -d));
  const inversion = YEARS.map((t) => (t === 0 ? -(s.invMaq + s.invInt) : null));
  const ctReq = YEARS.map((t) => (t === 0 ? s.wc1 : Math.max(s.wc1, (online[t] + b2b[t]) * s.wcPct)));
  const ctVar = YEARS.map((t) => (t === 0 ? -ctReq[0] : -(ctReq[t] - ctReq[t - 1])));
  const ctRec = YEARS.map((t) => (t === 5 ? ctReq[5] : null));
  const rescate = YEARS.map((t) => (t === 5 ? s.invMaq * (1 - 5 * s.dMaq) : null)); // valor en libros
  const flujoF1 = YEARS.map(
    (t) =>
      (uodi[t] ?? 0) + (depMas[t] ?? 0) + (inversion[t] ?? 0) + ctVar[t] + (ctRec[t] ?? 0) + (rescate[t] ?? 0),
  );
  const flujoF1AI = flujoF1.map((F, t) => F - (imp[t] ?? 0));
  const fase1 = {
    online, kg, b2b, contribOnline, contribB2B, ahorros, cf, ebitda, dep, ebit, imp, uodi, depMas,
    inversion, ctReq, ctVar, ctRec, rescate, flujo: flujoF1, flujoAI: flujoF1AI,
  };

  // ── Fase 2: tiendas ──
  const lima = flujoTienda(esc.lima, s.invLima, s.wcLima, s.FLima, s);
  const aqp = flujoTienda(esc.aqp, s.invAqp, s.wcAqp, s.FAqp, s);
  const tiendas = YEARS.map((t) => lima.flujo[t] + aqp.flujo[t]);
  const total = YEARS.map((t) => flujoF1[t] + tiendas[t]);
  const totalAI = YEARS.map((t) => total[t] - (imp[t] ?? 0) - (lima.imp[t] ?? 0) - (aqp.imp[t] ?? 0));

  // ── Flujo financiero: FF_t = F_t − (cuota_t − interés_t·T) / (1 + f)^t ──
  const deflactor = YEARS.map((t) => 1 / Math.pow(1 + s.f, t));
  const financiero = (base, loan) => {
    const prest = YEARS.map((t) => (t === 0 ? loan.P : null));
    const cuotas = YEARS.map((t) => (t === 0 ? null : -(loan.anual[t - 1]?.cuota ?? 0)));
    const escudo = YEARS.map((t) => (t === 0 ? null : (loan.anual[t - 1]?.interes ?? 0) * s.T));
    const servicio = YEARS.map((t) => (t === 0 ? null : (cuotas[t] + escudo[t]) * deflactor[t]));
    const flujo = YEARS.map((t) => (t === 0 ? base[0] + loan.P : base[t] + servicio[t]));
    return { prestamo: prest, cuotas, escudo, servicio, flujo };
  };
  const finCompleto = financiero(total, prestamo.completo);
  const finFase1 = financiero(flujoF1, prestamo.fase1);

  // ── Indicadores ──
  const apTmar = AP(s.tmar, s.n);
  const apAI = AP(tasas.tmarAntes, 5); // el Excel usa n = 5 fijo para el VAE antes de impuestos
  const opt = { i: s.tmar, pf, apFactor: apTmar, ib: tasas.ib, tmar: s.tmar, n: s.n };
  const optAI = { i: tasas.tmarAntes, pf: pfAI, apFactor: apAI, ib: tasas.ib, tmar: s.tmar, n: s.n, conTer: false };
  const lista = [
    indicadores('fase1', 'Fase 1', flujoF1, opt),
    indicadores('lima', 'Tienda Lima', lima.flujo, opt),
    indicadores('aqp', 'Tienda Arequipa', aqp.flujo, opt),
    indicadores('tiendas', 'Tiendas (Fase 2)', tiendas, opt),
    indicadores('total', 'Proyecto completo — económico', total, opt),
    indicadores('totalFin', 'Proyecto completo — financiero', finCompleto.flujo, opt),
    indicadores('fase1Fin', 'Solo Fase 1 — financiero', finFase1.flujo, opt),
    indicadores('fase1AI', 'Fase 1 — antes de impuestos (a TMAR antes de imp.)', flujoF1AI, optAI),
    indicadores('totalAI', 'Proyecto completo — antes de impuestos (a TMAR antes de imp.)', totalAI, optAI),
  ];
  const ind = Object.fromEntries(lista.map((x) => [x.clave, x]));

  return {
    id: esc.id,
    nombre: esc.nombre,
    escenario: esc,
    t: YEARS,
    pf,
    pfAI,
    fase1,
    lima,
    aqp,
    tiendas,
    total,
    totalAI,
    deflactor,
    financiero: { completo: finCompleto, fase1: finFase1 },
    indicadores: lista,
    ind,
  };
}

// ───────────────────────── Modelo completo ─────────────────────────

function normalizar(supuestos) {
  const s = { ...SUPUESTOS_DEFAULT, ...(supuestos ?? {}) };
  s.costos = (s.costos ?? SUPUESTOS_DEFAULT.costos).map((c) => ({ ...c, valor: Number(c.valor) }));
  s.ramp = (s.ramp ?? SUPUESTOS_DEFAULT.ramp).slice(0, 5).map(Number);
  s.escenarios = (s.escenarios?.length ? s.escenarios : SUPUESTOS_DEFAULT.escenarios).map((e) => ({ ...e }));
  // Límites de seguridad para el recálculo en vivo (un plazo enorme congelaría el navegador)
  const entero = (v, min, max, def) => (Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : def);
  s.nm = entero(s.nm, 1, 600, SUPUESTOS_DEFAULT.nm);
  s.n = entero(s.n, 1, 100, SUPUESTOS_DEFAULT.n);
  return s;
}

// Solo los flujos del escenario base (se usa en la sensibilidad y en los equilibrios).
function nucleo(s) {
  const tasas = calcTasas(s);
  const costos = calcCostos(s);
  const prestamo = {
    completo: calcPrestamo(s.P, tasas.im, s.nm),
    fase1: calcPrestamo(s.P1, tasas.im, s.nm),
  };
  return { tasas, costos, prestamo };
}

function escenarioBase(s) {
  return s.escenarios.find((e) => e.id === 'base') ?? s.escenarios[Math.min(1, s.escenarios.length - 1)];
}

// Grupos de la hoja Sensibilidad (mismo orden que el Excel).
export const GRUPOS_SENSIBILIDAD = [
  { id: 'cfTiendas', nombre: 'Costos fijos tiendas', aplicar: (s, k) => { s.FLima *= k; s.FAqp *= k; } },
  { id: 'cmT', nombre: 'Margen de contribución tiendas', aplicar: (s, k) => { s.cmT *= k; } },
  { id: 'ventasTiendas', nombre: 'Ventas maduras tiendas', aplicar: (s, k, b) => { b.lima *= k; b.aqp *= k; } },
  { id: 'g', nombre: 'Crecimiento online', aplicar: (s, k, b) => { b.g *= k; } },
  { id: 'costoProd', nombre: 'Costo de producción por kg (online y B2B)', aplicar: (s, k) => { s.costos = s.costos.map((c) => ({ ...c, valor: c.valor * k })); } },
  {
    id: 'inversion',
    nombre: 'Inversión total',
    aplicar: (s, k) => {
      for (const key of ['invMaq', 'invInt', 'wc1', 'invLima', 'invAqp', 'wcLima', 'wcAqp']) s[key] *= k;
    },
  },
  { id: 'tmar', nombre: 'TMAR', aplicar: (s, k) => { s.tmar *= k; } },
  { id: 'cf1', nombre: 'Costos fijos Fase 1', aplicar: (s, k) => { s.cf1 *= k; } },
  { id: 'flete', nombre: 'Flete online por kg', aplicar: (s, k) => { s.flete *= k; } },
  { id: 'b2b', nombre: 'Ventas B2B adicionales', aplicar: (s, k, b) => { b.b2b *= k; } },
];

function vpnBase(s) {
  const ctx = nucleo(s);
  const fl = flujoEscenario(escenarioBase(s), s, ctx);
  return { total: fl.ind.total.vpn, fase1: fl.ind.fase1.vpn };
}

function calcSensibilidad(s, base) {
  const correr = (grupo, k) => {
    const s2 = { ...s, costos: s.costos.map((c) => ({ ...c })), escenarios: s.escenarios.map((e) => ({ ...e })) };
    grupo.aplicar(s2, k, escenarioBase(s2));
    return vpnBase(s2);
  };
  const filas = GRUPOS_SENSIBILIDAD.map((g) => {
    const menos = correr(g, 0.8);
    const mas = correr(g, 1.2);
    return {
      id: g.id,
      nombre: g.nombre,
      totalMenos: menos.total,
      totalMas: mas.total,
      rangoTotal: Math.abs(mas.total - menos.total),
      fase1Menos: menos.fase1,
      fase1Mas: mas.fase1,
      rangoFase1: Math.abs(mas.fase1 - menos.fase1),
    };
  });
  filas.sort((a, b) => b.rangoTotal - a.rangoTotal); // de mayor a menor rango
  return { filas, vpnTotal: base.ind.total.vpn, vpnFase1: base.ind.fase1.vpn };
}

// Busca por bisección las ventas maduras que hacen VPN = 0 en una tienda.
function equilibrioEconomicoTienda(inv, wc0, F, s) {
  const f = (S) => vpn(flujoTienda(S, inv, wc0, F, s).flujo, s.tmar);
  let lo = 0;
  let hi = 1e6;
  let k = 0;
  while (f(hi) < 0 && k++ < 40) hi *= 2;
  if (f(lo) > 0 || f(hi) < 0) return null;
  for (let it = 0; it < 200; it++) {
    const mid = (lo + hi) / 2;
    if (f(mid) < 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function calcEquilibrio(s, costos, base) {
  const apN = AP(s.tmar, s.n); // (A/P, i, n) de la hoja Factores
  const afN = AF(s.tmar, s.n);
  const p = s.pTienda;
  const cv = p * (1 - s.cmT); // cv = p × (1 − margen)
  const tienda = (id, nombre, CF, inv, wc0, ventasBase) => {
    const contrib = p - cv;
    const Q = CF / contrib; // Q = CF / (p − cv)
    const I = inv + wc0;
    const A = I * apN - wc0 * afN; // A = I (A/P) − S (A/F)
    const Q2 = (CF + A) / contrib;
    const ventasEq = Q2 * p;
    return {
      id, nombre, p, cv, contrib, CF, Q, ventasContable: Q * p, I, A, Q2, ventasEq, ventasBase,
      holgura: ventasBase / ventasEq - 1,
      economico: equilibrioEconomicoTienda(inv, wc0, CF, s),
    };
  };
  const esc = base.escenario;
  const lima = tienda('lima', 'Lima', s.FLima, s.invLima, s.wcLima, esc.lima);
  const aqp = tienda('aqp', 'Arequipa', s.FAqp, s.invAqp, s.wcAqp, esc.aqp);

  // Fase 1: A = CF + I (A/P) − S (A/F); Q = A / contribución online por kg
  const I = s.invMaq + s.invInt + s.wc1;
  const S = s.invMaq * (1 - 5 * s.dMaq) + s.wc1;
  const A = s.cf1 + I * apN - S * afN;
  const contribOn = costos.canales[1].contrib;
  const fase1 = {
    CF: s.cf1,
    I,
    S,
    A,
    contrib: contribOn,
    Q: A / contribOn,
    kgAnio1: base.fase1.online[1] / s.pOnline,
    kgAnio3: base.fase1.online[3] / s.pOnline,
    kgAnio5: base.fase1.online[5] / s.pOnline,
  };
  return { lima, aqp, fase1 };
}

function calcFactores(s, tasas, base) {
  const i = s.tmar;
  const n = s.n;
  const esc = base.escenario;
  const vOn = s.facturacion * s.shOnline;
  const A1 = vOn * (1 + esc.g); // A1 = ventas 2025 × (1 + g)
  const paGeo = PAgeo(esc.g, i, n);
  const vpTotal = A1 * paGeo;
  const vpSin = vOn * PA(i, n);
  const vpInc = vpTotal - vpSin;
  const vpAnual = sumProduct(base.fase1.online, base.pf);
  return {
    tabla: YEARS.map((t) => ({ t, pf: PF(i, t), fp: FP(i, t) })),
    pa: PA(i, n),
    ap: AP(i, n),
    af: AF(i, n),
    fa: FA(i, n),
    apPrestamo: AP(tasas.im, s.nm),
    gradiente: { g: esc.g, A1, paGeo, vpTotal, vpSin, vpInc, vpAnual, diferencia: vpInc - vpAnual },
  };
}

function calcInflacion(s, tasas, base, prestamo) {
  const filas = YEARS.map((t) => {
    const F = base.fase1.flujo[t];
    const infl = Math.pow(1 + s.f, t);
    const corriente = F * infl;
    return {
      t,
      constante: F,
      factor: infl,
      corriente,
      vpConstante: F / Math.pow(1 + s.tmar, t),
      vpCorriente: corriente / Math.pow(1 + tasas.tmarInflada, t),
    };
  });
  const vpnConstante = sum(filas.map((f) => f.vpConstante));
  const vpnCorriente = sum(filas.map((f) => f.vpCorriente));
  const cuotas = prestamo.completo.anual
    .filter((a) => a.cuota > 0)
    .map((a) => {
      const constante = a.cuota / Math.pow(1 + s.f, a.anio);
      return { anio: a.anio, corriente: a.cuota, constante, perdida: a.cuota - constante };
    });
  return { filas, vpnConstante, vpnCorriente, diferencia: vpnCorriente - vpnConstante, cuotas };
}

function calcIncremental(escenarios, base) {
  const porEscenario = escenarios.map((e) => {
    const ret = e.ind.total;
    const def = e.ind.fase1;
    const dB = ret.vpBen - def.vpBen;
    const dC = ret.vpCos - def.vpCos;
    const dBC = dC === 0 ? null : dB / dC; // ΔB/C = ΔB / ΔC
    return {
      id: e.id,
      nombre: e.nombre,
      dVPN: ret.vpn - def.vpn,
      dB,
      dC,
      dBC,
      decision: dBC === null ? '-' : dBC >= 1 ? 'Retadora (completo)' : 'Defensora (Fase 1)',
    };
  });
  const dF = base.total.map((F, t) => F - base.fase1.flujo[t]); // ΔF = F retadora − F defensora
  return {
    pf: base.pf,
    retadora: base.total,
    defensora: base.fase1.flujo,
    dF,
    porEscenario,
    tirIncremental: tirExacta(dF),
  };
}

function calcResumen(escenarios, s) {
  const originales = escenarios;
  const probs = originales.map((e) => e.escenario.prob);
  const esperado = (fn) => sumProduct(originales.map(fn), probs);
  const fila = (clave, campo = 'vpn') => ({
    valores: originales.map((e) => e.ind[clave][campo]),
    esperado: esperado((e) => e.ind[clave][campo]),
  });
  return {
    sumaProb: sum(probs),
    vpn: {
      fase1: fila('fase1'),
      lima: fila('lima'),
      aqp: fila('aqp'),
      tiendas: fila('tiendas'),
      total: fila('total'),
      totalFin: fila('totalFin'),
      fase1Fin: fila('fase1Fin'),
    },
    vae: { fase1: fila('fase1', 'vae'), tiendas: fila('tiendas', 'vae'), total: fila('total', 'vae') },
    tir: ['fase1', 'tiendas', 'total'].map((k) => ({ clave: k, valores: originales.map((e) => e.ind[k].tirInterp.tir) })),
    ter: ['fase1', 'tiendas', 'total'].map((k) => ({ clave: k, valores: originales.map((e) => e.ind[k].ter?.ter ?? null) })),
    bc: ['fase1', 'tiendas', 'total'].map((k) => ({ clave: k, valores: originales.map((e) => e.ind[k].bc) })),
    tmar: s.tmar,
  };
}

/**
 * Ejecuta el modelo completo.
 * @param {object} supuestos  Supuestos (mismas claves que supuestos.default.json, con `escenarios`).
 * @returns {object} Todas las tablas de las 14 hojas del Excel.
 */
export function calcular(supuestos) {
  const s = normalizar(supuestos);
  const ctx = nucleo(s);
  const { tasas, costos, prestamo } = ctx;

  const escenarios = s.escenarios.map((e) => flujoEscenario(e, s, ctx));
  const base = escenarios.find((e) => e.id === 'base') ?? escenarios[Math.min(1, escenarios.length - 1)];

  const factores = calcFactores(s, tasas, base);
  const equilibrio = calcEquilibrio(s, costos, base);
  const inflacion = calcInflacion(s, tasas, base, prestamo);
  const incremental = calcIncremental(escenarios, base);
  const resumen = calcResumen(escenarios, s);
  const sensibilidad = calcSensibilidad(s, base);

  // Método unitario: Ct = U × N (precisión ±20 %)
  const metodo = (nombre, N) => {
    const Ct = costos.U * N;
    return { nombre, U: costos.U, N, Ct, menos: Ct * 0.8, mas: Ct * 1.2 };
  };
  costos.metodoUnitario = [
    metodo('Costo de producción actual (2025)', costos.kg0),
    metodo('Costo de producción año 5, escenario base', base.fase1.kg[5]),
  ];

  return {
    supuestos: s,
    tasas,
    costos,
    prestamo,
    factores,
    escenarios,
    base,
    resumen,
    incremental,
    equilibrio,
    inflacion,
    sensibilidad,
  };
}

// KPI que se muestran en el inicio y en la vista previa del panel.
export function kpis(r) {
  const b = r.base.ind;
  return {
    vpnFase1: b.fase1.vpn,
    vpnTotal: b.total.vpn,
    vpnTiendas: b.tiendas.vpn,
    tirFase1: b.fase1.tirInterp.tir,
    tirTotal: b.total.tirInterp.tir,
    bcFase1: b.fase1.bc,
    bcTotal: b.total.bc,
    vpnEsperadoFase1: r.resumen.vpn.fase1.esperado,
    vpnEsperadoTotal: r.resumen.vpn.total.esperado,
    dBC: r.incremental.porEscenario.find((x) => x.id === r.base.id)?.dBC ?? null,
    recFase1: b.fase1.recuperacion,
    tmar: r.tasas.tmar,
  };
}
