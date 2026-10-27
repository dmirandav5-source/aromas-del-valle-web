// Hojas Resumen, Paso_a_paso, Supuestos, Tasas, Factores y Costos_Margenes.
import { Link } from 'react-router-dom';
import { CAMPOS, CAMPOS_ESCENARIO, GRUPOS, RAMP } from '@aromas/shared/meta.js';
import { N, Tabla, TablaSimple } from '../../components/ui.jsx';
import { GraficoCostoKg } from '../../components/charts.jsx';
import { anios, num, pct, soles, tasaONo } from '../../lib/format.js';

const t2 = (v) => pct(v, 2);
const p4 = (v) => pct(v, 4);

function TablaEscenarios({ titulo, cab, filas, esperado = true, fmt = (v) => <N v={v} /> }) {
  return (
    <Tabla titulo={titulo}>
      <thead>
        <tr>
          <th>{titulo}</th>
          {cab.map((c) => (
            <th key={c} className="num">{c}</th>
          ))}
          {esperado && <th className="num">VPN esperado</th>}
        </tr>
      </thead>
      <tbody>
        {filas.map(([label, fila]) => (
          <tr key={label}>
            <td>{label}</td>
            {fila.valores.map((v, k) => (
              <td key={k} className="num">{fmt(v)}</td>
            ))}
            {esperado && <td className="num font-semibold">{fmt(fila.esperado)}</td>}
          </tr>
        ))}
      </tbody>
    </Tabla>
  );
}

