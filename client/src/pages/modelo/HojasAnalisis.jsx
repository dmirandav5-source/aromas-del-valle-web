// Hojas Incremental, Equilibrio, Inflacion y Sensibilidad.
import { FlujoTabla } from '../../components/FlujoTabla.jsx';
import { N, TablaSimple } from '../../components/ui.jsx';
import { GraficoEquilibrio, GraficoTornado } from '../../components/charts.jsx';
import { num, pct, tasaONo } from '../../lib/format.js';

export function HojaIncremental({ r }) {
  const inc = r.incremental;
  const esc = inc.porEscenario;
  return (
    <>
      <p className="text-sm text-suave">
        Proyecto completo (retadora) vs. solo Fase 1 (defensora). ΔF = F retadora − F defensora. Si ΔB/C ≥ 1 se elige la retadora; si ΔB/C &lt; 1, la
        defensora.
      </p>
      <FlujoTabla
        titulo="Escenario base"
        concepto="Escenario base"
        filas={[
          { label: 'Factor (P/F, TMAR, t)', vals: inc.pf, dec: 6 },
          { label: 'F retadora: proyecto completo', vals: inc.retadora },
          { label: 'F defensora: solo Fase 1', vals: inc.defensora },
          { label: 'ΔF = retadora − defensora', vals: inc.dF, tipo: 'total' },
        ]}
      />
      <TablaSimple
        titulo="Indicador incremental"
        cabeceras={['Indicador incremental', ...esc.map((x) => x.nombre)]}
        numericas={esc.map((_, k) => k + 1)}
        filas={[
          ['ΔVPN = VPN retadora − VPN defensora', ...esc.map((x) => <N key={x.id} v={x.dVPN} dec={2} />)],
          ['ΔB = VP beneficios retadora − defensora', ...esc.map((x) => <N key={x.id} v={x.dB} dec={2} />)],
          ['ΔC = VP costos retadora − defensora', ...esc.map((x) => <N key={x.id} v={x.dC} dec={2} />)],
          ['ΔB/C = ΔB / ΔC', ...esc.map((x) => <N key={x.id} v={x.dBC === null ? 'n.a.' : num(x.dBC, 4)} />)],
          ['Decisión', ...esc.map((x) => x.decision)],
        ]}
      />
      <TablaSimple
        titulo="TIR del flujo incremental"
        cabeceras={['TIR del flujo incremental (escenario base)', 'Valor']}
        numericas={[1]}
        filas={[['TIR (exacta)', tasaONo(inc.tirIncremental, 2)]]}
      />
      <p className="text-sm text-suave">
        Lectura: el flujo incremental es exactamente el de las tiendas. Si su TIR es menor que la TMAR, agregar las tiendas destruye valor.
      </p>
    </>
  );
}

export function HojaEquilibrio({ r }) {
  const e = r.equilibrio;
  const s = r.supuestos;
  const { lima: L, aqp: A, fase1: f } = e;
  return (
    <>
      <p className="text-sm text-suave">
        Primero el equilibrio contable; después se suma el costo anual equivalente de la inversión: I (A/P, i, n) − S (A/F, i, n).
      </p>
      <TablaSimple
        titulo="Tiendas nuevas"
        cabeceras={['Tiendas nuevas', 'Lima', 'Arequipa', 'Comentario']}
        numericas={[1, 2]}
        filas={[
          ['Precio p (S/ por kg)', num(L.p, 2), num(A.p, 2), 'Mismo precio que en Cusco'],
          ['Costo variable cv = p × (1 − margen de contribución)', num(L.cv, 2), num(A.cv, 2), `Margen de contribución supuesto de ${pct(s.cmT, 0)}`],
          ['Contribución unitaria p − cv', num(L.contrib, 2), num(A.contrib, 2), ''],
          ['Costos fijos anuales CF', num(L.CF), num(A.CF), ''],
          ['Q contable = CF / (p − cv)  (kg por año)', num(L.Q, 2), num(A.Q, 2), ''],
          ['Ventas de equilibrio contable (S/ por año)', num(L.ventasContable, 2), num(A.ventasContable, 2), ''],
          ['Inversión I (acondicionamiento + capital de trabajo)', num(L.I), num(A.I), 'Valor de rescate S = capital de trabajo recuperado'],
          [`Costo anual equivalente A = I (A/P, i, ${s.n}) − S (A/F, i, ${s.n})`, num(L.A, 2), num(A.A, 2), `S = capital de trabajo inicial que se recupera en el año 5`],
          ['Q con recuperación de inversión = (CF + A) / (p − cv)', num(L.Q2, 2), num(A.Q2, 2), 'kg por año'],
          ['Ventas de equilibrio con recuperación (S/ por año)', num(L.ventasEq, 2), num(A.ventasEq, 2), ''],
          ['Ventas maduras supuestas, escenario base', num(L.ventasBase), num(A.ventasBase), ''],
          ['Holgura sobre el equilibrio con recuperación', <N key="l" v={pct(L.holgura, 2)} />, <N key="a" v={pct(A.holgura, 2)} />, 'Positivo = el escenario base lo supera'],
          ['Equilibrio con maduración, impuestos y capital de trabajo (VPN = 0)', num(L.economico), num(A.economico), 'Búsqueda por bisección sobre el modelo completo (se recalcula sola)'],
        ]}
      />
      <GraficoEquilibrio eq={e} />
      <TablaSimple
        titulo="Fase 1 (online)"
        cabeceras={['Fase 1 (online)', 'Valor', 'Comentario']}
        numericas={[1]}
        filas={[
          ['Costos fijos incrementales CF', num(f.CF), ''],
          ['Inversión I (incluye capital de trabajo inicial)', num(f.I), ''],
          ['Valor de rescate S (maquinaria + capital de trabajo inicial)', num(f.S), 'Valor en libros de la maquinaria al año 5 + capital de trabajo recuperado'],
          [`Costo anual equivalente = CF + I (A/P, i, ${s.n}) − S (A/F, i, ${s.n})`, num(f.A, 2), 'Mismo método que el ejemplo de la excavadora'],
          ['Contribución por kg online (p − cv)', num(f.contrib, 2), 'S/ por kg'],
          ['Q = costo anual equivalente / (p − cv)  (kg online incrementales por año)', num(f.Q, 2), 'Sin contar el aporte del B2B ni los ahorros (conservador)'],
          ['Kg online incrementales, base año 1', num(f.kgAnio1, 2), ''],
          ['Kg online incrementales, base año 3', num(f.kgAnio3, 2), ''],
          ['Kg online incrementales, base año 5', num(f.kgAnio5, 2), ''],
        ]}
      />
    </>
  );
}

