// Pasos 1 a 6: datos, costos, márgenes, volumen, tasas y préstamo.
import { Formula } from '../../components/Formula.jsx';
import { N, Tabla, TablaSimple, VerEnModelo } from '../../components/ui.jsx';
import { GraficoCostoKg, GraficoPrestamo } from '../../components/charts.jsx';
import { num, pct, soles, tex, texPct } from '../../lib/format.js';

export const mil = (v) => `S/ ${num(v / 1000)} mil`;
const p0 = (v) => pct(v, 0);

export function Paso({ n, titulo, children }) {
  return (
    <section id={`paso-${n}`} className="scroll-mt-24 border-b border-borde pb-10 pt-10 first:pt-0">
      <p className="etiqueta">Paso {n}</p>
      <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">{titulo}</h2>
      <div className="prosa mt-3">{children}</div>
    </section>
  );
}

export function Paso1({ r }) {
  const s = r.supuestos;
  const v = r.costos.ventas2025;
  const fase1 = s.invMaq + s.invInt + s.wc1;
  const fase2 = s.invLima + s.invAqp + s.wcLima + s.wcAqp;
  return (
    <Paso n={1} titulo="Datos del caso y supuestos que faltan">
      <p>El primer paso es separar lo que el caso da de lo que hay que suponer, porque la conclusión depende de ambos.</p>
      <h4>Datos que da el caso</h4>
      <TablaSimple
        titulo="Datos que da el caso"
        cabeceras={['Dato', 'Valor', 'Uso en la solución']}
        filas={[
          ['Facturación 2025', soles(s.facturacion), 'Base de las ventas por canal'],
          ['Participación por canal', `Tienda ${p0(s.shTienda)}, online ${p0(s.shOnline)}, B2B ${p0(s.shB2B)}`, `Tienda ${soles(v.tienda)}; online ${soles(v.online)}; B2B ${soles(v.b2b)}`],
          ['Costo de producción', `${soles(r.costos.U, 2)} por kg tostado`, 'Costo unitario U'],
          ['Precio 250 g / 500 g', 'S/ 42–48 / S/ 78–88', `${soles(s.pTienda)} por kg en tienda; ${soles(s.pOnline)} por kg online (puntos medios)`],
          ['Precio a cafeterías', 'S/ 95–110 por kg', `${soles(s.pB2B, 2)} (punto medio)`],
          ['Flete online', `S/ 14 por 500 g = ${soles(s.flete)} por kg`, 'Costo variable online'],
          ['Pasarela de pago', '2.5–3.5 %', `${pct(s.pasarela, 0)} (punto medio)`],
          ['Marketing digital', `${soles(s.mkt, 2)} por kg online`, 'Costo variable online'],
          ['Comisión a cafeterías', '15–25 %', `${p0(s.comB2B)} (punto medio)`],
          ['Empaque local', 'S/ 3.80–4.20 por kg (hoy S/ 4.90)', `Ahorro de ${soles(s.ahEmp, 2)} por kg`],
          ['Capacidad', `${num(s.cap0)} kg/día hoy; ${num(s.cap1)} kg/día con la máquina`, 'Volumen máximo'],
          ['Inversión', 'S/ 480,000 (maquinaria, local, capital de trabajo, marketing)', 'Inversión total'],
          ['Préstamo', `${num(s.nm)} meses, ${pct(s.tea)} TEA`, 'Cuota y costo de la deuda'],
          ['Mercado', 'Crece 12–15 % al año', 'Ancla de los escenarios'],
        ]}
      />
      <h4>Supuestos propios (el caso no los da)</h4>
      <TablaSimple
        titulo="Supuestos propios"
        cabeceras={['Supuesto', 'Valor', 'Justificación']}
        filas={[
          ['Horizonte', `${s.n} años (2026–2030)`, 'El caso habla de 2026–2028; 5 años permiten ver las tiendas maduras'],
          ['TMAR real', p0(s.tmar), 'Supera al CPPC real (paso 5) por el riesgo de una PYME'],
          ['Impuesto a la Renta', pct(s.T), 'Régimen general en Perú'],
          ['Inflación', `${p0(s.f)} anual`, 'Centro de la meta del BCRP; el caso dice que «se ha moderado»'],
          ['Desglose de la inversión', `Fase 1: ${mil(fase1)}; Fase 2: ${mil(fase2)}`, 'Detalle en el paso 8 y el paso 9'],
          ['Costos fijos de tiendas', `Lima ${soles(s.FLima / 12)} al mes; Arequipa ${soles(s.FAqp / 12)} al mes`, 'Alquiler y personal'],
          ['Margen de contribución de tiendas', p0(s.cmT), '72.5 % del producto menos ≈ 10 puntos de costos variables de tienda'],
          ['Costos fijos de la Fase 1', `${soles(s.cf1)} al año`, 'Vendedor B2B, operación online y mantenimiento'],
          ['Capital de trabajo', `${p0(s.wcPct)} de las ventas incrementales`, 'Nunca menor que el inicial; se recupera en el año 5'],
          ['Financiamiento', `Préstamo por los ${mil(s.P)}`, 'El caso no dice el monto'],
        ]}
      />
      <p>
        Los supuestos están en amarillo en la hoja <em>Supuestos</em> del Excel. Si cambias uno, todo el modelo se recalcula.
      </p>
      <VerEnModelo hoja="Supuestos" />
    </Paso>
  );
}

