// Pasos 7 a 11: escenarios, flujos de caja, VPN e indicadores.
import { Formula } from '../../components/Formula.jsx';
import { FlujoTabla } from '../../components/FlujoTabla.jsx';
import { N, Tabla, TablaSimple, VerEnModelo } from '../../components/ui.jsx';
import { GraficoFlujo } from '../../components/charts.jsx';
import { anios, num, numSigno, pct, soles, solesSigno, tasaONo, tex, texPct } from '../../lib/format.js';
import { Paso, mil } from './Pasos1a6.jsx';

const p0 = (v) => pct(v, 0);
const signoPct = (v) => `${v >= 0 ? '+' : ''}${p0(v)}`;

export function Paso7({ r }) {
  const s = r.supuestos;
  const esc = r.escenarios;
  const b = r.base;
  const vOn = r.costos.ventas2025.online;
  const vB = r.costos.ventas2025.b2b;
  return (
    <Paso n={7} titulo="Escenarios de demanda (Pregunta 4)">
      <p>
        Se arman tres escenarios alrededor del dato del caso: el segmento de especialidad crece 12–15 % al año. Este paso va antes del flujo de caja
        porque lo alimenta.
      </p>
      <Tabla titulo="Escenarios de demanda">
        <thead>
          <tr>
            <th>Variable</th>
            {esc.map((e) => (
              <th key={e.id} className="num">
                {e.nombre}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Crecimiento anual de las ventas online (g)</td>
            {esc.map((e) => <td key={e.id} className="num">{p0(e.escenario.g)}</td>)}
          </tr>
          <tr>
            <td>Ventas B2B adicionales al año 3 (sobre {soles(vB)})</td>
            {esc.map((e) => <td key={e.id} className="num">{signoPct(e.escenario.b2b)}</td>)}
          </tr>
          <tr>
            <td>Ventas anuales de la tienda de Lima ya madura</td>
            {esc.map((e) => <td key={e.id} className="num">{mil(e.escenario.lima)}</td>)}
          </tr>
          <tr>
            <td>Ventas anuales de la tienda de Arequipa ya madura</td>
            {esc.map((e) => <td key={e.id} className="num">{mil(e.escenario.aqp)}</td>)}
          </tr>
          <tr>
            <td>Probabilidad</td>
            {esc.map((e) => <td key={e.id} className="num">{p0(e.escenario.prob)}</td>)}
          </tr>
        </tbody>
      </Tabla>
      <p>
        <strong>Por qué son razonables (con datos del caso):</strong>
      </p>
      <ul>
        <li>
          <strong>Pesimista:</strong> solo el 8–12 % del mercado paga más de S/ 40 por 250 g; en Lima el cliente lo ve «caro» y hay marcas
          consolidadas con mejor distribución. Un sol más débil encarece el empaque y la maquinaria importados.
        </li>
        <li>
          <strong>Base:</strong> el online crece algo más que el mercado ({p0(b.escenario.g)}) porque ya tiene 4,200 clientes recurrentes y 41 % de
          suscripciones, y la máquina nueva elimina los pedidos rechazados en temporada alta.
        </li>
        <li>
          <strong>Optimista:</strong> una alianza logística con cooperativas baja el flete, se cierran contratos trimestrales con cafeterías y los
          microlotes se venden a S/ 55–65 por 250 g.
        </li>
      </ul>
      <p>
        <strong>Cómo se usan en el modelo:</strong>
      </p>
      <ul>
        <li>
          Ventas online incrementales del año t = {num(vOn)} × [(1 + g)<sup>t</sup> − 1]. Ejemplo, base año 1: {num(vOn)} × {num(b.escenario.g, 2)} ={' '}
          {soles(b.fase1.online[1])}.
        </li>
        <li>
          Las ventas B2B adicionales crecen en línea recta hasta el año 3: en la base, {num(vB)} × {p0(b.escenario.b2b)} × 1/3 ={' '}
          {soles(b.fase1.b2b[1])} el año 1 y {soles(b.fase1.b2b[3])} desde el año 3.
        </li>
        <li>
          Las tiendas venden {p0(s.ramp[0])} de sus ventas maduras el año 1, {p0(s.ramp[1])} el año 2 y{' '}
          {s.ramp[2] === s.ramp[3] && s.ramp[3] === s.ramp[4] ? `${p0(s.ramp[2])} desde el año 3` : `${p0(s.ramp[2])}, ${p0(s.ramp[3])} y ${p0(s.ramp[4])} en los años 3 a 5`}.
        </li>
      </ul>
      <VerEnModelo hoja="Supuestos" />
    </Paso>
  );
}

export function Paso8({ r }) {
  const s = r.supuestos;
  const b = r.base;
  const f = b.fase1;
  const c = r.costos;
  const g = b.escenario.g;
  const vOn = c.ventas2025.online;
  const fase1 = s.invMaq + s.invInt + s.wc1;
  return (
    <Paso n={8} titulo="Flujo de caja de la Fase 1 (escenario base)">
      <p>
        El flujo es <strong>incremental</strong>: solo cuenta lo que cambia por hacer la Fase 1. Las ventas de 2025 ya existen sin proyecto y no se
        suman.
      </p>
      <p>
        <strong>8.1 Inversión de la Fase 1 ({soles(fase1)}, desglose supuesto):</strong> maquinaria de tostado y empaque {soles(s.invMaq)} (se
        deprecia {p0(s.dMaq)} al año); plataforma online, CRM y marketing inicial {soles(s.invInt)} (se amortiza {p0(s.dInt)} al año); capital de
        trabajo inicial {soles(s.wc1)}.
      </p>
      <p>
        <strong>8.2 Flujo línea por línea (S/)</strong>
      </p>
      <FlujoTabla
        titulo="Flujo de caja de la Fase 1, escenario base"
        filas={[
          { label: 'Ventas online incrementales', vals: f.online },
          { label: 'Ventas B2B incrementales', vals: f.b2b },
          { label: `Contribución online (× ${pct(c.cmOn)})`, vals: f.contribOnline },
          { label: `Contribución B2B (× ${pct(c.cmB)})`, vals: f.contribB2B },
          { label: `Ahorros de merma y empaque (kg × ${soles(s.ahMerma + s.ahEmp, 2)})`, vals: f.ahorros },
          { label: '(−) Costos fijos', vals: f.cf },
          { label: '(−) Depreciación y amortización', vals: f.dep },
          { label: 'Utilidad operativa (EBIT)', vals: f.ebit, tipo: 'total' },
          { label: `(−) Impuesto = ${pct(s.T)} × EBIT`, vals: f.imp },
          { label: 'Utilidad después de impuestos', vals: f.uodi },
          { label: '(+) Depreciación (no es salida de caja)', vals: f.depMas },
          { label: '(−) Inversión fija y diferida', vals: f.inversion },
          { label: '(−) Inversión en capital de trabajo', vals: f.ctVar },
          { label: '(+) Recuperación del capital de trabajo', vals: f.ctRec },
          { label: '(+) Valor de rescate de la maquinaria', vals: f.rescate },
          { label: 'Flujo económico Fase 1', vals: f.flujo, tipo: 'total' },
        ]}
      />
      <p>
        <strong>8.3 Cómo se obtiene cada línea</strong>
      </p>
      <ul>
        <li>
          <strong>Ventas online:</strong> {num(vOn)} × [({num(1 + g, 2)})<sup>t</sup> − 1]. Año 2: {num(vOn)} × ({num(Math.pow(1 + g, 2), 4)} − 1) ={' '}
          {num(f.online[2])}.
        </li>
        <li>
          <strong>Contribución:</strong> ventas × margen del paso 3. Año 1 online: {num(f.online[1])} × {pct(c.cmOn)} = {num(f.contribOnline[1])}.
        </li>
        <li>
          <strong>Ahorros:</strong> kg totales × ({num(s.ahMerma, 2)} + {num(s.ahEmp, 2)}). Los {soles(s.ahMerma, 2)} vienen de bajar la merma un
          punto: 28.50 × (1/0.84 − 1/0.85) ÷ (1/0.84). Los {soles(s.ahEmp, 2)} vienen de cambiar a empaque local (de S/ 4.90 a ≈ S/ 4.00).
        </li>
        <li>
          <strong>Depreciación:</strong> {num(s.invMaq)} × {p0(s.dMaq)} + {num(s.invInt)} × {p0(s.dInt)} = {num(-f.dep[1])} al año.
        </li>
        <li>
          <strong>Impuesto:</strong> {pct(s.T)} × EBIT.{' '}
          {f.ebit[1] < 0
            ? `En el año 1 el EBIT es negativo y el impuesto sale positivo (+${num(f.imp[1])}): la pérdida reduce el impuesto que la empresa ya paga por sus otras utilidades.`
            : 'Si el EBIT fuera negativo, el impuesto saldría positivo: la pérdida reduce el impuesto que la empresa ya paga por sus otras utilidades.'}
        </li>
        <li>
          <strong>Capital de trabajo:</strong> cada año se necesita el mayor entre {soles(s.wc1)} y el {p0(s.wcPct)} de las ventas incrementales; solo
          se invierte la diferencia. Año 3: {p0(s.wcPct)} × ({num(f.online[3])} + {num(f.b2b[3])}) = {num((f.online[3] + f.b2b[3]) * s.wcPct)}, menos{' '}
          {num(f.ctReq[2])} del año 2 = {num(-f.ctVar[3])}. Al final del año 5 se recupera todo.
        </li>
        <li>
          <strong>Valor de rescate:</strong> la maquinaria lleva 5 de sus {num(1 / s.dMaq)} años de vida, así que vale {num(s.invMaq)} × (1 − 5 ×{' '}
          {p0(s.dMaq)}) = {num(f.rescate[5])} en libros.
        </li>
        <li>
          <strong>Flujo:</strong> utilidad después de impuestos + depreciación − inversiones + recuperaciones. Año 1: {num(f.uodi[1])} +{' '}
          {num(f.depMas[1])} − {num(-f.ctVar[1])} = {num(f.flujo[1])}.
        </li>
      </ul>
      <VerEnModelo hoja="Flujo_Base" />
    </Paso>
  );
}

export function Paso9({ r }) {
  const s = r.supuestos;
  const b = r.base;
  const L = b.lima;
  const A = b.aqp;
  const fase2 = s.invLima + s.invAqp + s.wcLima + s.wcAqp;
  const rampTxt = s.ramp.slice(0, 3).map((x) => p0(x)).join(' / ');
  return (
    <Paso n={9} titulo="Flujo de caja de las tiendas (escenario base)">
      <p>Cada tienda pierde dinero los dos primeros años mientras madura, y en régimen gana poco porque sus costos fijos son altos.</p>
      <p>
        <strong>9.1 Inversión de la Fase 2 ({soles(fase2)}, desglose supuesto):</strong> acondicionamiento de Lima {soles(s.invLima)} y de Arequipa{' '}
        {soles(s.invAqp)} (se deprecian {p0(s.dT)} al año, el plazo del alquiler); capital de trabajo inicial (inventario) {soles(s.wcLima)} en Lima y{' '}
        {soles(s.wcAqp)} en Arequipa.
      </p>
      <p>
        <strong>9.2 Tienda de Lima (S/)</strong>
      </p>
      <FlujoTabla
        titulo="Flujo de la tienda de Lima, escenario base"
        filas={[
          { label: `Ventas (${rampTxt} de ${mil(b.escenario.lima)})`, vals: L.ventas },
          { label: `Contribución (× ${p0(s.cmT)})`, vals: L.contrib },
          { label: `(−) Costos fijos (${num(s.FLima / 12)} × 12)`, vals: L.cf },
          { label: `(−) Depreciación (${num(s.invLima)} × ${p0(s.dT)})`, vals: L.dep },
          { label: 'EBIT', vals: L.ebit, tipo: 'total' },
          { label: `(−) Impuesto (${pct(s.T)})`, vals: L.imp },
          { label: '(+) Depreciación', vals: L.depMas },
          { label: '(−) Inversión', vals: L.inversion },
          { label: '(−) Capital de trabajo', vals: L.ctVar },
          { label: '(+) Recuperación del capital de trabajo', vals: L.ctRec },
          { label: 'Flujo económico Lima', vals: L.flujo, tipo: 'total' },
        ]}
      />
      <p>
        <strong>9.3 Tienda de Arequipa (S/)</strong>, con el mismo procedimiento (ventas maduras de {mil(b.escenario.aqp)}, costos fijos de{' '}
        {soles(s.FAqp)} y depreciación de {soles(s.invAqp * s.dT)}):
      </p>
      <FlujoTabla
        titulo="Flujo de la tienda de Arequipa y de las dos tiendas"
        concepto=""
        filas={[
          { label: 'EBIT', vals: A.ebit },
          { label: 'Flujo económico Arequipa', vals: A.flujo, tipo: 'total' },
          { label: 'Flujo de las dos tiendas', vals: b.tiendas, tipo: 'total' },
        ]}
      />
      <p>
        <strong>Lectura.</strong> Ya madura, Lima deja solo {soles(L.ebit[5])} de utilidad operativa al año sobre {soles(L.ventas[5])} de ventas: el{' '}
        {p0(s.cmT)} de margen apenas cubre los {soles(s.FLima)} de costos fijos. El proyecto completo es la suma de los dos flujos: Fase 1 + tiendas ={' '}
        {b.total.map((x) => num(x)).join('; ')}.
      </p>
      <VerEnModelo hoja="Flujo_Base" />
    </Paso>
  );
}

export function Paso10({ r }) {
  const s = r.supuestos;
  const b = r.base;
  const i = b.ind;
  const decide = (x) => (x.vpn > 0 ? 'se acepta' : 'se rechaza');
  return (
    <Paso n={10} titulo="VPN con el factor (P/F, i, t)">
      <p>
        En el escenario base el VPN de la Fase 1 es <strong>{solesSigno(i.fase1.vpn)}</strong> y el del proyecto completo,{' '}
        <strong>{solesSigno(i.total.vpn)}</strong>. Cada flujo se trae a presente con su factor y se suman:
      </p>
      <Formula
        tex={`VPN = \\sum_{t=0}^{5} F_t \\,(P/F,\\ ${tex(s.tmar * 100, 0)}\\%,\\ t) \\qquad (P/F,\\ i,\\ t) = \\frac{1}{(1+i)^t}`}
      />
      <Tabla titulo="VPN por año">
        <thead>
          <tr>
            <th>Año t</th>
            <th className="num">(P/F, {p0(s.tmar)}, t)</th>
            <th className="num">Flujo Fase 1</th>
            <th className="num">VP Fase 1</th>
            <th className="num">Flujo tiendas</th>
            <th className="num">VP tiendas</th>
            <th className="num">Flujo total</th>
            <th className="num">VP total</th>
          </tr>
        </thead>
        <tbody>
          {b.t.map((t) => (
            <tr key={t}>
              <td>{t}</td>
              <td className="num">{num(b.pf[t], 5)}</td>
              <td className="num"><N v={i.fase1.flujos[t]} /></td>
              <td className="num"><N v={i.fase1.vpAnual[t]} /></td>
              <td className="num"><N v={i.tiendas.flujos[t]} /></td>
              <td className="num"><N v={i.tiendas.vpAnual[t]} /></td>
              <td className="num"><N v={i.total.flujos[t]} /></td>
              <td className="num"><N v={i.total.vpAnual[t]} /></td>
            </tr>
          ))}
          <tr className="total">
            <td>VPN</td>
            <td />
            <td />
            <td className="num"><N v={numSigno(i.fase1.vpn)} /></td>
            <td />
            <td className="num"><N v={numSigno(i.tiendas.vpn)} /></td>
            <td />
            <td className="num"><N v={numSigno(i.total.vpn)} /></td>
          </tr>
        </tbody>
      </Tabla>
      <p>
        <strong>Ejemplo del año 1:</strong> (P/F, {p0(s.tmar)}, 1) = 1 / {num(1 + s.tmar, 2)} = {num(b.pf[1], 5)}, y {num(i.fase1.flujos[1])} ×{' '}
        {num(b.pf[1], 5)} = {num(i.fase1.vpAnual[1])}.
      </p>
      <p>
        <strong>Regla de decisión:</strong> si VPN &gt; 0, el proyecto rinde más que la TMAR y se acepta. La Fase 1 {decide(i.fase1)}; las tiendas{' '}
        {decide(i.tiendas)}n y el proyecto completo {decide(i.total)}.
      </p>
      <GraficoFlujo ind={i.fase1} titulo="Fase 1: flujo de caja y VPN acumulado (escenario base)" />
      <GraficoFlujo ind={i.total} titulo="Proyecto completo: flujo de caja y VPN acumulado (escenario base)" />
      <VerEnModelo hoja="Flujo_Base" />
    </Paso>
  );
}

export function Paso11({ r }) {
  const s = r.supuestos;
  const b = r.base;
  const i = b.ind;
  const f1 = i.fase1;
  const tot = i.total;
  const ap = r.factores.ap;
  const ti1 = f1.tirInterp;
  const tt = tot.tirInterp;
  const n = s.n;
  const pos = f1.flujos.map((F, t) => ({ F, t })).filter((x) => x.F > 0);
  const vfTex = pos
    .map(({ F, t }) => (n - t === 0 ? num(F) : `${num(F)} × ${num(1 + s.tmar, 2)}${n - t === 1 ? '' : `^${n - t}`}`))
    .join(' + ');
  const soloInversion = f1.flujos.slice(1).every((F) => F >= 0);
  const vpPos = f1.vpAnual.filter((v) => v > 0);
  const recTxt = () => {
    if (f1.recuperacion === null) return 'La Fase 1 no se recupera en 5 años.';
    const k = Math.floor(f1.recuperacion);
    return `Se recupera en ${k} + ${num(-f1.acumulado[k])} / ${num(f1.vpAnual[k + 1])} = `;
  };
  return (
    <Paso n={11} titulo="VAE, TIR, TER, B/C y periodo de recuperación">
      <p>
        Los cinco indicadores llevan a la misma decisión que el VPN: la Fase 1 {f1.vpn > 0 ? 'pasa' : 'no pasa'} todas las pruebas y el proyecto
        completo {tot.vpn > 0 ? 'las pasa' : 'no pasa ninguna'}.
      </p>
      <p>
        <strong>11.1 Valor anual equivalente (VAE).</strong> Reparte el VPN en {n} cuotas iguales con (A/P, {p0(s.tmar)}, {n}) = {num(s.tmar, 2)} ×{' '}
        {num(1 + s.tmar, 2)}^{n} / ({num(1 + s.tmar, 2)}^{n} − 1) = {num(ap, 5)}.
      </p>
      <Formula
        tex={`VAE_{Fase\\,1} = VPN\\,(A/P,\\ ${tex(s.tmar * 100, 0)}\\%,\\ ${n}) = ${tex(f1.vpn)} \\times ${tex(ap, 5)} = ${f1.vae >= 0 ? '+' : '-'}S/\\ ${tex(Math.abs(f1.vae))} \\text{ por año}`}
      />
      <p>
        El proyecto completo da {num(tot.vpn)} × {num(ap, 5)} = {soles(tot.vae)} por año.
      </p>
      <p>
        <strong>11.2 TIR por interpolación.</strong> La TIR es la tasa con VPN = 0. Se calcula el VPN a varias tasas, se ubica dónde cambia de signo y
        se interpola.{' '}
        {ti1.existe && ti1.i2 !== null && (
          <>
            Para la Fase 1, a i1 = {p0(ti1.i1)} el VPN es {numSigno(ti1.vpn1)} y a i2 = {p0(ti1.i2)} es {numSigno(ti1.vpn2)}:
          </>
        )}
      </p>
      {ti1.existe && ti1.i2 !== null && (
        <Formula
          tex={`TIR = i_1 + \\frac{VPN_1}{VPN_1 - VPN_2}(i_2 - i_1) = ${texPct(ti1.i1, 0)} + \\frac{${tex(ti1.vpn1)}}{${tex(ti1.vpn1)} + ${tex(-ti1.vpn2)}} \\times ${texPct(ti1.i2 - ti1.i1, 0)} = ${texPct(ti1.tir, 2)}`}
        />
      )}
      {tt.existe && tt.i2 !== null && (
        <>
          <p>
            Para el proyecto completo, a {p0(tt.i1)} el VPN es {numSigno(tt.vpn1)} y a {p0(tt.i2)} es {numSigno(tt.vpn2)}:
          </p>
          <Formula
            tex={`TIR = ${texPct(tt.i1, 0)} + \\frac{${tex(tt.vpn1)}}{${tex(tt.vpn1)} + ${tex(-tt.vpn2)}} \\times ${texPct(tt.i2 - tt.i1, 0)} = ${texPct(tt.tir, 2)}`}
          />
        </>
      )}
      <p>
        La TIR de la Fase 1 ({tasaONo(ti1.tir)}) {ti1.tir > s.tmar ? 'supera la TMAR' : 'no supera la TMAR'} ({p0(s.tmar)}) y{' '}
        {ti1.tir > s.tmar ? 'se acepta' : 'se rechaza'}; la del proyecto completo ({tasaONo(tt.tir)}) {tt.tir > s.tmar ? 'también la supera' : 'no'}. Las TIR exactas son{' '}
        {tasaONo(f1.tirExacta, 2)} y {tasaONo(tot.tirExacta, 2)}: la interpolación se desvía en menos de{' '}
        {num(Math.max(Math.abs((ti1.tir ?? 0) - (f1.tirExacta ?? 0)), Math.abs((tt.tir ?? 0) - (tot.tirExacta ?? 0))) * 100 + 0.05, 1)} puntos.
      </p>
      <p>
        <strong>11.3 TER (TIR modificada).</strong> Los flujos negativos se traen a presente al costo real del préstamo, i<sub>b</sub> = ({pct(s.tea)} −{' '}
        {p0(s.f)}) / {num(1 + s.f, 2)} = {pct(r.tasas.ib, 2)}. Los positivos se llevan al año {n} a la TMAR, como si se reinvirtieran.
      </p>
      <ul>
        <li>
          Fase 1: {soloInversion ? 'el único flujo negativo es la inversión, ' : ''}VP<sub>neg</sub> = {num(f1.ter.vpNeg)}.
        </li>
        <li>
          VF<sub>pos</sub> = {vfTex} = {num(f1.ter.vfPos)}.
        </li>
      </ul>
      <Formula
        tex={`TER = \\left(\\frac{VF_{pos}}{VP_{neg}}\\right)^{1/n} - 1 = \\left(\\frac{${tex(f1.ter.vfPos)}}{${tex(f1.ter.vpNeg)}}\\right)^{1/${n}} - 1 = ${f1.ter.ter === null ? '\\text{No existe}' : texPct(f1.ter.ter, 2)}`}
      />
      <p>
        El proyecto completo da ({num(tot.ter.vfPos)} / {num(tot.ter.vpNeg)})^(1/{n}) − 1 = {tasaONo(tot.ter.ter, 2)},{' '}
        {tot.ter.ter !== null && tot.ter.ter < s.tmar ? 'otra vez menor que la TMAR' : 'frente a la TMAR de ' + p0(s.tmar)}.
      </p>
      <p>
        <strong>11.4 Relación beneficio/costo.</strong> VP de los flujos positivos ÷ VP de los flujos negativos, ambos a la TMAR (paso 10).
      </p>
      <Formula
        tex={`B/C_{Fase\\,1} = \\frac{${vpPos.map((v) => tex(v)).join(' + ')}}{${tex(f1.vpCos)}} = \\frac{${tex(f1.vpBen)}}{${tex(f1.vpCos)}} = ${f1.bc === null ? '\\text{n.a.}' : tex(f1.bc, 2)}`}
      />
      <p>
        Con el mismo cálculo, el proyecto completo da {num(tot.vpBen)} / {num(tot.vpCos)} = {num(tot.bc, 2)} y las tiendas, {num(i.tiendas.vpBen)} /{' '}
        {num(i.tiendas.vpCos)} = {num(i.tiendas.bc, 2)}. Se acepta si B/C ≥ 1.
      </p>
      <p>
        <strong>11.5 Periodo de recuperación descontado (Fase 1).</strong> Se acumulan los VP del paso 10:{' '}
        {f1.acumulado.map((a) => numSigno(a)).join('; ')} al final de cada año. {recTxt()}
        {f1.recuperacion !== null && <strong>{anios(f1.recuperacion)}</strong>}
        {f1.recuperacion !== null && '.'} {tot.recuperacion === null ? 'El proyecto completo no se recupera en 5 años.' : `El proyecto completo se recupera en ${anios(tot.recuperacion)}.`}
      </p>
      <TablaSimple
        titulo="Resumen de indicadores, escenario base"
        cabeceras={['Indicador (base)', 'Fase 1', 'Tiendas', 'Proyecto completo', 'Regla']}
        numericas={[1, 2, 3]}
        filas={[
          ['VPN', <N key="a" v={numSigno(f1.vpn)} />, <N key="b" v={numSigno(i.tiendas.vpn)} />, <N key="c" v={numSigno(tot.vpn)} />, '> 0'],
          ['VAE (por año)', <N key="a" v={numSigno(f1.vae)} />, <N key="b" v={numSigno(i.tiendas.vae)} />, <N key="c" v={numSigno(tot.vae)} />, '> 0'],
          ['TIR por interpolación', tasaONo(f1.tirInterp.tir), tasaONo(i.tiendas.tirInterp.tir), tasaONo(tot.tirInterp.tir), `> ${p0(s.tmar)}`],
          ['TER', tasaONo(f1.ter.ter), tasaONo(i.tiendas.ter.ter), tasaONo(tot.ter.ter), `> ${p0(s.tmar)}`],
          ['B/C', num(f1.bc, 2), num(i.tiendas.bc, 2), num(tot.bc, 2), '≥ 1'],
          [
            'Recuperación descontada',
            f1.recuperacion === null ? 'No recupera' : `${num(f1.recuperacion, 2)} años`,
            i.tiendas.recuperacion === null ? 'No recupera' : `${num(i.tiendas.recuperacion, 2)} años`,
            tot.recuperacion === null ? 'No recupera' : `${num(tot.recuperacion, 2)} años`,
            '≤ 5 años',
          ],
        ]}
      />
      <VerEnModelo hoja="Flujo_Base" />
    </Paso>
  );
}
