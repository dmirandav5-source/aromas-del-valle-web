// Pasos 12 a 16: escenarios, análisis incremental, flujo financiero, equilibrio, gradiente y sensibilidad.
import { Formula } from '../../components/Formula.jsx';
import { FlujoTabla } from '../../components/FlujoTabla.jsx';
import { N, Tabla, TablaSimple, VerEnModelo } from '../../components/ui.jsx';
import { GraficoEquilibrio, GraficoTornado, GraficoVPNEscenarios } from '../../components/charts.jsx';
import { num, numSigno, pct, soles, solesSigno, tasaONo, tex } from '../../lib/format.js';
import { Paso, mil } from './Pasos1a6.jsx';

const p0 = (v) => pct(v, 0);

export function Paso12({ r }) {
  const esc = r.escenarios;
  const res = r.resumen;
  const termino = (p, v) => `${num(p, 2)} × ${v < 0 ? `(${num(v)})` : num(v)}`;
  const ganaF1 = esc.filter((e) => e.ind.fase1.vpn < 0).map((e) => e.nombre.toLowerCase());
  const ganaTot = esc.filter((e) => e.ind.total.vpn > 0).map((e) => e.nombre.toLowerCase());
  return (
    <Paso n={12} titulo="Los tres escenarios y el VPN esperado">
      <p>
        Se repiten los pasos 8 a 11 con los datos de cada escenario.{' '}
        {ganaF1.length ? `La Fase 1 solo pierde en el ${ganaF1.join(' y el ')}` : 'La Fase 1 gana en todos los escenarios'};{' '}
        {ganaTot.length ? `el proyecto completo solo gana en el ${ganaTot.join(' y el ')}` : 'el proyecto completo pierde en todos'}.
      </p>
      <GraficoVPNEscenarios r={r} />
      <TablaSimple
        titulo="VPN por escenario"
        cabeceras={['VPN (S/)', ...esc.map((e) => e.nombre), 'VPN esperado']}
        numericas={esc.map((_, k) => k + 1).concat(esc.length + 1)}
        filas={[
          ['Fase 1', ...res.vpn.fase1.valores, res.vpn.fase1.esperado],
          ['Tiendas', ...res.vpn.tiendas.valores, res.vpn.tiendas.esperado],
          ['Proyecto completo', ...res.vpn.total.valores, res.vpn.total.esperado],
        ]}
      />
      <p>
        <strong>VPN esperado.</strong> Cada VPN se pondera por la probabilidad de su escenario ({esc.map((e) => p0(e.escenario.prob)).join(' / ')}):
      </p>
      <Formula tex="E[VPN] = \sum p_k \cdot VPN_k" />
      <ul>
        <li>
          Fase 1: {esc.map((e) => termino(e.escenario.prob, e.ind.fase1.vpn)).join(' + ')} = <strong>{solesSigno(res.vpn.fase1.esperado)}</strong>
        </li>
        <li>
          Proyecto completo: {esc.map((e) => termino(e.escenario.prob, e.ind.total.vpn)).join(' + ')} ={' '}
          <strong>{solesSigno(res.vpn.total.esperado)}</strong>
        </li>
      </ul>
      {Math.abs(res.sumaProb - 1) > 1e-6 && (
        <p className="text-sm text-mal">Atención: las probabilidades suman {pct(res.sumaProb)}, no 100 %.</p>
      )}
      <TablaSimple
        titulo="TIR por interpolación por escenario"
        cabeceras={['TIR por interpolación', ...esc.map((e) => e.nombre)]}
        numericas={esc.map((_, k) => k + 1)}
        filas={[
          ['Fase 1', ...esc.map((e) => tasaONo(e.ind.fase1.tirInterp.tir))],
          ['Tiendas', ...esc.map((e) => tasaONo(e.ind.tiendas.tirInterp.tir))],
          ['Proyecto completo', ...esc.map((e) => tasaONo(e.ind.total.tirInterp.tir))],
        ]}
      />
      <p>
        «No existe» significa que todos los flujos {esc.some((e) => !e.ind.tiendas.tirInterp.existe) ? 'de las tiendas en el pesimista' : 'de una alternativa'} son
        negativos: no hay ninguna tasa que haga el VPN igual a cero.
      </p>
      <VerEnModelo hoja="Resumen" />
    </Paso>
  );
}

