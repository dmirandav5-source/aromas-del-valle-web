// Modelo financiero: una vista por cada una de las 14 hojas del Excel.
import { useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useModelo } from '../state/ModelContext.jsx';
import { Cabecera } from '../components/ui.jsx';
import { HojaCostos, HojaFactores, HojaPasoAPaso, HojaResumen, HojaSupuestos, HojaTasas } from './modelo/HojasBase.jsx';
import { HojaFlujo, HojaPrestamo } from './modelo/HojasFlujo.jsx';
import { HojaEquilibrio, HojaIncremental, HojaInflacion, HojaSensibilidad } from './modelo/HojasAnalisis.jsx';
import NoEncontrado from './NoEncontrado.jsx';

const nombreFlujo = (e) => `Flujo_${e.nombre.replace(/\s+/g, '_')}`;

export default function Modelo() {
  const { r } = useModelo();
  const { hoja = 'Resumen' } = useParams();

  const hojas = [
    { id: 'Resumen', titulo: 'Resumen de la evaluación económica', C: HojaResumen },
    { id: 'Paso_a_paso', titulo: 'Ruta de la solución paso a paso (escenario base)', C: HojaPasoAPaso },
    { id: 'Supuestos', titulo: 'Supuestos del modelo', C: HojaSupuestos },
    { id: 'Tasas', titulo: 'Tasas: préstamo, costo de capital, TMAR e inflación', C: HojaTasas },
    { id: 'Factores', titulo: 'Factores de interés compuesto a la TMAR real', C: HojaFactores },
    { id: 'Costos_Margenes', titulo: 'Costo por kg, margen por canal, volumen y método unitario', C: HojaCostos },
    { id: 'Prestamo', titulo: 'Préstamo: cuota constante A = P (A/P, i_m, n)', C: HojaPrestamo },
    ...r.escenarios.map((e) => ({
      id: nombreFlujo(e),
      titulo: `Flujo de caja incremental — escenario ${e.nombre}`,
      C: (p) => <HojaFlujo {...p} id={e.id} />,
      extra: !e.escenario.original,
    })),
    { id: 'Incremental', titulo: 'Análisis incremental: proyecto completo vs. solo Fase 1', C: HojaIncremental },
    { id: 'Equilibrio', titulo: 'Punto de equilibrio: Q = CF / (p − cv)', C: HojaEquilibrio },
    { id: 'Inflacion', titulo: 'Inflación: soles constantes vs. soles corrientes', C: HojaInflacion },
    { id: 'Sensibilidad', titulo: 'Análisis de sensibilidad — escenario base (±20 %)', C: HojaSensibilidad },
  ];
  const actual = hojas.find((h) => h.id === hoja);

  // En celular, deja visible la pestaña de la hoja activa
  useEffect(() => {
    document.querySelector('[aria-label="Hojas del modelo"] a[aria-current="page"]')?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }, [hoja]);

  return (
    <>
      <Cabecera etiqueta="Modelo financiero" titulo="Las 14 hojas del Excel, recalculadas en vivo">
        <p>Mismas filas, columnas y etiquetas que el archivo original. Si cambias un supuesto en el panel, todas las hojas se actualizan.</p>
      </Cabecera>
      <div className="sticky top-16 z-20 border-b border-borde bg-fondo/95 backdrop-blur">
        <nav aria-label="Hojas del modelo" className="contenedor overflow-x-auto">
          <ul className="flex gap-1 py-2">
            {hojas.map((h) => (
              <li key={h.id} className="shrink-0">
                <NavLink
                  to={`/modelo/${h.id}`}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-1.5 font-mono text-xs no-underline ${isActive || (h.id === 'Resumen' && !hoja) ? 'bg-andino text-fondo' : 'text-suave hover:bg-elevada'} ${h.extra ? 'italic' : ''}`
                  }
                >
                  {h.id}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {actual ? (
        <section className="contenedor py-8">
          <p className="font-mono text-xs text-tenue">Hoja {actual.id}</p>
          <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">{actual.titulo}</h2>
          <div className="mt-4">
            <actual.C r={r} />
          </div>
        </section>
      ) : (
        <NoEncontrado />
      )}
    </>
  );
}