export function HojaResumen({ r }) {
  const s = r.supuestos;
  const res = r.resumen;
  const cab = r.escenarios.map((e) => e.nombre);
  const nombres = { fase1: 'Fase 1 (maquinaria, empaque, online, B2B)', tiendas: 'Tiendas (Fase 2)', total: 'Proyecto completo' };
  const inc = r.incremental.porEscenario.find((x) => x.id === r.base.id);
  return (
    <>
      <p className="text-sm text-suave">Todos los valores salen de las hojas de cálculo. Para cambiar un supuesto, usa el panel de supuestos.</p>
      <TablaEscenarios
        titulo={`VPN a TMAR real ${pct(s.tmar, 0)} (S/)`}
        cab={cab}
        filas={[
          [nombres.fase1, res.vpn.fase1],
          ['Tienda Lima', res.vpn.lima],
          ['Tienda Arequipa', res.vpn.aqp],
          [nombres.tiendas, res.vpn.tiendas],
          [nombres.total, res.vpn.total],
          [`Proyecto completo — financiero (préstamo ${soles(s.P / 1000)} mil)`, res.vpn.totalFin],
          [`Solo Fase 1 — financiero (préstamo ${soles(s.P1 / 1000)} mil)`, res.vpn.fase1Fin],
        ]}
      />
      <TablaEscenarios
        titulo={`VAE = VPN (A/P, ${pct(s.tmar, 0)}, ${s.n}) (S/ por año)`}
        cab={cab}
        filas={[
          [nombres.fase1, res.vae.fase1],
          [nombres.tiendas, res.vae.tiendas],
          [nombres.total, res.vae.total],
        ]}
      />
      {[
        ['TIR por interpolación', res.tir, (v) => tasaONo(v)],
        ['TER (TIR modificada)', res.ter, (v) => tasaONo(v)],
        ['Relación B/C', res.bc, (v) => (v === null ? 'n.a.' : num(v, 4))],
      ].map(([titulo, filas, f]) => (
        <TablaSimple
          key={titulo}
          titulo={titulo}
          cabeceras={[titulo, ...cab]}
          numericas={cab.map((_, k) => k + 1)}
          filas={filas.map((x) => [nombres[x.clave], ...x.valores.map(f)])}
        />
      ))}
      <TablaSimple
        titulo="Tasas"
        cabeceras={['Tasas', 'Valor']}
        numericas={[1]}
        filas={[
          ['Costo de la deuda después de impuestos Kd(1 − T)', p4(r.tasas.kdNeto)],
          ['Costo del patrimonio (CAPM)', p4(r.tasas.ke)],
          ['CPPC nominal', p4(r.tasas.cppc)],
          ['CPPC real', p4(r.tasas.cppcReal)],
          ['TMAR real', p4(r.tasas.tmar)],
          ['TMAR inflada', p4(r.tasas.tmarInflada)],
          ['TMAR antes de impuestos', p4(r.tasas.tmarAntes)],
        ]}
      />
      <TablaSimple
        titulo={`Préstamo: A = P (A/P, i_m, ${s.nm})`}
        cabeceras={[`Préstamo: A = P (A/P, i_m, ${s.nm})`, `S/ ${num(s.P / 1000)} mil`, `S/ ${num(s.P1 / 1000)} mil`]}
        numericas={[1, 2]}
        filas={[
          ['Tasa efectiva mensual', p4(r.tasas.im), p4(r.tasas.im)],
          ['Cuota mensual', num(r.prestamo.completo.cuota, 2), num(r.prestamo.fase1.cuota, 2)],
          ['Cuota anual', num(r.prestamo.completo.anual[0].cuota, 2), num(r.prestamo.fase1.anual[0].cuota, 2)],
          ['Intereses totales', num(r.prestamo.completo.totalInteres, 2), num(r.prestamo.fase1.totalInteres, 2)],
        ]}
      />
      <TablaSimple
        titulo="Punto de equilibrio Q = CF/(p − cv)"
        cabeceras={['Punto de equilibrio Q = CF/(p − cv)', 'Lima', 'Arequipa']}
        numericas={[1, 2]}
        filas={[
          ['Ventas de equilibrio contable (S/ por año)', num(r.equilibrio.lima.ventasContable, 2), num(r.equilibrio.aqp.ventasContable, 2)],
          ['Ventas de equilibrio con recuperación de la inversión (S/ por año)', num(r.equilibrio.lima.ventasEq, 2), num(r.equilibrio.aqp.ventasEq, 2)],
          ['Ventas maduras escenario base', num(r.equilibrio.lima.ventasBase), num(r.equilibrio.aqp.ventasBase)],
        ]}
      />
      <TablaSimple
        titulo="Análisis incremental"
        cabeceras={['Análisis incremental (base)', 'ΔB/C', 'Decisión']}
        numericas={[1]}
        filas={[['ΔB/C proyecto completo vs. Fase 1', inc.dBC === null ? 'n.a.' : num(inc.dBC, 4), inc.decision]]}
      />
    </>
  );
}