export function Paso13({ r }) {
  const inc = r.incremental;
  const b = r.base;
  const base = inc.porEscenario.find((x) => x.id === b.id);
  const ret = b.ind.total;
  const def = b.ind.fase1;
  const s = r.supuestos;
  return (
    <Paso n={13} titulo="Análisis incremental (¿vale la pena agregar las tiendas?)">
      <p>
        En el escenario base, agregar las tiendas a la Fase 1 da un <strong>ΔB/C de {num(base.dBC, 2)}</strong>,{' '}
        {base.dBC >= 1 ? 'mayor o igual que 1, así que se elige la retadora (proyecto completo).' : 'menor que 1, así que se elige la defensora (solo Fase 1).'}
      </p>
      <p>
        <strong>13.1 Las dos alternativas.</strong> La defensora es la de menor inversión: solo la Fase 1 ({mil(-def.flujos[0])}). La retadora es el
        proyecto completo ({mil(-ret.flujos[0])}). El flujo incremental es la diferencia:
      </p>
      <Formula tex="\Delta F = F_{retadora} - F_{defensora}" />
      <TablaSimple
        titulo="Flujo incremental"
        cabeceras={['Año', 'F retadora (completo)', 'F defensora (Fase 1)', 'ΔF']}
        numericas={[1, 2, 3]}
        filas={b.t.map((t) => [t, inc.retadora[t], inc.defensora[t], inc.dF[t]])}
      />
      <p>El ΔF es exactamente el flujo de las tiendas (paso 9).</p>
      <p>
        <strong>13.2 ΔB/C.</strong> ΔB es la diferencia de los VP de beneficios y ΔC, la de los VP de costos (paso 11):
      </p>
      <Formula
        tex={`\\frac{\\Delta B}{\\Delta C} = \\frac{${tex(ret.vpBen)} - ${tex(def.vpBen)}}{${tex(ret.vpCos)} - ${tex(def.vpCos)}} = \\frac{${tex(base.dB)}}{${tex(base.dC)}} = ${base.dBC === null ? '\\text{n.a.}' : tex(base.dBC, 2)}`}
      />
      <p>
        <strong>13.3 Decisión en los tres escenarios</strong>
      </p>
      <TablaSimple
        titulo="Decisión incremental por escenario"
        cabeceras={['Escenario', 'ΔVPN', 'ΔB / ΔC', 'ΔB/C', 'Se elige']}
        numericas={[1, 2, 3]}
        filas={inc.porEscenario.map((x) => [x.nombre, <N key="v" v={numSigno(x.dVPN)} />, `${num(x.dB)} / ${num(x.dC)}`, <N key="b" v={x.dBC === null ? 'n.a.' : num(x.dBC, 2)} />, x.decision])}
      />
      <p>
        La TIR del flujo incremental en la base es {tasaONo(inc.tirIncremental)},{' '}
        {inc.tirIncremental !== null && inc.tirIncremental < s.tmar ? 'muy por debajo de la TMAR' : `frente a la TMAR de ${p0(s.tmar)}`}.{' '}
        {(() => {
          const favorables = inc.porEscenario.filter((x) => x.dBC !== null && x.dBC >= 1).map((x) => x.nombre.toLowerCase());
          return favorables.length
            ? `Las tiendas solo valen la pena si se cumple el escenario ${favorables.join(' o el ')}.`
            : 'Las tiendas no valen la pena en ningún escenario.';
        })()}
      </p>
      <VerEnModelo hoja="Incremental" />
    </Paso>
  );
}

