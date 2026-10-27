// Hojas Prestamo y Flujo_Pesimista / Flujo_Base / Flujo_Optimista.
import { FlujoTabla } from '../../components/FlujoTabla.jsx';
import { Acordeon, N, Tabla, TablaSimple } from '../../components/ui.jsx';
import { GraficoFlujo, GraficoPrestamo } from '../../components/charts.jsx';
import { anios, num, pct, soles, tasaONo } from '../../lib/format.js';

function Cronograma({ L, titulo }) {
  return (
    <Tabla titulo={titulo}>
      <thead>
        <tr>
          <th className="num">Mes</th>
          <th className="num">Año</th>
          <th className="num">Saldo inicial</th>
          <th className="num">Interés</th>
          <th className="num">Amortización</th>
          <th className="num">Cuota</th>
          <th className="num">Saldo final</th>
        </tr>
      </thead>
      <tbody>
        {L.meses.map((m) => (
          <tr key={m.mes}>
            <td className="num">{m.mes}</td>
            <td className="num">{m.anio}</td>
            <td className="num">{num(m.saldoInicial, 2)}</td>
            <td className="num">{num(m.interes, 2)}</td>
            <td className="num">{num(m.amort, 2)}</td>
            <td className="num">{num(m.cuota, 2)}</td>
            <td className="num">{num(Math.abs(m.saldoFinal) < 0.005 ? 0 : m.saldoFinal, 2)}</td>
          </tr>
        ))}
      </tbody>
    </Tabla>
  );
}

export function HojaPrestamo({ r }) {
  const s = r.supuestos;
  const { completo: L, fase1: L1 } = r.prestamo;
  const t1 = `Préstamo S/ ${num(s.P / 1000)} mil (proyecto completo)`;
  const t2 = `Préstamo S/ ${num(s.P1 / 1000)} mil (solo Fase 1)`;
  return (
    <>
      <p className="text-sm text-suave">
        Cuota constante A = P (A/P, i_m, n). i_m = (1 + {num(s.tea, 3)})^(1/12) − 1 = {pct(r.tasas.im, 4)}; n = {s.nm} meses. El interés de cada mes =
        saldo × i_m.
      </p>
      <Tabla titulo="Resumen anual">
        <thead>
          <tr>
            <th>Resumen anual</th>
            <th className="num">Interés</th>
            <th className="num">Amortización</th>
            <th className="num">Cuota</th>
            <th className="num">Interés</th>
            <th className="num">Amortización</th>
            <th className="num">Cuota</th>
          </tr>
          <tr>
            <th />
            <th colSpan={3} className="text-center">{t1}</th>
            <th colSpan={3} className="text-center">{t2}</th>
          </tr>
        </thead>
        <tbody>
          {L.anual.map((a, k) => (
            <tr key={a.anio}>
              <td>Año {a.anio}</td>
              <td className="num">{num(a.interes, 2)}</td>
              <td className="num">{num(a.amort, 2)}</td>
              <td className="num">{num(a.cuota, 2)}</td>
              <td className="num">{num(L1.anual[k].interes, 2)}</td>
              <td className="num">{num(L1.anual[k].amort, 2)}</td>
              <td className="num">{num(L1.anual[k].cuota, 2)}</td>
            </tr>
          ))}
          <tr className="total">
            <td>Total</td>
            <td className="num">{num(L.totalInteres, 2)}</td>
            <td className="num">{num(L.totalAmort, 2)}</td>
            <td className="num">{num(L.totalCuota, 2)}</td>
            <td className="num">{num(L1.totalInteres, 2)}</td>
            <td className="num">{num(L1.totalAmort, 2)}</td>
            <td className="num">{num(L1.totalCuota, 2)}</td>
          </tr>
        </tbody>
      </Tabla>
      <GraficoPrestamo prestamo={L} titulo={`Préstamo de S/ ${num(s.P / 1000)} mil`} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div>
          <h3 className="mt-4 text-lg font-semibold">{t1}</h3>
          <Cronograma L={L} titulo={`Cronograma: ${t1}`} />
        </div>
        <div>
          <h3 className="mt-4 text-lg font-semibold">{t2}</h3>
          <Cronograma L={L1} titulo={`Cronograma: ${t2}`} />
        </div>
      </div>
    </>
  );
}