export function Paso2({ r }) {
  const c = r.costos;
  const [hoy, a5] = c.metodoUnitario;
  const verde = c.rubros[0];
  return (
    <Paso n={2} titulo="Costo unitario y método unitario">
      <p>
        Producir un kg de café tostado cuesta <strong>U = {soles(c.U, 2)}</strong>. Es la suma de los {c.rubros.length === 7 ? 'siete' : c.rubros.length} rubros de la
        tabla del caso.
      </p>
      <Tabla titulo="Costo unitario por rubro">
        <thead>
          <tr>
            <th>Rubro</th>
            <th className="num">S/ por kg</th>
            <th className="num">% calculado = S/ ÷ {num(c.U, 2)}</th>
            <th className="num">% que dice el caso</th>
          </tr>
        </thead>
        <tbody>
          {c.rubros.map((x) => (
            <tr key={x.id}>
              <td>{x.rubro}</td>
              <td className="num"><N v={x.valor} dec={2} /></td>
              <td className="num">{pct(x.pct)}</td>
              <td className="num">{pct(x.pctCaso, Math.round(x.pctCaso * 1000) % 10 === 0 ? 0 : 1)}</td>
            </tr>
          ))}
          <tr className="total">
            <td>Total</td>
            <td className="num">{num(c.U, 2)}</td>
            <td className="num">100 %</td>
            <td className="num">{pct(c.pctCasoTotal)}</td>
          </tr>
        </tbody>
      </Tabla>
      <p>
        <strong>Cuidado con los porcentajes del caso:</strong> suman {pct(c.pctCasoTotal)}, no 100 %. Por eso no cuadran con los soles; por ejemplo,{' '}
        {num(verde.valor, 2)} / {num(c.U, 2)} = {pct(verde.pct)}, no {pct(verde.pctCaso, 0)}. La solución usa siempre los soles por kg, que sí suman{' '}
        {soles(c.U, 2)}.
      </p>
      <GraficoCostoKg costos={c} />
      <p>
        <strong>Método unitario.</strong> El costo total se estima multiplicando el costo por unidad por el número de unidades:
      </p>
      <Formula tex={`C_t = U \\times N = ${tex(c.U, 2)} \\times ${tex(hoy.N)} = S/\\ ${tex(hoy.Ct)}`} />
      <p>
        N = {num(hoy.N)} kg es el volumen de 2025 (se calcula en el paso 4). Con la precisión de ±20 % que se acepta en una estimación preliminar, el
        costo anual de producción está entre <strong>{soles(hoy.menos)} y {soles(hoy.mas)}</strong>. En el año 5 del escenario base se producen{' '}
        {num(a5.N)} kg, así que Ct = {num(c.U, 2)} × {num(a5.N)} ≈ {soles(a5.Ct)}.
      </p>
      <VerEnModelo hoja="Costos_Margenes" />
    </Paso>
  );
}