export function Paso14({ r }) {
  const s = r.supuestos;
  const b = r.base;
  const i = b.ind;
  const fc = b.financiero.completo;
  const ff = b.financiero.fase1;
  const L = r.prestamo.completo;
  const t = r.tasas;
  const infl = r.inflacion;
  const a5 = infl.filas[5];
  const cuotaAnios = L.anual.filter((a) => a.cuota > 0);
  const aporte = -fc.flujo.slice(1, cuotaAnios.length + 1).filter((x) => x < 0).reduce((a, x) => a + x, 0);
  const servicio1 = -fc.servicio[1];
  return (
    <Paso n={14} titulo="Flujo financiero, inflación y comprobación antes de impuestos">
      <p>
        Con el préstamo de {mil(s.P)}, el proyecto completo queda {Math.abs(i.totalFin.vpn) < 50000 ? 'casi en cero' : 'en'} (VPN financiero de{' '}
        {solesSigno(i.totalFin.vpn)}). Si solo se financia la Fase 1 con {mil(s.P1)}, su VPN {i.fase1Fin.vpn > i.fase1.vpn ? 'sube' : 'cambia'} a{' '}
        <strong>{solesSigno(i.fase1Fin.vpn)}</strong>.
      </p>
      <p>
        <strong>14.1 Flujo financiero.</strong> Al flujo económico se suma el préstamo en el año 0 y se restan las cuotas, descontando su escudo fiscal
        (interés × T). Como la cuota está fija en soles corrientes, se pasa a soles constantes dividiendo entre (1 + f)<sup>t</sup>:
      </p>
      <Formula tex="F^{fin}_t = F_t - \frac{\text{cuota}_t - \text{interés}_t \cdot T}{(1 + f)^t}" />
      <p>
        Año 1 del proyecto completo: {num(b.total[1])} − ({num(L.anual[0].cuota)} − {num(L.anual[0].interes * s.T)}) / {num(1 + s.f, 2)} ={' '}
        {num(b.total[1])} − {num(servicio1)} = <strong>{num(fc.flujo[1])}</strong>.
      </p>
      <FlujoTabla
        titulo="Flujo financiero"
        concepto="Año"
        extra={{ titulo: `VPN a ${p0(s.tmar)}` }}
        filas={[
          { label: `Completo + préstamo ${mil(s.P)}`, vals: fc.flujo, extra: <strong><N v={numSigno(i.totalFin.vpn)} /></strong> },
          { label: `Fase 1 + préstamo ${mil(s.P1)}`, vals: ff.flujo, extra: <strong><N v={numSigno(i.fase1Fin.vpn)} /></strong> },
        ]}
      />
      <p>
        <strong>Por qué sube el VPN con deuda:</strong> el préstamo cuesta {pct(t.kdNeto, 2)} después de impuestos (≈ {p0((t.kdNeto - s.f) / (1 + s.f))}{' '}
        real), {t.kdNeto < s.tmar ? 'menos' : 'más'} que la TMAR de {p0(s.tmar)}. Pero la decisión de inversión se toma con el{' '}
        <strong>flujo económico</strong>: la deuda no vuelve buenas a las tiendas, solo traslada el problema a la caja de los años 1 a{' '}
        {cuotaAnios.length}. En esos años el proyecto completo necesitaría {mil(aporte)} adicionales de los dueños para pagar las cuotas.
      </p>
      <p>
        <strong>14.2 Inflación.</strong> Los flujos están en soles constantes y se descuentan a la tasa real. Si se inflaran a {p0(s.f)} anual, habría
        que descontarlos a la TMAR inflada ({pct(t.tmarInflada, 2)}), y el VPN sería el mismo. Comprobación con el año 5 de la Fase 1:
      </p>
      <ul>
        <li>
          En soles corrientes: {num(a5.constante)} × ({num(1 + s.f, 2)})^5 = {num(a5.corriente)}.
        </li>
        <li>
          A la TMAR inflada: {num(a5.corriente)} / ({num(1 + t.tmarInflada, 4)})^5 = {num(a5.vpCorriente)}.
        </li>
        <li>
          A la TMAR real: {num(a5.constante)} / ({num(1 + s.tmar, 2)})^5 = {num(a5.vpConstante)}. Es el mismo valor.
        </li>
      </ul>
      <p>
        Sumando los seis años, ambas formas dan VPN = {soles(infl.vpnCorriente)} (hoja <em>Inflacion</em>).
      </p>
      <p>
        <strong>14.3 Comprobación antes de impuestos.</strong> Si no se restan impuestos, hay que descontar a la TMAR antes de impuestos (
        {pct(t.tmarAntes)}, paso 5.8). La Fase 1 da un VPN de {solesSigno(i.fase1AI.vpn)} y el proyecto completo, {solesSigno(i.totalAI.vpn)}.{' '}
        {Math.sign(i.fase1AI.vpn) === Math.sign(i.fase1.vpn) && Math.sign(i.totalAI.vpn) === Math.sign(i.total.vpn)
          ? 'La conclusión no cambia.'
          : 'Ojo: con estos supuestos la conclusión antes de impuestos difiere de la económica.'}
      </p>
      <VerEnModelo hoja="Inflacion" />
    </Paso>
  );
}