export function HojaPasoAPaso({ r }) {
  const b = r.base.ind;
  const e = r.equilibrio;
  const filas = [
    ['1', 'Costo unitario de producción (U)', 'Suma de la tabla de costos', num(r.costos.U, 2), 'Costos_Margenes'],
    ['2', 'Costo anual de producción (método unitario)', 'Ct = U × N', num(r.costos.metodoUnitario[0].Ct, 2), 'Costos_Margenes'],
    ['3', 'Contribución por kg en tienda', 'p − cv', num(r.costos.canales[0].contrib, 2), 'Costos_Margenes'],
    ['3', 'Contribución por kg online', 'p − (costo + flete + pasarela + marketing)', num(r.costos.canales[1].contrib, 2), 'Costos_Margenes'],
    ['3', 'Contribución por kg B2B', 'p (1 − comisión) − costo', num(r.costos.canales[2].contrib, 2), 'Costos_Margenes'],
    ['4', 'Volumen vendido 2025 (kg)', 'Ventas del canal ÷ precio por kg', num(r.costos.kg0, 2), 'Costos_Margenes'],
    ['4', 'Uso promedio de la capacidad actual', `kg vendidos ÷ (${r.supuestos.cap0} kg × ${r.supuestos.dias} días)`, t2(r.costos.usoCapacidad), 'Costos_Margenes'],
    ['5', 'Tasa efectiva mensual del préstamo', 'i_m = (1 + i_a)^(1/12) − 1', p4(r.tasas.im), 'Tasas'],
    ['5', 'Costo de la deuda después de impuestos', "K'd = Kd (1 − T)", p4(r.tasas.kdNeto), 'Tasas'],
    ['5', 'Costo del patrimonio (CAPM)', 'Re = Rf + β (Rm − Rf)', p4(r.tasas.ke), 'Tasas'],
    ['5', 'CPPC nominal', 'CPPC = Wd·Kd(1 − T) + We·Ke', p4(r.tasas.cppc), 'Tasas'],
    ['5', 'CPPC real', 'i = (if − f) / (1 + f)', p4(r.tasas.cppcReal), 'Tasas'],
    ['5', 'TMAR inflada', 'if = i + f + i·f', p4(r.tasas.tmarInflada), 'Tasas'],
    ['5', 'TMAR antes de impuestos', 'TMAR / (1 − T)', p4(r.tasas.tmarAntes), 'Tasas'],
    ['6', `Cuota mensual del préstamo de S/ ${num(r.supuestos.P / 1000)} mil`, `A = P (A/P, i_m, ${r.supuestos.nm})`, num(r.prestamo.completo.cuota, 2), 'Prestamo'],
    ['8', 'Ventas online incrementales año 1', 'V_2025 × [(1 + g)^t − 1]', num(r.base.fase1.online[1], 2), 'Flujo_Base'],
    ['8', 'Flujo económico Fase 1, año 5', 'UODI + depreciación − inversión − ΔCT + rescate', num(r.base.fase1.flujo[5], 2), 'Flujo_Base'],
    ['10', 'VPN Fase 1', 'VPN = Σ F_t (P/F, i, t)', num(b.fase1.vpn, 2), 'Flujo_Base'],
    ['10', 'VPN tiendas', 'VPN = Σ F_t (P/F, i, t)', num(b.tiendas.vpn, 2), 'Flujo_Base'],
    ['10', 'VPN proyecto completo', 'VPN = Σ F_t (P/F, i, t)', num(b.total.vpn, 2), 'Flujo_Base'],
    ['11', 'VAE Fase 1', 'VAE = VPN (A/P, i, n)', num(b.fase1.vae, 2), 'Flujo_Base'],
    ['11', 'TIR Fase 1 (interpolación)', 'TIR = i1 + VPN1/(VPN1 − VPN2)·(i2 − i1)', tasaONo(b.fase1.tirInterp.tir, 2), 'Flujo_Base'],
    ['11', 'TIR proyecto completo (interpolación)', 'TIR = i1 + VPN1/(VPN1 − VPN2)·(i2 − i1)', tasaONo(b.total.tirInterp.tir, 2), 'Flujo_Base'],
    ['11', 'TER Fase 1', 'TER = (VF_pos / VP_neg)^(1/n) − 1', tasaONo(b.fase1.ter.ter, 2), 'Flujo_Base'],
    ['11', 'B/C Fase 1', 'B/C = VP beneficios / VP costos', num(b.fase1.bc, 4), 'Flujo_Base'],
    ['11', 'B/C proyecto completo', 'B/C = VP beneficios / VP costos', num(b.total.bc, 4), 'Flujo_Base'],
    ['11', 'Recuperación descontada Fase 1 (años)', 'Año en que el VP acumulado pasa a positivo', anios(b.fase1.recuperacion), 'Flujo_Base'],
    ['12', 'VPN esperado Fase 1', 'Σ probabilidad × VPN del escenario', num(r.resumen.vpn.fase1.esperado, 2), 'Resumen'],
    ['12', 'VPN esperado proyecto completo', 'Σ probabilidad × VPN del escenario', num(r.resumen.vpn.total.esperado, 2), 'Resumen'],
    ['13', 'ΔB/C proyecto completo vs. Fase 1', 'ΔB/C = ΔB / ΔC', num(r.incremental.porEscenario.find((x) => x.id === r.base.id)?.dBC, 4), 'Incremental'],
    ['14', 'VPN financiero proyecto completo', 'Flujo económico − servicio de deuda en soles constantes', num(b.totalFin.vpn, 2), 'Flujo_Base'],
    ['14', 'VPN financiero solo Fase 1', 'Flujo económico − servicio de deuda en soles constantes', num(b.fase1Fin.vpn, 2), 'Flujo_Base'],
    ['14', 'VPN Fase 1 en soles corrientes a TMAR inflada', 'Σ F_t (1 + f)^t / (1 + if)^t', num(r.inflacion.vpnCorriente, 2), 'Inflacion'],
    ['15', 'Ventas de equilibrio Lima con recuperación de inversión', 'Q = (CF + A) / (p − cv) × p', num(e.lima.ventasEq, 2), 'Equilibrio'],
    ['15', 'Ventas de equilibrio Arequipa con recuperación de inversión', 'Q = (CF + A) / (p − cv) × p', num(e.aqp.ventasEq, 2), 'Equilibrio'],
    ['15', 'Kg online de equilibrio de la Fase 1', 'Q = [CF + I(A/P) − S(A/F)] / (p − cv)', num(e.fase1.Q, 2), 'Equilibrio'],
    ['16', 'VP de las ventas online incrementales (gradiente)', 'A1 (P/A, g, i, n) − V (P/A, i, n)', num(r.factores.gradiente.vpInc, 2), 'Factores'],
  ];
  return (
    <>
      <p className="text-sm text-suave">
        Ruta de la solución paso a paso (escenario base). Cada fila es un cálculo del documento; el resultado cambia si cambias un supuesto.
      </p>
      <TablaSimple
        titulo="Paso a paso"
        cabeceras={['Paso', 'Qué se calcula', 'Fórmula del curso', 'Resultado', 'Hoja con el detalle']}
        numericas={[3]}
        filas={filas.map(([p, q, f, v, h]) => [p, q, f, <N key="v" v={v} />, <Link key="h" to={`/modelo/${h}`}>{h}</Link>])}
      />
    </>
  );
}

