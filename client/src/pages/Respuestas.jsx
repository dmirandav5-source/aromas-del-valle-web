// Respuestas a las preguntas 1 a 6, recomendación final y fuentes.
import { useModelo } from '../state/ModelContext.jsx';
import { Cabecera, TablaSimple } from '../components/ui.jsx';
import { PREGUNTAS } from './Caso.jsx';
import { num, pct, soles, solesSigno, tasaONo } from '../lib/format.js';

const mil = (v) => `S/ ${num(v / 1000)} mil`;

function Pregunta({ n, children }) {
  return (
    <section id={`pregunta-${n}`} className="scroll-mt-24 border-b border-borde py-8">
      <p className="etiqueta">Pregunta {n}</p>
      <h2 className="mt-1 text-2xl font-semibold">{PREGUNTAS[n - 1]}</h2>
      <div className="prosa mt-3">{children}</div>
    </section>
  );
}

export default function Respuestas() {
  const { r } = useModelo();
  const s = r.supuestos;
  const b = r.base;
  const i = b.ind;
  const res = r.resumen;
  const [cT, cOn, cB] = r.costos.canales;
  const incBase = r.incremental.porEscenario.find((x) => x.id === b.id);
  const incOpt = r.incremental.porEscenario.find((x) => x.id === 'optimista');
  const eq = r.equilibrio;
  const sens = Object.fromEntries(r.sensibilidad.filas.map((f) => [f.id, f]));
  const ahorros = b.fase1.ahorros.filter((x) => x !== null);
  const verde = r.costos.rubros.find((c) => c.id === 'verde') ?? r.costos.rubros[0];
  const contribPiso = 105 - r.costos.U;
  const cuotaAnual = r.prestamo.completo.anual[0].cuota;
  const fase1Inv = s.invMaq + s.invInt + s.wc1;
  const viableTotal = i.total.vpn > 0;

  return (
    <>
      <Cabecera etiqueta="Respuestas y recomendación" titulo="Respuestas a las preguntas del caso">
        <p>Cada respuesta usa los resultados de la solución paso a paso.</p>
      </Cabecera>
      <div className="contenedor max-w-4xl py-6">
        <nav aria-label="Preguntas" className="flex flex-wrap gap-2 py-4">
          {PREGUNTAS.map((_, k) => (
            <a key={k} href={`#pregunta-${k + 1}`} className="btn-secundario !px-3 !py-1">
              Pregunta {k + 1}
            </a>
          ))}
          <a href="#recomendacion" className="btn-primario !px-3 !py-1">
            Recomendación
          </a>
        </nav>

        <Pregunta n={1}>
          <p>
            <strong>{viableTotal ? 'Con estos supuestos, sí.' : 'Tal como está planteado, no.'}</strong> En el escenario base el proyecto completo tiene
            un VPN de {solesSigno(i.total.vpn)}, una TIR de {tasaONo(i.total.tirInterp.tir)} ({i.total.tirInterp.tir > s.tmar ? 'mayor' : 'menor'} que la
            TMAR de {pct(s.tmar, 0)}) y una B/C de {num(i.total.bc, 2)} (pasos 10 y 11). Su VPN esperado es {solesSigno(res.vpn.total.esperado)} (paso 12).
            La Fase 1 sola {i.fase1.vpn > 0 ? 'sí es viable' : 'tampoco es viable'}: VPN {solesSigno(i.fase1.vpn)}, TIR {tasaONo(i.fase1.tirInterp.tir)},
            B/C {num(i.fase1.bc, 2)} y recuperación en {i.fase1.recuperacion === null ? 'más de 5 años' : `${num(i.fase1.recuperacion, 2)} años`}. El
            análisis incremental {incBase.dBC !== null && incBase.dBC < 1 ? 'confirma que agregar las tiendas destruye valor' : 'favorece agregar las tiendas'}{' '}
            (ΔB/C = {num(incBase.dBC, 2)}, paso 13).
          </p>
          <p>
            Los riesgos externos del caso empeoran el pronóstico de las tiendas: el consumidor de Lima es sensible al precio, la competencia tiene mejor
            distribución y las tasas de interés altas encarecen el financiamiento. El 48 % de las ventas de la tienda de Cusco depende del turismo, así que
            la caja actual tampoco es estable para pagar cuotas de {mil(cuotaAnual)} al año.
          </p>
        </Pregunta>

        <Pregunta n={2}>
          <p>La regla es no competir por precio en Lima, sino por origen, trazabilidad y experiencia, y usar una palanca distinta en cada canal.</p>
          <TablaSimple
            titulo="Estrategia de precios por canal"
            cabeceras={['Canal', 'Situación (paso 3)', 'Estrategia', 'Efecto']}
            filas={[
              ['Tienda', `Mejor contribución: ${soles(cT.contrib, 2)} por kg`, 'Mantener S/ 42–48 por 250 g; microlotes a S/ 55–65; formatos de 150–200 g; venta cruzada de accesorios', 'Más ticket promedio sin perder al cliente que compara precio'],
              ['Online', `El flete (${soles(s.flete)} por kg) es el ${pct(s.flete / s.pOnline, 0)} del precio`, 'Envío gratis solo desde un monto mínimo; ~10 % de descuento en suscripción a cambio de permanencia; formato más pequeño para Lima', `Cada S/ 1 menos de flete por kg sube el margen ${num(100 / s.pOnline, 1)} puntos`],
              ['B2B', `Margen más bajo: ${pct(cB.margen)}`, 'Cambiar la comisión de 15–25 % por precios escalonados por volumen y contratos trimestrales; precio piso de S/ 105 netos por kg', `Con S/ 105 netos, la contribución sube de ${soles(cB.contrib, 2)} a ${soles(contribPiso, 2)} por kg (${contribPiso >= cB.contrib ? '+' : ''}${pct(contribPiso / cB.contrib - 1, 0)})`],
            ]}
          />
        </Pregunta>

        <Pregunta n={3}>
          <TablaSimple
            titulo="Oportunidades en la cadena de valor"
            cabeceras={['Eslabón', 'Oportunidad', 'Impacto']}
            filas={[
              ['Proveedores (18 familias)', 'Contratos por volumen; negociar parte del sobreprecio de 25–35 % en los lavados de Cajamarca, que sobran', `Café verde = ${soles(verde.valor, 2)} por kg: 5 % menos ahorra ${soles(verde.valor * 0.05, 2)} por kg`],
              ['Producción', 'La máquina nueva permite bajar la merma del 15–16 %', `Cada punto menos ahorra ${soles(s.ahMerma, 2)} por kg (paso 8)`],
              ['Empaque', 'Proveedor local: de S/ 4.90 a S/ 3.80–4.20 por kg', 'Ahorra S/ 0.70–1.10 por kg y reduce el riesgo del tipo de cambio'],
              ['Logística', 'Alianza con cooperativas o exportadoras con red en Lima', `Baja el flete de ${soles(s.flete)} por kg; es la variable con más peso en el margen online`],
              ['Ventas B2B', 'CRM, metas formales y más de un vendedor para subir la conversión del 18 %', 'Contratos recurrentes y cobranza más predecible'],
              ['Inventario', 'Pronóstico de demanda; hoy sobran lavados y faltan naturales y honey', 'Libera capital de trabajo'],
            ]}
          />
          <p>
            <strong>Efecto en el flujo de caja:</strong> los ahorros de merma y empaque suman S/ {num(Math.min(...ahorros) / 1000)}–{num(Math.max(...ahorros) / 1000)}{' '}
            mil al año en la Fase 1 (paso 8). El capital de trabajo crece de {mil(b.fase1.ctReq[0])} a {mil(b.fase1.ctReq[5])} al año 5, porque se paga a
            los productores a 7 días y a las cafeterías probablemente se les cobra a plazo. Cobrar a 30 días en lugar de 60 reduciría a la mitad lo
            inmovilizado en cuentas por cobrar.
          </p>
        </Pregunta>

        <Pregunta n={4}>
          <p>
            Ver el paso 7. Base: online +{pct(b.escenario.g, 0)} al año, B2B +{pct(b.escenario.b2b, 0)} al año 3, Lima {mil(b.escenario.lima)} y Arequipa{' '}
            {mil(b.escenario.aqp)}. Pesimista y optimista se separan alrededor del crecimiento del mercado (12–15 %), y los riesgos del caso (precio,
            competencia, tipo de cambio) justifican el pesimista.
          </p>
        </Pregunta>

        <Pregunta n={5}>
          <p>
            <strong>Priorizar el online y las suscripciones, junto con un B2B ordenado.</strong>
          </p>
          <ul>
            <li>
              <strong>Demanda comprobada:</strong> 4,200 clientes recurrentes, 41 % de suscripciones y solo 22 % de abandono de carrito.
            </li>
            <li>
              <strong>Números:</strong> la Fase 1 tiene VPN {solesSigno(i.fase1.vpn)} y las tiendas {solesSigno(i.tiendas.vpn)} (paso 10). El crecimiento
              online vale {mil(r.factores.gradiente.vpInc)} en ventas en valor presente (paso 16).
            </li>
            <li>
              <strong>Costos fijos:</strong> el online deja {pct(cOn.margen)} sin alquiler ni personal de tienda; cada tienda carga S/{' '}
              {num(Math.min(s.FLima, s.FAqp) / 1000)}–{num(Math.max(s.FLima, s.FAqp) / 1000)} mil fijos al año y Lima{' '}
              {eq.lima.ventasBase < eq.lima.ventasEq ? 'ni siquiera llega' : 'apenas llega'} a su equilibrio con recuperación de la inversión (paso 15).
            </li>
            <li>
              <strong>Riesgo reversible:</strong> si el online no crece, se pierde poco; un alquiler de 5 años es difícil de cerrar.
            </li>
          </ul>
          <p>
            Camino recomendado: hacer la Fase 1 y usar las ventas online a Lima y Arequipa como termómetro de demanda. Abrir una tienda solo cuando esos
            datos apunten a ventas cercanas a {mil(eq.lima.economico)} en Lima o {mil(eq.aqp.economico)} en Arequipa, y probar antes con un pop-up o
            quiosco.
          </p>
        </Pregunta>

        <Pregunta n={6}>
          <p>Es crítica la información que cambia el signo del VPN; la sensibilidad (paso 16) muestra que son los datos de las tiendas.</p>
          <h4>Crítica (pedir antes de decidir)</h4>
          <ol>
            <li>
              Costos fijos reales de las tiendas nuevas (alquiler, personal) y de la tienda actual, para explicar el margen de 42 %. Un ±20 % en este dato
              mueve el VPN total en {mil(sens.cfTiendas.rangoTotal)}.
            </li>
            <li>Demanda real en Lima y Arequipa: ventas online actuales a esas ciudades, estudios de ubicación y tráfico.</li>
            <li>Desglose real de los S/ 480 mil y calendario de desembolsos.</li>
            <li>
              Cotizaciones de las dos máquinas (brasileña y china): precio, vida útil, repuestos, merma esperada y una capacidad más cercana a la demanda.
            </li>
            <li>Histórico de ventas de 24 meses y rotación por variedad y canal, para la estacionalidad y el capital de trabajo.</li>
            <li>Monto del préstamo y comparación con el leasing, con el flujo de caja mensual.</li>
            <li>Régimen tributario de la empresa y costos de los nuevos controles sanitarios.</li>
          </ol>
          <h4>Secundaria</h4>
          <ul>
            <li>Seguidores en redes (28,000 en Instagram y 9,500 en TikTok): indican marca, no ventas.</li>
            <li>Encuesta a 180 clientes: útil como pista, pero la muestra es pequeña y sesgada hacia clientes actuales.</li>
            <li>Productos nuevos (descafeinado, procesos experimentales) mientras no se valide su demanda.</li>
          </ul>
          <p>
            <strong>Datos adicionales que pediría:</strong> la tasa de inflación y el tipo de cambio esperados por el BCRP, la TMAR que exigen los dueños y
            el costo de los contratos con cafeterías (plazos de pago y descuentos por volumen).
          </p>
        </Pregunta>

        <section id="recomendacion" className="scroll-mt-24 py-10">
          <p className="etiqueta">Conclusión</p>
          <h2 className="mt-1 text-3xl font-semibold">Recomendación final</h2>
          <ol className="mt-5 space-y-4">
            {[
              <>
                <strong>{viableTotal ? 'El proyecto completo es aprobable con estos supuestos.' : `No aprobar el proyecto completo de ${mil(s.P)} tal como está.`}</strong>{' '}
                VPN base {solesSigno(i.total.vpn)}; TIR {tasaONo(i.total.tirInterp.tir)} {i.total.tirInterp.tir > s.tmar ? 'mayor' : 'menor'} que la TMAR de{' '}
                {pct(s.tmar, 0)}; B/C {num(i.total.bc, 2)}; VPN esperado {solesSigno(res.vpn.total.esperado)}.
              </>,
              <>
                <strong>
                  {i.fase1.vpn > 0 ? 'Aprobar' : 'Revisar'} la Fase 1 por {mil(fase1Inv)}.
                </strong>{' '}
                VPN {solesSigno(i.fase1.vpn)}; VAE {solesSigno(i.fase1.vae)} al año; TIR {tasaONo(i.fase1.tirInterp.tir)}; B/C {num(i.fase1.bc, 2)};{' '}
                {i.fase1.recuperacion === null ? 'no se recupera en 5 años' : `se recupera en ${num(i.fase1.recuperacion, 2)} años`}. Incluye la maquinaria
                (con capacidad más cercana a la demanda que 250 kg/día), el empaque local, el refuerzo del online y las suscripciones, y un B2B con contratos y
                precio piso.
              </>,
              <>
                <strong>Financiar solo la Fase 1:</strong> un préstamo de {mil(s.P1)} baja la cuota a {soles(r.prestamo.fase1.cuota)} al mes y deja un VPN
                financiero de {solesSigno(i.fase1Fin.vpn)}.
              </>,
              <>
                <strong>Condicionar las tiendas</strong> a datos de demanda que se acerquen a su equilibrio ({mil(eq.lima.economico)} en Lima y{' '}
                {mil(eq.aqp.economico)} en Arequipa) y a costos fijos confirmados. El análisis incremental solo las favorece en el escenario optimista (ΔB/C ={' '}
                {incOpt ? num(incOpt.dBC, 2) : '—'}). Probar primero con un pop-up.
              </>,
              <>
                <strong>Vigilar los riesgos:</strong> dependencia del turismo (48 % de la tienda), tipo de cambio en empaque y maquinaria importados, inflación y
                tasas de interés altas.
              </>,
            ].map((t, k) => (
              <li key={k} className="tarjeta flex gap-4 p-5">
                <span className="font-serif text-3xl font-semibold text-terracota">{k + 1}</span>
                <p className="leading-relaxed">{t}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t border-borde py-8">
          <h2 className="text-2xl font-semibold">Fuentes</h2>
          <ul className="prosa mt-3">
            <li>Caso de estudio «Aromas del Valle» (2026) y formulario del curso.</li>
            <li>
              <a href="https://estadisticas.bcrp.gob.pe/estadisticas/series/mensuales/resultados/PD31895MM/html" target="_blank" rel="noreferrer">
                BCRP: rendimiento del bono del gobierno peruano a 10 años en soles
              </a>
              , dato de setiembre de 2026 (Rf = {pct(s.Rf)}).
            </li>
            <li>
              <a href="https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/BetasGlobal.html" target="_blank" rel="noreferrer">
                Damodaran: betas por sector (global)
              </a>
              , Food Processing, datos de enero de 2026 (β = {num(s.beta, 2)}).
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