export function Paso15({ r }) {
  const s = r.supuestos;
  const eq = r.equilibrio;
  const L = eq.lima;
  const A = eq.aqp;
  const f = eq.fase1;
  const ap = r.factores.ap;
  const af = r.factores.af;
  const supera = (t) => t.ventasBase >= t.ventasEq;
  const alcanzaEco = (t) => t.economico !== null && t.ventasBase >= t.economico;
  const anioEq = [1, 3, 5].find((k) => f[`kgAnio${k}`] >= f.Q);
  return (
    <Paso n={15} titulo="Punto de equilibrio Q = CF / (p − cv)">
      <p>
        Lima necesita vender ≈ <strong>{mil(L.ventasEq)} al año</strong> para cubrir sus costos fijos y recuperar su inversión, y el escenario base le
        asigna {mil(L.ventasBase)}. Arequipa necesita ≈ {mil(A.ventasEq)} y la base le asigna {mil(A.ventasBase)}.
      </p>
      <p>
        <strong>15.1 Equilibrio contable de las tiendas.</strong> De los pasos 1 y 3: p = {soles(L.p)}, cv = {num(L.p)} × (1 − {p0(s.cmT)}) ={' '}
        {soles(L.cv, 2)}, p − cv = {soles(L.contrib, 2)} por kg.
      </p>
      <Formula
        tex={`Q_{Lima} = \\frac{CF}{p - cv} = \\frac{${tex(L.CF)}}{${tex(L.contrib, 2)}} = ${tex(L.Q)} \\text{ kg} \\;\\Rightarrow\\; ${tex(L.Q)} \\times ${tex(L.p)} = S/\\ ${tex(L.ventasContable)}`}
      />
      <p>
        Arequipa: Q = {num(A.CF)} / {num(A.contrib, 2)} = {num(A.Q)} kg, es decir, {soles(A.ventasContable)} al año.
      </p>
      <p>
        <strong>15.2 Equilibrio con recuperación de la inversión.</strong> Igual que en el ejemplo de la excavadora, la inversión se convierte en un
        costo anual equivalente y se suma a los costos fijos. En Lima, I = {num(s.invLima)} + {num(s.wcLima)} = {soles(L.I)} y el valor de rescate es el
        capital de trabajo recuperado, S = {soles(s.wcLima)}:
      </p>
      <Formula
        tex={`A = I\\,(A/P,\\ ${tex(s.tmar * 100, 0)}\\%,\\ ${s.n}) - S\\,(A/F,\\ ${tex(s.tmar * 100, 0)}\\%,\\ ${s.n}) = ${tex(L.I)} \\times ${tex(ap, 5)} - ${tex(s.wcLima)} \\times ${tex(af, 5)} = ${tex(L.A)}`}
      />
      <Formula
        tex={`Q = \\frac{CF + A}{p - cv} = \\frac{${tex(L.CF)} + ${tex(L.A)}}{${tex(L.contrib, 2)}} = ${tex(L.Q2)} \\text{ kg} \\;\\Rightarrow\\; S/\\ ${tex(L.ventasEq)}`}
      />
      <TablaSimple
        titulo="Equilibrio de las tiendas"
        cabeceras={['Tienda', 'CF', 'A', 'Q contable', 'Q con recuperación', 'Ventas de equilibrio', 'Ventas base (madura)']}
        numericas={[1, 2, 3, 4, 5, 6]}
        filas={[L, A].map((t) => [t.nombre, num(t.CF), num(t.A), `${num(t.Q)} kg`, `${num(t.Q2)} kg`, soles(t.ventasEq), soles(t.ventasBase)])}
      />
      <GraficoEquilibrio eq={eq} />
      <p>
        <strong>
          Por qué {supera(A) && !alcanzaEco(A) ? 'Arequipa supera su equilibrio y aun así tiene VPN negativo' : 'el equilibrio simple no basta'}:
        </strong>{' '}
        el cálculo anterior supone que la tienda vende el 100 % desde el año 1. Con la maduración ({p0(s.ramp[0])} y {p0(s.ramp[1])} en los años 1 y 2) y
        los impuestos, el equilibrio real sube a ≈ {L.economico === null ? '—' : mil(L.economico)} en Lima y{' '}
        {A.economico === null ? '—' : mil(A.economico)} en Arequipa.{' '}
        {!alcanzaEco(L) && !alcanzaEco(A)
          ? 'Ninguna de las dos lo alcanza en el escenario base.'
          : alcanzaEco(L) && alcanzaEco(A)
            ? 'Las dos lo alcanzan en el escenario base.'
            : `Solo ${alcanzaEco(L) ? 'Lima' : 'Arequipa'} lo alcanza en el escenario base.`}{' '}
        <span className="text-sm text-suave">
          (Equilibrio económico calculado por bisección sobre el modelo completo: {soles(L.economico)} y {soles(A.economico)}.)
        </span>
      </p>
      <p>
        <strong>15.3 Equilibrio de la Fase 1.</strong> I = {soles(f.I)}; S = {num(s.invMaq * (1 - 5 * s.dMaq))} (maquinaria) + {num(s.wc1)} (capital de
        trabajo) = {soles(f.S)}.
      </p>
      <Formula
        tex={`A = ${tex(f.CF)} + ${tex(f.I)} \\times ${tex(ap, 5)} - ${tex(f.S)} \\times ${tex(af, 5)} = S/\\ ${tex(f.A)} \\text{ por año}`}
      />
      <Formula tex={`Q = \\frac{${tex(f.A)}}{${tex(f.contrib, 2)}} = ${tex(f.Q)} \\text{ kg online incrementales por año}`} />
      <p>
        En el escenario base se venden {num(f.kgAnio1)} kg online adicionales el año 1, {num(f.kgAnio3)} kg el año 3 y {num(f.kgAnio5)} kg el año 5.{' '}
        {anioEq ? `La Fase 1 pasa su equilibrio desde el año ${anioEq}, aun sin contar el aporte del B2B.` : 'La Fase 1 no alcanza su equilibrio solo con el online.'}
      </p>
      <VerEnModelo hoja="Equilibrio" />
    </Paso>
  );
}