export function HojaInflacion({ r }) {
  const inf = r.inflacion;
  const s = r.supuestos;
  return (
    <>
      <p className="text-sm text-suave">
        Fase 1, escenario base. Mismo procedimiento que el ejemplo de los apuntes: el VP es igual si se usan flujos constantes con la tasa real o flujos
        inflados con la tasa inflada.
      </p>
      <TablaSimple
        titulo="Tasas"
        cabeceras={['Tasa', 'Valor']}
        numericas={[1]}
        filas={[
          ['TMAR real (i)', pct(s.tmar, 2)],
          ['Inflación (f)', pct(s.f, 2)],
          ['TMAR inflada if = i + f + i·f', pct(r.tasas.tmarInflada, 2)],
        ]}
      />
      <TablaSimple
        titulo="Soles constantes vs. corrientes"
        cabeceras={['Año', 'Flujo en soles constantes', '(1 + f)^t', 'Flujo en soles corrientes', 'VP constante a i real', 'VP corriente a if']}
        numericas={[1, 2, 3, 4, 5]}
        totales={[6, 7]}
        filas={[
          ...inf.filas.map((x) => [x.t, <N key="a" v={x.constante} dec={2} />, num(x.factor, 6), <N key="b" v={x.corriente} dec={2} />, <N key="c" v={x.vpConstante} dec={2} />, <N key="d" v={x.vpCorriente} dec={2} />]),
          ['VPN', '', '', '', <N key="e" v={inf.vpnConstante} dec={2} />, <N key="f" v={inf.vpnCorriente} dec={2} />],
          ['Diferencia (debe ser 0)', '', '', '', '', num(inf.diferencia, 2)],
        ]}
      />
      <TablaSimple
        titulo="Cuota del préstamo en soles constantes"
        cabeceras={['Año', `Cuota anual del préstamo S/ ${num(s.P / 1000)} mil (soles corrientes)`, 'Cuota en soles constantes = cuota / (1 + f)^t', 'Pérdida de valor real de la cuota']}
        numericas={[1, 2, 3]}
        filas={inf.cuotas.map((c) => [c.anio, num(c.corriente, 2), num(c.constante, 2), num(c.perdida, 2)])}
      />
      <p className="text-sm text-suave">
        La cuota es fija en soles corrientes: con inflación pesa menos cada año en términos reales. Por eso el flujo financiero convierte las cuotas a
        soles constantes antes de descontar a la TMAR real.
      </p>
    </>
  );
}

export function HojaSensibilidad({ r }) {
  const sens = r.sensibilidad;
  return (
    <>
      <p className="text-sm text-suave">
        Escenario base, cada supuesto ±20 %. Valores obtenidos moviendo un supuesto a la vez y recalculando el modelo completo. A diferencia del Excel
        (donde esta tabla está escrita a mano), aquí se recalcula sola. Ordenada por rango, de mayor a menor.
      </p>
      <TablaSimple
        titulo="Sensibilidad"
        cabeceras={['Variable', 'VPN total con −20 %', 'VPN total con +20 %', 'Rango VPN total', 'VPN Fase 1 con −20 %', 'VPN Fase 1 con +20 %', 'Rango VPN Fase 1']}
        numericas={[1, 2, 3, 4, 5, 6]}
        filas={sens.filas.map((f) => [f.nombre, f.totalMenos, f.totalMas, f.rangoTotal, f.fase1Menos, f.fase1Mas, f.rangoFase1])}
      />
      <TablaSimple
        titulo="VPN base"
        cabeceras={['VPN base', 'Valor']}
        numericas={[1]}
        filas={[
          ['VPN base: proyecto completo', <N key="t" v={sens.vpnTotal} dec={2} />],
          ['VPN base: Fase 1', <N key="f" v={sens.vpnFase1} dec={2} />],
        ]}
      />
      <GraficoTornado sens={sens} />
      <GraficoTornado sens={sens} campo="fase1" />
    </>
  );
}