export function Paso3({ r }) {
  const s = r.supuestos;
  const [t, on, b] = r.costos.canales;
  return (
    <Paso n={3} titulo="Precio, costo variable y contribución por canal">
      <p>
        La <strong>contribución unitaria</strong> es lo que queda de cada kg vendido para cubrir los costos fijos: p − cv. Es el dato que se usa
        después en el punto de equilibrio.
      </p>
      <p>
        <strong>Tienda (Cusco).</strong> Se vende a p = {soles(t.p)} por kg (250 g a {soles(t.p / 4, t.p % 4 ? 2 : 0)}). El único costo variable del
        producto es su costo de producción.
      </p>
      <ul>
        <li>cv = {soles(t.cv, 2)}</li>
        <li>
          p − cv = {num(t.p)} − {num(t.cv, 2)} = <strong>{soles(t.contrib, 2)} por kg</strong>
        </li>
        <li>
          Margen = {num(t.contrib, 2)} / {num(t.p)} = <strong>{pct(t.margen)}</strong>
        </li>
      </ul>
      <p>
        <strong>Online.</strong> Se vende a p = {soles(on.p)} por kg (500 g a {soles(on.p / 2, on.p % 2 ? 2 : 0)}). Al costo de producción se suman el
        flete, la pasarela y el marketing.
      </p>
      <ul>
        <li>
          Pasarela = {pct(s.pasarela, 0)} × {num(on.p)} = {soles(on.pasarela, 2)}
        </li>
        <li>
          cv = {num(on.costo, 2)} + {num(on.flete, 2)} + {num(on.pasarela, 2)} + {num(on.mkt, 2)} = {soles(on.cv, 2)}
        </li>
        <li>
          p − cv = {num(on.p)} − {num(on.cv, 2)} = <strong>{soles(on.contrib, 2)} por kg</strong>
        </li>
        <li>
          Margen = {num(on.contrib, 2)} / {num(on.p)} = <strong>{pct(on.margen)}</strong>
        </li>
      </ul>
      <p>
        <strong>B2B (cafeterías y hoteles).</strong> El precio de lista es {soles(b.p, 2)} por kg, pero se paga {pct(s.comB2B, 0)} de comisión.
      </p>
      <ul>
        <li>
          Comisión = {pct(s.comB2B, 0)} × {num(b.p, 2)} = {soles(b.comision, 2)}
        </li>
        <li>
          cv = {num(b.costo, 2)} + {num(b.comision, 2)} = {soles(b.cv, 2)}
        </li>
        <li>
          p − cv = {num(b.p, 2)} − {num(b.cv, 2)} = <strong>{soles(b.contrib, 2)} por kg</strong>
        </li>
        <li>
          Margen = {num(b.contrib, 2)} / {num(b.p, 2)} = <strong>{pct(b.margen)}</strong>
        </li>
      </ul>
      <TablaSimple
        titulo="Contribución por canal"
        cabeceras={['Canal', 'p (S/ por kg)', 'cv (S/ por kg)', 'p − cv', 'Margen']}
        numericas={[1, 2, 3, 4]}
        filas={[t, on, b].map((x, i) => [['Tienda', 'Online', 'B2B'][i], num(x.p, 2), num(x.cv, 2), <N key="c" v={x.contrib} dec={2} />, pct(x.margen)])}
      />
      <p>
        <strong>Diferencia con el caso.</strong> El caso dice que el margen bruto es 42 % en venta directa y 18–25 % en cafeterías. Nuestros márgenes
        son mayores porque solo restan costos variables; los del caso incluyen costos que no detalla (alquiler, personal, reparto). Conviene pedir ese
        detalle (Pregunta 6).
      </p>
      <VerEnModelo hoja="Costos_Margenes" />
    </Paso>
  );
}

export function Paso4({ r }) {
  const c = r.costos;
  const s = r.supuestos;
  const [vt, vo, vb] = c.volumen;
  return (
    <Paso n={4} titulo="Volumen actual y capacidad">
      <p>
        En 2025 se vendieron ≈ <strong>{num(c.kg0)} kg</strong>, el {pct(c.usoCapacidad, 0)} de la capacidad actual. Los kg salen de dividir las
        ventas de cada canal entre su precio por kg.
      </p>
      <TablaSimple
        titulo="Volumen 2025"
        cabeceras={['Canal', 'Ventas 2025', '÷ Precio por kg', '= Kg al año']}
        numericas={[2, 3]}
        totales={[3]}
        filas={[
          [`Tienda (solo el ${pct(s.cafeTienda, 0)} que es café)`, `${num(c.ventas2025.tienda)} × ${num(s.cafeTienda, 2)} = ${soles(vt.ventas)}`, num(vt.precio, 2), num(vt.kg)],
          ['Online', soles(vo.ventas), num(vo.precio, 2), num(vo.kg)],
          ['B2B', soles(vb.ventas), num(vb.precio, 2), num(vb.kg)],
          [<strong key="t">Total</strong>, '', '', <strong key="k">{num(c.kg0)}</strong>],
        ]}
      />
      <ul>
        <li>
          Capacidad actual: {num(s.cap0)} kg × {num(s.dias)} días = {num(c.capActualAnual)} kg al año, así que el uso promedio es {num(c.kg0)} /{' '}
          {num(c.capActualAnual)} = <strong>{pct(c.usoCapacidad)}</strong>.
        </li>
        <li>El problema no es la capacidad promedio, sino los picos: en junio–agosto y diciembre se opera al 95 % y se rechazan pedidos.</li>
        <li>
          Capacidad con la máquina nueva: {num(s.cap1)} kg × {num(s.dias)} días = {num(c.capNuevaAnual)} kg al año,{' '}
          <strong>{num(c.capNuevaSobreActual, 1)} veces</strong> el volumen actual. Incluso en el escenario optimista el año 5 queda muy por debajo, así
          que conviene cotizar una máquina más pequeña.
        </li>
      </ul>
      <p>El {pct(s.cafeTienda, 0)} de café en las ventas de tienda es un supuesto: el ticket de S/ 68 incluye accesorios y bebidas.</p>
      <VerEnModelo hoja="Costos_Margenes" />
    </Paso>
  );
}