export function HojaSupuestos({ r }) {
  const s = r.supuestos;
  const fmt = (c, v) =>
    c.unidad === 'pct' ? pct(v, Math.abs(v * 100 - Math.round(v * 100)) > 1e-9 ? 1 : 0) : c.unidad === 'num' ? num(v, 2) : num(v, Number.isInteger(v) ? 0 : 2);
  const celda = (origen, contenido) => (
    <span className={`inline-block rounded px-1.5 font-semibold text-casoAzul ${origen === 'propio' ? 'bg-propio' : ''}`}>{contenido}</span>
  );
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-suave">
          {celda('caso', 'Texto azul')} = dato de entrada (editable). {celda('propio', 'Fondo amarillo')} = supuesto propio (no viene del caso). Montos
          en soles constantes de 2025.
        </p>
        <Link to="/supuestos" className="btn-primario">Editar en el panel de supuestos →</Link>
      </div>
      {GRUPOS.map((g) => {
        if (g.id === 'escenarios') {
          return (
            <TablaSimple
              key={g.id}
              titulo={g.titulo}
              cabeceras={[g.titulo, ...s.escenarios.map((e) => e.nombre)]}
              numericas={s.escenarios.map((_, k) => k + 1)}
              filas={CAMPOS_ESCENARIO.map((c) => [c.label, ...s.escenarios.map((e) => celda('propio', fmt(c, e[c.key])))])}
            />
          );
        }
        const filas =
          g.id === 'costos'
            ? [...s.costos.map((c) => [c.rubro, celda('caso', num(c.valor, 2)), 'S/ por kg', 'Caso: tabla de costos por kg tostado (2025)']), ['Costo unitario total (U)', num(r.costos.U, 2), '', `Suma de la tabla = ${num(r.costos.U, 2)}`]]
            : CAMPOS.filter((c) => c.grupo === g.id).map((c) => [c.label, celda(c.origen, fmt(c, s[c.key])), ['soles', 'pct', 'num'].includes(c.unidad) ? '' : c.unidad === 'solesKg' ? 'S/ por kg' : c.unidad, c.fuente]);
        if (g.id === 'capital') filas.push(['Peso del patrimonio (We)', pct(1 - s.Wd, 0), '', 'We = 1 − Wd']);
        if (g.id === 'actual') {
          const v = r.costos.ventas2025;
          filas.splice(4, 0, ['Ventas tienda Cusco', num(v.tienda), '', 'Facturación × participación'], ['Ventas online', num(v.online), '', 'Facturación × participación'], ['Ventas B2B', num(v.b2b), '', 'Facturación × participación']);
        }
        if (g.id === 'fase2') {
          filas.splice(4, 0, ['Inversión total del proyecto (comprobación)', num(s.invMaq + s.invInt + s.wc1 + s.invLima + s.invAqp + s.wcLima + s.wcAqp), '', 'Debe sumar S/ 480,000, como dice el caso']);
          filas.push([
            RAMP.label,
            <span key="ramp">
              {s.ramp.map((x, k) => (
                <span key={k}>
                  {k ? ' · ' : ''}
                  {celda('propio', pct(x, 0))}
                </span>
              ))}
            </span>,
            'Año 1 a 5',
            RAMP.fuente,
          ]);
        }
        return <TablaSimple key={g.id} titulo={g.titulo} cabeceras={[g.titulo, 'Valor', 'Unidad', 'Fuente / comentario']} numericas={[1]} filas={filas} />;
      })}
      <p className="text-sm text-suave">Probabilidades: supuesto propio para el VPN esperado. El B2B crece linealmente hasta el año 3.</p>
    </>
  );
}

