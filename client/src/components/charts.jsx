// Gráficos del sitio (Recharts). Los colores salen de los tokens CSS --serie-*,
// validados para daltonismo y contraste en modo claro y oscuro.
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { corto, num, soles } from '../lib/format.js';

const S1 = 'var(--serie-1)';
const S2 = 'var(--serie-2)';
const S3 = 'var(--serie-3)';
const GRILLA = 'var(--grilla)';
const EJE = 'var(--eje)';

const ejeProps = { stroke: EJE, tickLine: false, axisLine: { stroke: GRILLA } };

// Contenedor accesible: título, descripción y tabla alternativa en el texto del sitio
export function Figura({ titulo, descripcion, alto = 320, children, pie }) {
  return (
    <figure className="tarjeta my-6 p-4 sm:p-5">
      <figcaption>
        <p className="font-serif text-lg font-semibold text-cafe">{titulo}</p>
        {descripcion && <p className="mt-0.5 text-sm text-suave">{descripcion}</p>}
      </figcaption>
      <div className="mt-3 w-full" style={{ height: alto }} role="img" aria-label={`${titulo}. ${descripcion ?? ''}`}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
      {pie && <p className="mt-2 text-xs text-tenue">{pie}</p>}
    </figure>
  );
}

function Globo({ active, payload, label, formato = soles, titulo }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-borde bg-superficie px-3 py-2 text-xs shadow-tarjeta">
      <p className="mb-1 font-semibold text-tinta">{titulo ? titulo(label, payload) : label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-suave">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} aria-hidden="true" />
          <span>{p.name}:</span>
          <span className="ml-auto font-semibold tabular-nums text-tinta">{formato(p.value, p.payload)}</span>
        </p>
      ))}
    </div>
  );
}

const leyenda = { wrapperStyle: { fontSize: 12, paddingTop: 8 }, iconType: 'square', iconSize: 10 };
const radio = (v) => (v >= 0 ? [4, 4, 0, 0] : [0, 0, 4, 4]);

// 1. VPN por escenario: Fase 1, Tiendas y Proyecto completo
export function GraficoVPNEscenarios({ r }) {
  const data = r.escenarios.map((e) => ({
    nombre: e.nombre,
    fase1: e.ind.fase1.vpn,
    tiendas: e.ind.tiendas.vpn,
    total: e.ind.total.vpn,
  }));
  return (
    <Figura
      titulo="VPN por escenario (S/, TMAR real)"
      descripcion="Barras agrupadas de la Fase 1, las tiendas y el proyecto completo en cada escenario. Por encima de cero se crea valor."
    >
      <BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }} barGap={2} barCategoryGap="22%">
        <CartesianGrid vertical={false} stroke={GRILLA} />
        <XAxis dataKey="nombre" {...ejeProps} />
        <YAxis tickFormatter={corto} width={64} {...ejeProps} />
        <Tooltip content={<Globo />} cursor={{ fill: 'rgb(var(--elevada) / .6)' }} />
        <Legend {...leyenda} />
        <ReferenceLine y={0} stroke={EJE} />
        {[
          ['fase1', 'Fase 1', S1],
          ['tiendas', 'Tiendas', S2],
          ['total', 'Proyecto completo', S3],
        ].map(([k, n, c]) => (
          <Bar key={k} dataKey={k} name={n} fill={c} maxBarSize={44}>
            {data.map((d, i) => (
              <Cell key={i} radius={radio(d[k])} />
            ))}
          </Bar>
        ))}
      </BarChart>
    </Figura>
  );
}