export function Paso5({ r }) {
  const s = r.supuestos;
  const t = r.tasas;
  return (
    <Paso n={5} titulo="Tasas de interés y TMAR">
      <p>
        La TMAR real de <strong>{pct(s.tmar, 0)}</strong> es la tasa con la que se evalúa todo el proyecto. Este paso muestra que es razonable:{' '}
        {t.cumple ? 'supera' : 'no supera'} al costo de financiarse (CPPC real de {pct(t.cppcReal)}).
      </p>
      <p>
        <strong>5.1 Tasa mensual del préstamo.</strong> El banco da una tasa efectiva anual; la cuota es mensual.
      </p>
      <Formula tex={`i_m = (1 + i_a)^{1/12} - 1 = (${tex(1 + s.tea, 3)})^{1/12} - 1 = ${tex(t.im, 6)} = ${texPct(t.im, 4)}`} />
      <p>
        <strong>5.2 Costo de la deuda después de impuestos.</strong> Los intereses se descuentan del impuesto, así que la deuda cuesta menos que su
        tasa.
      </p>
      <Formula tex={`K'_d = K_d (1 - T) = ${texPct(s.tea, 1)} \\times (1 - ${tex(s.T, 3)}) = ${texPct(t.kdNeto, 2)}`} />
      <p>
        <strong>5.3 Costo del patrimonio con CAPM.</strong> Rf = {pct(s.Rf)} (bono soberano peruano a 10 años), β = {num(s.beta, 2)} (sector alimentos
        procesados) y prima de mercado Rm − Rf = {pct(s.primaMercado)} (supuesto).
      </p>
      <Formula tex={`R_e = R_f + \\beta (R_m - R_f) = ${texPct(s.Rf, 1)} + ${tex(s.beta, 2)} \\times ${texPct(s.primaMercado, 1)} = ${texPct(t.ke, 2)}`} />
      <p>
        <strong>5.4 CPPC (WACC).</strong> Se supone que el préstamo financia el {pct(s.Wd, 0)} y los dueños el {pct(t.We, 0)}.
      </p>
      <Formula
        tex={`CPPC = W_d K_d (1 - T) + W_e K_e = ${tex(s.Wd, 2)} \\times ${texPct(t.kdNeto, 2)} + ${tex(t.We, 2)} \\times ${texPct(t.ke, 2)} = ${texPct(t.cppc, 2)}`}
      />
      <p>
        <strong>5.5 CPPC real.</strong> Se despeja la tasa real de la fórmula de inflación if = i + f + i·f, con f = {pct(s.f, 0)}:
      </p>
      <Formula tex={`i = \\frac{i_f - f}{1 + f} = \\frac{${texPct(t.cppc, 2)} - ${texPct(s.f, 0)}}{${tex(1 + s.f, 2)}} = ${texPct(t.cppcReal, 2)}`} />
      <p>
        <strong>5.6 TMAR.</strong> Se exige {pct(s.tmar, 0)} real, {num(t.primaRiesgo * 100, 1)} puntos {t.primaRiesgo >= 0 ? 'por encima' : 'por debajo'} del
        CPPC real, como prima por el riesgo de una PYME familiar que abre tiendas en ciudades nuevas.{' '}
        {t.cumple ? 'Se cumple la regla TMAR ≥ CPPC.' : 'No se cumple la regla TMAR ≥ CPPC: conviene revisar la TMAR.'}
      </p>
      <p>
        <strong>5.7 TMAR inflada.</strong> Sirve para descontar flujos en soles corrientes (paso 14).
      </p>
      <Formula tex={`i_f = i + f + i \\cdot f = ${texPct(s.tmar, 0)} + ${texPct(s.f, 0)} + ${texPct(s.tmar, 0)} \\times ${texPct(s.f, 0)} = ${texPct(t.tmarInflada, 2)}`} />
      <p>
        <strong>5.8 TMAR antes de impuestos.</strong> Sirve para descontar flujos antes de impuestos (paso 14).
      </p>
      <Formula tex={`TMAR_{antes} = \\frac{TMAR_{después}}{1 - T} = \\frac{${texPct(s.tmar, 0)}}{1 - ${tex(s.T, 3)}} = ${texPct(t.tmarAntes, 2)}`} />
      <p>
        <strong>Fórmulas que no se usan:</strong> el costo de capital por dividendos (Re = D1/P + g), porque la empresa no cotiza; el costo
        capitalizado, porque el horizonte es finito; y la razón costo/efectividad, porque los beneficios sí se miden en soles.
      </p>
      <VerEnModelo hoja="Tasas" />
    </Paso>
  );
}