export function HojaTasas({ r }) {
  const t = r.tasas;
  return (
    <>
      <p className="text-sm text-suave">Fórmulas del curso. Todo se recalcula desde los supuestos.</p>
      <TablaSimple
        titulo="Tasas"
        cabeceras={['Concepto', 'Fórmula', 'Valor', 'Lectura']}
        numericas={[2]}
        filas={[
          ['Tasa efectiva mensual del préstamo', 'i_m = (1 + i_a)^(1/12) − 1', p4(t.im), `Convierte la TEA de ${pct(r.supuestos.tea)} en tasa mensual`],
          ['Costo de la deuda después de impuestos', "K'd = Kd (1 − T)", p4(t.kdNeto), 'El interés es deducible: la deuda cuesta menos de lo que dice su tasa'],
          ['Costo del patrimonio (CAPM)', 'Re = Rf + β (Rm − Rf)', p4(t.ke), 'Rendimiento mínimo de una empresa cotizada del sector'],
          ['CPPC (WACC), nominal', 'CPPC = Wd·Kd(1 − T) + We·Ke', p4(t.cppc), 'Costo promedio de las fuentes de financiamiento'],
          ['CPPC en términos reales', 'i = (if − f) / (1 + f)', p4(t.cppcReal), 'Se despeja la tasa real de if = i + f + i·f'],
          ['TMAR real usada en el modelo', 'Supuesto', p4(t.tmar), 'Debe ser ≥ CPPC real; la diferencia es la prima por riesgo del proyecto'],
          ['Prima de riesgo implícita', 'TMAR − CPPC real', p4(t.primaRiesgo), 'Riesgo de PYME, tiendas nuevas y menor liquidez'],
          ['TMAR inflada (a valor de mercado)', 'if = i + f + i·f', p4(t.tmarInflada), 'Para descontar flujos en soles corrientes'],
          ['TMAR antes de impuestos', 'TMAR antes = TMAR después / (1 − T)', p4(t.tmarAntes), 'Para descontar flujos antes de impuestos'],
          ['Costo real del préstamo (tasa i_b para la TER)', 'i = (Kd − f) / (1 + f)', p4(t.ib), 'Tasa a la que se financian los flujos negativos'],
          ['Verificación TMAR ≥ CPPC real', '', <span key="v" className={t.cumple ? 'text-bien' : 'text-mal'}>{t.cumple ? 'Cumple' : 'No cumple'}</span>, ''],
        ]}
      />
      <p className="text-sm text-suave">
        Nota: el CAPM usa la beta de empresas cotizadas; una PYME familiar con tiendas nuevas tiene más riesgo, por eso la TMAR ({pct(t.tmar, 0)}) supera
        al CPPC. No se usa el costo de capital por dividendos (Re = D1/P + g) porque la empresa no cotiza ni reparte dividendos regulares.
      </p>
    </>
  );
}