export function HojaFlujo({ r, id }) {
  const e = r.escenarios.find((x) => x.id === id) ?? r.base;
  const s = r.supuestos;
  const f = e.fase1;
  const L = e.lima;
  const A = e.aqp;
  const fc = e.financiero.completo;
  const ff = e.financiero.fase1;
  const tienda = (T, nombre, inv, wc) => [
    { label: `Fase 2 · tienda ${nombre}`, tipo: 'seccion' },
    { label: `Ventas tienda ${nombre}`, vals: T.ventas },
    { label: 'Contribución', vals: T.contrib },
    { label: '(−) Costos fijos (alquiler, personal)', vals: T.cf },
    { label: '(−) Depreciación', vals: T.dep },
    { label: 'Utilidad operativa (EBIT)', vals: T.ebit },
    { label: '(−) Impuesto a la Renta (T × EBIT)', vals: T.imp },
    { label: 'Utilidad operativa después de impuestos', vals: T.uodi },
    { label: '(+) Depreciación', vals: T.depMas },
    { label: '(−) Inversión en acondicionamiento', vals: T.inversion },
    { label: `Capital de trabajo requerido = MAX(inicial; ${pct(s.wcPct, 0)} de ventas)`, vals: T.ctReq },
    { label: '(−) Inversión en capital de trabajo (variación)', vals: T.ctVar },
    { label: '(+) Recuperación capital de trabajo', vals: T.ctRec },
    { label: `FLUJO ECONÓMICO TIENDA ${nombre.toUpperCase()}`, vals: T.flujo, tipo: 'total' },
  ];
  const fin = (F, P, nombre, flujoNombre) => [
    { label: `(+) Préstamo — ${nombre} (S/ ${num(P / 1000)} mil)`, vals: F.prestamo },
    { label: '(−) Cuotas pagadas (soles corrientes)', vals: F.cuotas },
    { label: '(+) Escudo fiscal de intereses = interés × T', vals: F.escudo },
    { label: 'Servicio de deuda neto en soles constantes', vals: F.servicio },
    { label: `FLUJO FINANCIERO — ${flujoNombre} (S/ ${num(P / 1000)} mil)`, vals: F.flujo, tipo: 'total' },
  ];
  return (
    <>
      <p className="text-sm text-suave">
        Flujo de caja incremental — escenario {e.nombre}. Soles constantes de 2025, después de impuestos. VPN = Σ F_t × (P/F, TMAR, t).
      </p>
      <FlujoTabla
        titulo={`Flujo de caja, escenario ${e.nombre}`}
        filas={[
          { label: 'Factor (P/F, TMAR, t)', vals: e.pf, dec: 6 },
          { label: 'Factor (P/F, TMAR antes de impuestos, t)', vals: e.pfAI, dec: 6 },
          { label: 'Fase 1', tipo: 'seccion' },
          { label: 'Fase 1 · Ventas online incrementales', vals: f.online },
          { label: 'Fase 1 · Kg vendidos totales (actual + incremental)', vals: f.kg },
          { label: 'Fase 1 · Ventas B2B incrementales', vals: f.b2b },
          { label: 'Contribución online', vals: f.contribOnline },
          { label: 'Contribución B2B', vals: f.contribB2B },
          { label: 'Ahorros en costo (merma y empaque)', vals: f.ahorros },
          { label: '(−) Costos fijos incrementales', vals: f.cf },
          { label: 'EBITDA', vals: f.ebitda },
          { label: '(−) Depreciación y amortización', vals: f.dep },
          { label: 'Utilidad operativa (EBIT)', vals: f.ebit },
          { label: '(−) Impuesto a la Renta (T × EBIT)', vals: f.imp },
          { label: 'Utilidad operativa después de impuestos', vals: f.uodi },
          { label: '(+) Depreciación', vals: f.depMas },
          { label: '(−) Inversión fija y diferida', vals: f.inversion },
          { label: `Capital de trabajo requerido = MAX(inicial; ${pct(s.wcPct, 0)} de ventas)`, vals: f.ctReq },
          { label: '(−) Inversión en capital de trabajo (variación)', vals: f.ctVar },
          { label: '(+) Recuperación capital de trabajo', vals: f.ctRec },
          { label: '(+) Valor de rescate maquinaria (S) = valor en libros', vals: f.rescate },
          { label: 'FLUJO ECONÓMICO FASE 1', vals: f.flujo, tipo: 'total' },
          { label: 'Flujo Fase 1 antes de impuestos', vals: f.flujoAI },
          ...tienda(L, 'Lima'),
          ...tienda(A, 'Arequipa'),
          { label: 'Consolidado', tipo: 'seccion' },
          { label: 'Flujo económico tiendas (Lima + Arequipa)', vals: e.tiendas },
          { label: 'FLUJO ECONÓMICO PROYECTO COMPLETO', vals: e.total, tipo: 'total' },
          { label: 'Flujo proyecto completo antes de impuestos', vals: e.totalAI },
          { label: 'Flujo financiero (con préstamo). Las cuotas son nominales: se pasan a soles constantes con ÷ (1 + f)^t', tipo: 'seccion' },
          { label: 'Factor de deflación 1 / (1 + f)^t', vals: e.deflactor, dec: 6 },
          ...fin(fc, s.P, 'proyecto completo', 'proyecto completo'),
          ...fin(ff, s.P1, 'solo Fase 1', 'solo Fase 1'),
        ]}
      />

      <h3 className="mt-8 text-xl font-semibold">Indicadores</h3>
      <TablaSimple
        titulo="Indicadores"
        cabeceras={['Flujo', 'VPN = Σ F_t (P/F)', `VAE = VPN (A/P, i, ${s.n})`, 'VP beneficios', 'VP costos', 'B/C', 'Recuperación descontada (años)']}
        numericas={[1, 2, 3, 4, 5, 6]}
        filas={e.indicadores.map((x) => [x.nombre, <N key="v" v={x.vpn} dec={2} />, <N key="a" v={x.vae} dec={2} />, num(x.vpBen, 2), num(x.vpCos, 2), x.bc === null ? 'n.a.' : num(x.bc, 4), anios(x.recuperacion)])}
      />
      <h3 className="mt-6 text-xl font-semibold">TIR por interpolación</h3>
      <TablaSimple
        titulo="TIR por interpolación"
        cabeceras={['TIR por interpolación', 'i1', 'VPN1', 'i2', 'VPN2', 'TIR = i1 + VPN1/(VPN1 − VPN2)·(i2 − i1)', 'TIR exacta (comparación)']}
        numericas={[1, 2, 3, 4, 5, 6]}
        filas={e.indicadores.map((x) => {
          const t = x.tirInterp;
          return [
            x.nombre,
            t.existe ? pct(t.i1, 0) : '-',
            t.existe ? <N key="1" v={t.vpn1} dec={2} /> : '-',
            t.existe && t.i2 !== null ? pct(t.i2, 0) : '-',
            t.existe && t.vpn2 !== null ? <N key="2" v={t.vpn2} dec={2} /> : '-',
            tasaONo(t.tir, 2),
            tasaONo(x.tirExacta, 2),
          ];
        })}
      />
      <p className="text-sm text-suave">
        Se interpola entre las dos tasas de la tabla auxiliar (pasos de 5 %) donde el VPN cambia de signo. «No existe»: todos los flujos tienen el mismo
        signo.
      </p>
      <h3 className="mt-6 text-xl font-semibold">TER (TIR modificada)</h3>
      <TablaSimple
        titulo="TER"
        cabeceras={['TER (TIR modificada)', 'VP flujos negativos a i_b', 'VF flujos positivos a TMAR', 'TER = (VF/VP)^(1/n) − 1']}
        numericas={[1, 2, 3]}
        filas={e.indicadores.filter((x) => x.ter).map((x) => [x.nombre, num(x.ter.vpNeg, 2), num(x.ter.vfPos, 2), tasaONo(x.ter.ter, 2)])}
      />
      <p className="text-sm text-suave">
        i_b = costo real del préstamo ({pct(r.tasas.ib, 2)}, hoja Tasas); los flujos positivos se reinvierten a la TMAR.
      </p>

      <Acordeon titulo="Auxiliar: VPN a distintas tasas (para interpolar la TIR)">
        <Tabla titulo="VPN a distintas tasas">
          <thead>
            <tr>
              <th>Flujo</th>
              {e.indicadores[0].tirInterp.grid.map((g) => (
                <th key={g.i} className="num">{pct(g.i, 0)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {e.indicadores.map((x) => (
              <tr key={x.clave}>
                <td className="whitespace-nowrap">{x.nombre}</td>
                {x.tirInterp.grid.map((g) => (
                  <td key={g.i} className="num"><N v={g.vpn} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </Tabla>
      </Acordeon>
      <Acordeon titulo="Auxiliar: flujo descontado acumulado y año de recuperación">
        <Tabla titulo="Flujo descontado acumulado">
          <thead>
            <tr>
              <th>Flujo</th>
              {e.t.map((t) => (
                <th key={t} className="num">Año {t}</th>
              ))}
              <th className="num">Recuperación</th>
            </tr>
          </thead>
          <tbody>
            {e.indicadores.map((x) => (
              <tr key={x.clave}>
                <td className="whitespace-nowrap">{x.nombre}</td>
                {x.acumulado.map((a, t) => (
                  <td key={t} className="num"><N v={a} /></td>
                ))}
                <td className="num">{anios(x.recuperacion)}</td>
              </tr>
            ))}
          </tbody>
        </Tabla>
      </Acordeon>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GraficoFlujo ind={e.ind.fase1} titulo={`Fase 1 — ${e.nombre}`} />
        <GraficoFlujo ind={e.ind.total} titulo={`Proyecto completo — ${e.nombre}`} />
      </div>
      <p className="text-xs text-tenue">VPN total del escenario: {soles(e.ind.total.vpn)}.</p>
    </>
  );
}