export function Paso6({ r }) {
  const s = r.supuestos;
  const t = r.tasas;
  const L = r.prestamo.completo;
  const L1 = r.prestamo.fase1;
  const ap = r.factores.apPrestamo;
  const meses = [...L.meses.slice(0, 3), L.meses[L.meses.length - 1]];
  const anios = L.anual.filter((a) => a.cuota > 0);
  return (
    <Paso n={6} titulo="Préstamo con el factor (A/P, i, n)">
      <p>
        Un préstamo de {soles(s.P)} a {s.nm} meses tiene una cuota de <strong>{soles(L.cuota)} al mes</strong> y cuesta{' '}
        <strong>{soles(L.totalInteres)}</strong> en intereses.
      </p>
      <p>
        <strong>6.1 Factor de recuperación de capital</strong> con i<sub>m</sub> = {pct(t.im, 4)} y n = {s.nm} meses:
      </p>
      <Formula
        tex={`(A/P,\\ i,\\ n) = \\frac{i(1+i)^n}{(1+i)^n - 1} = \\frac{${tex(t.im, 6)} \\times (${tex(1 + t.im, 6)})^{${s.nm}}}{(${tex(1 + t.im, 6)})^{${s.nm}} - 1} = ${tex(ap, 6)}`}
      />
      <p>
        <strong>6.2 Cuota.</strong>
      </p>
      <Formula tex={`A = P\\,(A/P,\\ i_m,\\ ${s.nm}) = ${tex(s.P)} \\times ${tex(ap, 6)} = S/\\ ${tex(L.cuota, 2)}`} />
      <p>
        <strong>6.3 Primeros meses del cronograma.</strong> Cada mes, interés = saldo × {pct(t.im, 4)}; amortización = cuota − interés; saldo nuevo =
        saldo − amortización.
      </p>
      <TablaSimple
        titulo="Primeros meses del cronograma"
        cabeceras={['Mes', 'Saldo inicial', 'Interés', 'Amortización', 'Saldo final']}
        numericas={[1, 2, 3, 4]}
        filas={meses.map((m) => [m.mes, num(m.saldoInicial, 2), num(m.interes, 2), num(m.amort, 2), num(Math.abs(m.saldoFinal) < 0.005 ? 0 : m.saldoFinal, 2)])}
      />
      <p>
        <strong>6.4 Resumen por año.</strong>
      </p>
      <Tabla titulo="Resumen anual del préstamo">
        <thead>
          <tr>
            <th>Año</th>
            <th className="num">Cuota anual</th>
            <th className="num">Interés</th>
            <th className="num">Amortización</th>
            <th className="num">Escudo fiscal = interés × {pct(s.T)}</th>
          </tr>
        </thead>
        <tbody>
          {anios.map((a) => (
            <tr key={a.anio}>
              <td>{a.anio}</td>
              <td className="num">{num(a.cuota)}</td>
              <td className="num">{num(a.interes)}</td>
              <td className="num">{num(a.amort)}</td>
              <td className="num">{num(a.interes * s.T)}</td>
            </tr>
          ))}
          <tr className="total">
            <td>Total</td>
            <td className="num">{num(L.totalCuota)}</td>
            <td className="num">{num(L.totalInteres)}</td>
            <td className="num">{num(L.totalAmort)}</td>
            <td className="num">{num(L.totalInteres * s.T)}</td>
          </tr>
        </tbody>
      </Tabla>
      <p>
        Si solo se financia la Fase 1 ({soles(s.P1)}), la cuota baja a {num(s.P1)} × {num(ap, 6)} = <strong>{soles(L1.cuota)} al mes</strong> (
        {soles(L1.anual[0].cuota)} al año). El cronograma completo está en la hoja <em>Prestamo</em>.
      </p>
      <GraficoPrestamo prestamo={L} titulo={`Préstamo de ${mil(s.P)}`} />
      <VerEnModelo hoja="Prestamo" />
    </Paso>
  );
}
