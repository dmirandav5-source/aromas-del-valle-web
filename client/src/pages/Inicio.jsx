import { Link } from 'react-router-dom';
import { useModelo } from '../state/ModelContext.jsx';
import { LogoIcono } from '../components/Logo.jsx';
import { KpiCard, Revelar } from '../components/ui.jsx';
import { GraficoVPNEscenarios } from '../components/charts.jsx';
import { pct, soles, solesSigno, num } from '../lib/format.js';

export default function Inicio() {
  const { r, kpis: k } = useModelo();
  const completoViable = k.vpnTotal > 0;
  const fase1Viable = k.vpnFase1 > 0;
  // El veredicto sigue a los números del motor
  const veredicto =
    !completoViable && fase1Viable
      ? 'El proyecto completo no es viable; la Fase 1 sí'
      : completoViable && fase1Viable
        ? 'Con estos supuestos, el proyecto completo y la Fase 1 son viables'
        : completoViable
          ? 'Con estos supuestos, el proyecto completo es viable, pero la Fase 1 sola no'
          : 'Con estos supuestos, ni el proyecto completo ni la Fase 1 son viables';

  return (
    <>
      <section className="relative overflow-hidden border-b border-borde">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.07]">
          <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className="h-full w-full">
            <path d="M0 400 L180 170 L300 280 L470 90 L640 300 L790 150 L960 290 L1100 120 L1200 220 L1200 400 Z" fill="rgb(var(--cafe))" />
          </svg>
        </div>
        <div className="contenedor relative grid grid-cols-1 gap-10 py-14 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <LogoIcono size={56} />
              <p className="etiqueta">Evaluación del proyecto de expansión 2026-2030</p>
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] sm:text-6xl">{veredicto}</h1>
            <p className="mt-5 max-w-xl text-lg text-suave">
              Aromas del Valle tuesta café de especialidad de 18 familias productoras del Perú desde Cusco. Esta es la evaluación
              económica completa, paso a paso, de su plan de expansión: maquinaria, canal online, B2B y tiendas en Lima y Arequipa.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/solucion" className="btn-primario">
                Ver la solución paso a paso
              </Link>
              <Link to="/supuestos" className="btn-secundario">
                Probar supuestos
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
            <KpiCard titulo="VPN Fase 1" valor={solesSigno(k.vpnFase1)} regla="VPN > 0" cumple={k.vpnFase1 > 0} detalle="Escenario base, TMAR real" grande />
            <KpiCard titulo="VPN proyecto completo" valor={solesSigno(k.vpnTotal)} regla="VPN > 0" cumple={k.vpnTotal > 0} detalle="Fase 1 + tiendas" grande />
            <KpiCard
              titulo="TIR Fase 1"
              valor={k.tirFase1 === null ? 'No existe' : pct(k.tirFase1)}
              regla={`TIR > TMAR (${pct(k.tmar, 0)})`}
              cumple={k.tirFase1 !== null && k.tirFase1 > k.tmar}
              detalle="Por interpolación"
              grande
            />
            <KpiCard titulo="B/C Fase 1" valor={k.bcFase1 === null ? '—' : num(k.bcFase1, 2)} regla="B/C ≥ 1" cumple={k.bcFase1 >= 1} detalle="VP beneficios ÷ VP costos" grande />
          </div>
        </div>
      </section>

      <section className="contenedor py-14">
        <Revelar className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <div>
            <p className="etiqueta">En una mirada</p>
            <h2 className="mt-2 text-3xl font-semibold">Las tiendas destruyen valor; el online lo crea</h2>
            <div className="prosa mt-3">
              <p>
                En el escenario base, la Fase 1 (maquinaria, empaque, online y B2B) tiene un VPN de <strong>{solesSigno(k.vpnFase1)}</strong>; las
                tiendas de Lima y Arequipa, <strong>{solesSigno(k.vpnTiendas)}</strong>. Juntas dan {solesSigno(k.vpnTotal)}.
              </p>
              <p>
                Ponderando los tres escenarios, el VPN esperado de la Fase 1 es {solesSigno(k.vpnEsperadoFase1)} y el del proyecto completo,{' '}
                {solesSigno(k.vpnEsperadoTotal)}. El análisis incremental da un ΔB/C de {k.dBC === null ? '—' : num(k.dBC, 2)} en la base.
              </p>
            </div>
          </div>
          <GraficoVPNEscenarios r={r} />
        </Revelar>
      </section>

      <section className="border-y border-borde bg-elevada/50">
        <div className="contenedor grid grid-cols-1 gap-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['/empresa', 'La empresa', 'Ubicación, misión, visión, objetivos y situación actual.'],
            ['/caso', 'El caso', 'Mercado, competencia, tabla de costos y las seis preguntas.'],
            ['/modelo', 'Modelo financiero', 'Las 14 hojas del Excel, recalculadas en vivo.'],
            ['/respuestas', 'Respuestas', 'Las seis preguntas, la recomendación final y las fuentes.'],
          ].map(([to, t, d]) => (
            <Revelar key={to}>
              <Link to={to} className="tarjeta block h-full p-5 no-underline transition-transform hover:-translate-y-0.5">
                <p className="font-serif text-xl font-semibold text-cafe">{t} →</p>
                <p className="mt-1 text-sm text-suave">{d}</p>
              </Link>
            </Revelar>
          ))}
        </div>
      </section>
      <p className="contenedor mt-6 text-xs text-tenue">Montos en soles constantes de 2025. Inversión total: {soles(r.supuestos.invMaq + r.supuestos.invInt + r.supuestos.wc1 + r.supuestos.invLima + r.supuestos.invAqp + r.supuestos.wcLima + r.supuestos.wcAqp)}.</p>
    </>
  );
}