export function HojaFactores({ r }) {
  const f = r.factores;
  const s = r.supuestos;
  const g = f.gradiente;
  return (
    <>
      <p className="text-sm text-suave">
        Factores de interés compuesto a la TMAR real: (P/F), (F/P), (P/A), (A/P), (A/F), (F/A) y gradiente geométrico (P/A, g, i, n).
      </p>
      <TablaSimple
        titulo="Factores por año"
        cabeceras={['t (años)', '(P/F, i, t) = 1/(1+i)^t', '(F/P, i, t) = (1+i)^t']}
        numericas={[1, 2]}
        filas={f.tabla.map((x) => [x.t, num(x.pf, 6), num(x.fp, 6)])}
      />
      <TablaSimple
        titulo={`Factor de serie uniforme (n = ${s.n})`}
        cabeceras={[`Factor de serie uniforme (n = ${s.n})`, 'Fórmula', 'Valor']}
        numericas={[2]}
        filas={[
          ['(P/A, i, n)', '[(1+i)^n − 1] / [i(1+i)^n]', num(f.pa, 6)],
          ['(A/P, i, n)', 'i(1+i)^n / [(1+i)^n − 1]', num(f.ap, 6)],
          ['(A/F, i, n)', 'i / [(1+i)^n − 1]', num(f.af, 6)],
          ['(F/A, i, n)', '[(1+i)^n − 1] / i', num(f.fa, 6)],
          [`(A/P, i_m, ${s.nm}) del préstamo`, 'i_m(1+i_m)^n / [(1+i_m)^n − 1]', num(f.apPrestamo, 6)],
        ]}
      />
      <p className="text-sm text-suave">
        i = TMAR real; n = horizonte ({s.n} años). Ejemplo: {num(s.invMaq + s.invInt + s.wc1)} (A/P, {pct(s.tmar, 0)}, {s.n}) = costo anual equivalente de
        la inversión de la Fase 1.
      </p>
      <TablaSimple
        titulo="Gradiente geométrico: ventas online (escenario base)"
        cabeceras={['Gradiente geométrico: ventas online (escenario base)', 'Fórmula', 'Valor']}
        numericas={[2]}
        filas={[
          ['Ventas online del año 1 (A1)', 'A1 = ventas 2025 × (1 + g)', num(g.A1, 2)],
          ['(P/A, g, i, n)', '[1 − ((1+g)/(1+i))^n] / (i − g)', num(g.paGeo, 6)],
          ['VP de las ventas online totales', 'A1 × (P/A, g, i, n)', num(g.vpTotal, 2)],
          ['VP de las ventas online sin proyecto', 'Ventas 2025 × (P/A, i, n)', num(g.vpSin, 2)],
          ['VP de las ventas online incrementales', 'VP total − VP sin proyecto', num(g.vpInc, 2)],
          ['Mismo valor calculado año por año en el flujo', 'Σ ventas_t × (P/F, i, t)', num(g.vpAnual, 2)],
          ['Diferencia (comprobación)', 'Debe ser 0', num(g.diferencia, 2)],
        ]}
      />
    </>
  );
}