export function Paso16({ r }) {
  const s = r.supuestos;
  const g = r.factores.gradiente;
  const sens = r.sensibilidad;
  const vOn = r.costos.ventas2025.online;
  const filaG = sens.filas.find((f) => f.id === 'g');
  const tiendas = sens.filas.filter((f) => ['cfTiendas', 'cmT', 'ventasTiendas'].includes(f.id));
  const minTiendas = Math.min(...tiendas.map((f) => f.rangoTotal));
  return (
    <Paso n={16} titulo="Gradiente geométrico y sensibilidad">
      <p>
        <strong>16.1 Valor del crecimiento online con gradiente geométrico.</strong> Las ventas online crecen a una tasa constante g = {p0(g.g)}, así
        que su valor presente sale de una sola fórmula. Las ventas del año 1 son A1 = {num(vOn)} × {num(1 + g.g, 2)} = {soles(g.A1)}.
      </p>
      <Formula
        tex={`(P/A,\\ g,\\ i,\\ n) = \\frac{1 - \\left(\\frac{1+g}{1+i}\\right)^n}{i - g} = \\frac{1 - (${tex(1 + g.g, 2)}/${tex(1 + s.tmar, 2)})^${s.n}}{${tex(s.tmar, 2)} - ${tex(g.g, 2)}} = ${tex(g.paGeo, 4)}`}
      />
      <ul>
        <li>
          VP de las ventas online con proyecto = {num(g.A1)} × {num(g.paGeo, 4)} = {soles(g.vpTotal)}.
        </li>
        <li>
          VP sin proyecto = {num(vOn)} × (P/A, {p0(s.tmar)}, {s.n}) = {num(vOn)} × {num(r.factores.pa, 4)} = {soles(g.vpSin)}.
        </li>
        <li>
          VP de las ventas incrementales = {num(g.vpTotal)} − {num(g.vpSin)} = <strong>{soles(g.vpInc)}</strong>. Coincide con sumar año por año las
          ventas del paso 8 × (P/F).
        </li>
      </ul>
      <p>
        Con {pct(r.costos.cmOn)} de margen, ese crecimiento aporta ≈ {mil(g.vpInc * r.costos.cmOn)} de contribución en valor presente, antes de costos
        fijos e impuestos. Es el motor de la Fase 1.
      </p>
      <p>
        <strong>16.2 Sensibilidad.</strong> Se mueve un supuesto a la vez ±20 % y se recalcula el VPN del proyecto completo. Las tres variables de las
        tiendas mueven el VPN en más de {mil(Math.floor(minTiendas / 1e5) * 1e5)}; solo con ellas, o con un online que crezca 20 % más, el VPN total
        pasa a positivo.
      </p>
      <GraficoTornado sens={sens} />
      <Tabla titulo="Sensibilidad (escenario base)">
        <thead>
          <tr>
            <th>Variable</th>
            <th className="num">VPN total −20 %</th>
            <th className="num">VPN total +20 %</th>
            <th className="num">Rango</th>
            <th className="num">VPN Fase 1 −20 %</th>
            <th className="num">VPN Fase 1 +20 %</th>
            <th className="num">Rango</th>
          </tr>
        </thead>
        <tbody>
          {sens.filas.map((f) => (
            <tr key={f.id}>
              <td>{f.nombre}</td>
              <td className="num"><N v={f.totalMenos} /></td>
              <td className="num"><N v={f.totalMas} /></td>
              <td className="num">{num(f.rangoTotal)}</td>
              <td className="num"><N v={f.fase1Menos} /></td>
              <td className="num"><N v={f.fase1Mas} /></td>
              <td className="num">{num(f.rangoFase1)}</td>
            </tr>
          ))}
        </tbody>
      </Tabla>
      <p>
        La Fase 1 sola {filaG.fase1Menos > 0 ? 'resiste' : 'es sensible al crecimiento online'}: incluso con un crecimiento online 20 % menor, su VPN{' '}
        {filaG.fase1Menos > 0 ? 'sigue en' : 'baja a'} {filaG.fase1Menos > 0 ? '+' : '−'}S/ {num(Math.abs(filaG.fase1Menos) / 1000)} mil.
      </p>
      <VerEnModelo hoja="Sensibilidad" />
    </Paso>
  );
}