// 2. Tornado de sensibilidad (±20 %) sobre el VPN total
export function GraficoTornado({ sens, campo = 'total' }) {
  const base = campo === 'total' ? sens.vpnTotal : sens.vpnFase1;
  const data = sens.filas.map((f) => {
    const menos = campo === 'total' ? f.totalMenos : f.fase1Menos;
    const mas = campo === 'total' ? f.totalMas : f.fase1Mas;
    return { nombre: f.nombre, menos: menos - base, mas: mas - base, vMenos: menos, vMas: mas };
  });
  const alto = 70 + data.length * 34;
  return (
    <Figura
      titulo={`Tornado de sensibilidad: VPN ${campo === 'total' ? 'del proyecto completo' : 'de la Fase 1'} (±20 %)`}
      descripcion={`Cambio del VPN frente al escenario base (${soles(base)}) al mover un supuesto a la vez. Ordenado de mayor a menor efecto.`}
      alto={alto}
    >
      <BarChart data={data} layout="vertical" stackOffset="sign" margin={{ top: 4, right: 12, left: 4, bottom: 0 }} barCategoryGap="22%">
        <CartesianGrid horizontal={false} stroke={GRILLA} />
        <XAxis type="number" tickFormatter={corto} {...ejeProps} />
        <YAxis type="category" dataKey="nombre" width={150} interval={0} tick={{ fontSize: 11 }} {...ejeProps} />
        <Tooltip
          cursor={{ fill: 'rgb(var(--elevada) / .6)' }}
          content={
            <Globo formato={(v, p) => `${soles(v === p.menos ? p.vMenos : p.vMas)} (${v >= 0 ? '+' : ''}${corto(v)})`} />
          }
        />
        <Legend {...leyenda} />
        <ReferenceLine x={0} stroke={EJE} />
        <Bar dataKey="menos" name="Supuesto −20 %" stackId="t" fill={S1} />
        <Bar dataKey="mas" name="Supuesto +20 %" stackId="t" fill={S2} />
      </BarChart>
    </Figura>
  );
}

// 3. Flujo de caja por año con el VPN acumulado como línea
export function GraficoFlujo({ ind, titulo }) {
  const data = ind.flujos.map((F, t) => ({ anio: `Año ${t}`, flujo: F, acumulado: ind.acumulado[t] }));
  return (
    <Figura
      titulo={titulo ?? `Flujo de caja y VPN acumulado: ${ind.nombre}`}
      descripcion="Barras: flujo de cada año en soles constantes. Línea: valor presente acumulado a la TMAR; donde cruza el cero se recupera la inversión."
    >
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRILLA} />
        <XAxis dataKey="anio" {...ejeProps} />
        <YAxis tickFormatter={corto} width={64} {...ejeProps} />
        <Tooltip content={<Globo />} cursor={{ fill: 'rgb(var(--elevada) / .6)' }} />
        <Legend {...leyenda} />
        <ReferenceLine y={0} stroke={EJE} />
        <Bar dataKey="flujo" name="Flujo del año" fill={S1} maxBarSize={48}>
          {data.map((d, i) => (
            <Cell key={i} radius={radio(d.flujo)} />
          ))}
        </Bar>
        <Line dataKey="acumulado" name="VPN acumulado" stroke={S2} strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: 'rgb(var(--superficie))' }} activeDot={{ r: 6 }} />
      </ComposedChart>
    </Figura>
  );
}