export function HojaCostos({ r }) {
  const c = r.costos;
  return (
    <>
      <TablaSimple
        titulo="Costo por kg"
        cabeceras={['Rubro', 'S/ por kg', '% calculado', '% que dice el caso']}
        numericas={[1, 2, 3]}
        totales={[c.rubros.length]}
        filas={[
          ...c.rubros.map((x) => [x.rubro, num(x.valor, 2), pct(x.pct, 2), pct(x.pctCaso, 1)]),
          ['Costo total', num(c.U, 2), '100.00 %', pct(c.pctCasoTotal, 1)],
          ['Café verde + merma (% del costo)', '', pct(c.verdeMermaPct, 2), pct(c.verdeMermaCaso, 1)],
        ]}
      />
      <p className="text-sm text-suave">
        Los porcentajes del caso suman {pct(c.pctCasoTotal)}, no 100 %: no cuadran con los soles. El modelo usa los soles por kg, que sí suman{' '}
        {soles(c.U, 2)}.
      </p>
      <TablaSimple
        titulo="Margen por canal"
        cabeceras={['Canal', 'Precio p (S/ por kg)', 'Costo prod.', 'Flete', 'Pasarela', 'Marketing', 'Comisión B2B', 'Costo variable cv', 'Contribución p − cv', 'Margen %']}
        numericas={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
        filas={c.canales.map((x) => [x.nombre, num(x.p, 2), num(x.costo, 2), num(x.flete, 2), num(x.pasarela, 2), num(x.mkt, 2), num(x.comision, 2), num(x.cv, 2), num(x.contrib, 2), pct(x.margen, 2)])}
      />
      <p className="text-sm text-suave">Tienda: margen antes de alquiler y personal. El 42 % del caso incluye esos costos fijos no detallados.</p>
      <TablaSimple
        titulo="Volumen 2025"
        cabeceras={['Canal', 'Ventas 2025 (S/)', 'Precio por kg', 'Kg por año']}
        numericas={[1, 2, 3]}
        totales={[3]}
        filas={[...c.volumen.map((v) => [v.nombre, num(v.ventas), num(v.precio, 2), num(v.kg, 2)]), ['Total', num(c.ventasVolumenTotal), '', num(c.kg0, 2)]]}
      />
      <TablaSimple
        titulo="Capacidad"
        cabeceras={['Capacidad', 'Valor']}
        numericas={[1]}
        filas={[
          ['Capacidad actual (kg/año)', num(c.capActualAnual)],
          ['Uso promedio de la capacidad actual', pct(c.usoCapacidad, 2)],
          ['Capacidad con máquina nueva (kg/año)', num(c.capNuevaAnual)],
          ['Capacidad nueva ÷ volumen actual', num(c.capNuevaSobreActual, 2)],
        ]}
      />
      <TablaSimple
        titulo="Método unitario: Ct = U × N"
        cabeceras={['Método unitario: Ct = U × N', 'U (S/ por kg)', 'N (kg por año)', 'Ct (S/ por año)', 'Ct − 20 %', 'Ct + 20 %']}
        numericas={[1, 2, 3, 4, 5]}
        filas={c.metodoUnitario.map((m) => [m.nombre, num(m.U, 2), num(m.N, 2), num(m.Ct, 2), num(m.menos, 2), num(m.mas, 2)])}
      />
      <p className="text-sm text-suave">Precisión de ±20 %, aceptable en una estimación preliminar (como en el ejemplo de las tuberías).</p>
      <GraficoCostoKg costos={c} />
    </>
  );
}
