// Solución paso a paso (pasos 1 a 16). Todos los números salen del motor.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useModelo } from '../state/ModelContext.jsx';
import { Cabecera } from '../components/ui.jsx';
import { pct, num, solesSigno } from '../lib/format.js';
import { Paso1, Paso2, Paso3, Paso4, Paso5, Paso6 } from './solucion/Pasos1a6.jsx';
import { Paso7, Paso8, Paso9, Paso10, Paso11 } from './solucion/Pasos7a11.jsx';
import { Paso12, Paso13, Paso14, Paso15, Paso16 } from './solucion/Pasos12a16.jsx';

const INDICE = [
  'Datos del caso y supuestos',
  'Costo unitario y método unitario',
  'Contribución por canal',
  'Volumen actual y capacidad',
  'Tasas de interés y TMAR',
  'Préstamo (A/P, i, n)',
  'Escenarios de demanda',
  'Flujo de la Fase 1',
  'Flujo de las tiendas',
  'VPN con (P/F, i, t)',
  'VAE, TIR, TER, B/C y recuperación',
  'Escenarios y VPN esperado',
  'Análisis incremental',
  'Financiero, inflación y antes de impuestos',
  'Punto de equilibrio',
  'Gradiente y sensibilidad',
];

function useActivo() {
  const [activo, setActivo] = useState(1);
  useEffect(() => {
    const secciones = INDICE.map((_, i) => document.getElementById(`paso-${i + 1}`)).filter(Boolean);
    const obs = new IntersectionObserver(
      (entradas) => {
        const visibles = entradas.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visibles[0]) setActivo(Number(visibles[0].target.id.split('-')[1]));
      },
      { rootMargin: '-80px 0px -65% 0px' },
    );
    secciones.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);
  return activo;
}

export default function Solucion() {
  const { r } = useModelo();
  const activo = useActivo();
  const i = r.base.ind;
  const PASOS = [Paso1, Paso2, Paso3, Paso4, Paso5, Paso6, Paso7, Paso8, Paso9, Paso10, Paso11, Paso12, Paso13, Paso14, Paso15, Paso16];
  const viable = i.total.vpn > 0;

  return (
    <>
      <Cabecera etiqueta="Solución paso a paso" titulo="Aromas del Valle: solución paso a paso del caso">
        <p>
          <strong className="text-tinta">
            Resultado: {viable ? 'el proyecto completo es viable' : 'el proyecto completo no es viable'}
            {i.fase1.vpn > 0 ? (viable ? ' y la Fase 1 sola también.' : ', pero la Fase 1 sola sí.') : ', y la Fase 1 sola tampoco.'}
          </strong>{' '}
          En el escenario base el proyecto completo tiene un VPN de {solesSigno(i.total.vpn)} a la TMAR de {pct(r.supuestos.tmar, 0)}. La Fase 1
          (maquinaria, empaque, online y B2B) tiene un VPN de {solesSigno(i.fase1.vpn)}, una TIR de {pct(i.fase1.tirInterp.tir)} y una B/C de{' '}
          {num(i.fase1.bc, 2)}. Las tiendas de Lima y Arequipa son las que {i.tiendas.vpn < 0 ? 'destruyen' : 'crean'} valor.
        </p>
      </Cabecera>

      <div className="contenedor grid grid-cols-1 gap-10 py-10 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
          <details className="tarjeta p-3 lg:hidden">
            <summary className="cursor-pointer font-semibold text-cafe">Índice de los 16 pasos</summary>
            <IndiceLista activo={activo} />
          </details>
          <nav aria-label="Índice de pasos" className="hidden lg:block">
            <p className="etiqueta mb-2">Índice</p>
            <IndiceLista activo={activo} />
          </nav>
        </aside>

        <article className="min-w-0 max-w-4xl">
          <div className="prosa">
            <p>
              <strong>Cómo está organizada la solución.</strong> Los pasos 1 a 6 preparan los datos y las tasas. Los pasos 7 a 9 construyen los flujos
              de caja. Los pasos 10 a 16 aplican los indicadores del curso. Al final se responden las 6 preguntas del caso usando esos resultados.
            </p>
            <p>
              Cada cálculo tiene su hoja en el Excel <em>Aromas_del_Valle_modelo_paso_a_paso</em>. La hoja <em>Paso_a_paso</em> enlaza cada paso con su
              resultado, y la hoja <em>Supuestos</em> marca en amarillo los datos que no vienen en el caso. Montos en soles constantes de 2025.
            </p>
          </div>
          <div className="mt-8">
            {PASOS.map((P, k) => (
              <P key={k} r={r} />
            ))}
          </div>
          <p className="mt-10">
            <Link to="/respuestas" className="btn-primario">
              Ver las respuestas a las 6 preguntas →
            </Link>
          </p>
        </article>
      </div>
    </>
  );
}

function IndiceLista({ activo }) {
  return (
    <ol className="mt-2 space-y-0.5 text-sm">
      {INDICE.map((t, k) => (
        <li key={k}>
          <a
            href={`#paso-${k + 1}`}
            aria-current={activo === k + 1 ? 'location' : undefined}
            className={`flex gap-2 rounded-lg px-2 py-1 no-underline ${activo === k + 1 ? 'bg-cafe text-fondo' : 'text-suave hover:bg-elevada hover:text-cafe'}`}
          >
            <span className="w-5 shrink-0 text-right font-semibold tabular-nums">{k + 1}</span>
            <span>{t}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}