// 4. Cronograma del préstamo: saldo (línea) y composición de la cuota (barras) en dos gráficos con la misma escala cada uno
export function GraficoPrestamo({ prestamo, titulo = 'Préstamo' }) {
  const data = prestamo.meses.map((m) => ({ mes: m.mes, saldo: m.saldoFinal, interes: m.interes, amort: m.amort }));
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Figura titulo={`${titulo}: saldo al final de cada mes`} descripcion="El saldo baja cada vez más rápido porque la amortización crece." alto={260}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={GRILLA} />
          <XAxis dataKey="mes" {...ejeProps} interval={5} />
          <YAxis tickFormatter={corto} width={64} {...ejeProps} />
          <Tooltip content={<Globo titulo={(l) => `Mes ${l}`} formato={(v) => soles(v, 2)} />} />
          <Line dataKey="saldo" name="Saldo final" stroke={S3} strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
        </LineChart>
      </Figura>
      <Figura titulo={`${titulo}: interés y amortización de cada cuota`} descripcion="La cuota es constante; el interés baja y la amortización sube." alto={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }} barCategoryGap={1}>
          <CartesianGrid vertical={false} stroke={GRILLA} />
          <XAxis dataKey="mes" {...ejeProps} interval={5} />
          <YAxis tickFormatter={corto} width={56} {...ejeProps} />
          <Tooltip content={<Globo titulo={(l) => `Mes ${l}`} formato={(v) => soles(v, 2)} />} cursor={{ fill: 'rgb(var(--elevada) / .6)' }} />
          <Legend {...leyenda} />
          <Bar dataKey="interes" name="Interés" stackId="c" fill={S2} />
          <Bar dataKey="amort" name="Amortización" stackId="c" fill={S1} radius={[3, 3, 0, 0]} />
        </BarChart>
      </Figura>
    </div>
  );
}

// 5. Punto de equilibrio frente a las ventas del escenario base, por tienda
export function GraficoEquilibrio({ eq }) {
  const data = [eq.lima, eq.aqp].map((t) => ({
    tienda: t.nombre,
    recuperacion: t.ventasEq,
    economico: t.economico,
    base: t.ventasBase,
  }));
  return (
    <Figura
      titulo="Ventas de equilibrio frente a ventas del escenario base (S/ por año)"
      descripcion="Si la barra de ventas base no alcanza las de equilibrio, la tienda no recupera su inversión a la TMAR."
    >
      <BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }} barGap={2} barCategoryGap="24%">
        <CartesianGrid vertical={false} stroke={GRILLA} />
        <XAxis dataKey="tienda" {...ejeProps} />
        <YAxis tickFormatter={corto} width={64} {...ejeProps} />
        <Tooltip content={<Globo />} cursor={{ fill: 'rgb(var(--elevada) / .6)' }} />
        <Legend {...leyenda} />
        <Bar dataKey="base" name="Ventas maduras (base)" fill={S1} radius={[4, 4, 0, 0]} maxBarSize={48} />
        <Bar dataKey="recuperacion" name="Equilibrio con recuperación" fill={S3} radius={[4, 4, 0, 0]} maxBarSize={48} />
        <Bar dataKey="economico" name="Equilibrio económico (VPN = 0)" fill={S2} radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </Figura>
  );
}

// 6. Composición del costo por kg
export function GraficoCostoKg({ costos }) {
  const data = costos.rubros.map((c) => ({ rubro: c.rubro.replace(/\s*\(.*\)/, ''), valor: c.valor, pct: c.pct }));
  return (
    <Figura
      titulo={`Composición del costo por kg tostado (U = ${soles(costos.U, 2)})`}
      descripcion="Soles por kg de cada rubro y su porcentaje del costo total."
      alto={60 + data.length * 36}
    >
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 64, left: 4, bottom: 0 }} barCategoryGap="24%">
        <CartesianGrid horizontal={false} stroke={GRILLA} />
        <XAxis type="number" {...ejeProps} tickFormatter={(v) => num(v, 0)} />
        <YAxis type="category" dataKey="rubro" width={150} interval={0} tick={{ fontSize: 11 }} {...ejeProps} />
        <Tooltip content={<Globo formato={(v, p) => `${soles(v, 2)} (${num(p.pct * 100, 1)} %)`} />} cursor={{ fill: 'rgb(var(--elevada) / .6)' }} />
        <Bar dataKey="valor" name="S/ por kg" fill={S1} radius={[0, 4, 4, 0]}>
          <LabelList dataKey="pct" position="right" formatter={(v) => `${num(v * 100, 1)} %`} style={{ fontSize: 11, fill: 'rgb(var(--suave))' }} />
        </Bar>
      </BarChart>
    </Figura>
  );
}
