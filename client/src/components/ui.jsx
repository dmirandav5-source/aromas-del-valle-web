// Componentes pequeños reutilizables.
import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { num, soles } from '../lib/format.js';

// Número con negativos en rojo y signo «−»
export function N({ v, dec = 0, s = false, className = '' }) {
  if (v === null || v === undefined) return <span className={className} />;
  const texto = typeof v === 'string' ? v : s ? soles(v, dec) : num(v, dec);
  const neg = typeof v === 'number' && texto.startsWith('−');
  return <span className={`${neg ? 'neg' : ''} ${className}`}>{texto}</span>;
}

// Tarjeta de indicador con semáforo (verde si cumple la regla)
export function KpiCard({ titulo, valor, regla, cumple, detalle, grande = false }) {
  return (
    <div className="tarjeta relative overflow-hidden p-4 sm:p-5">
      <span
        className={`absolute inset-y-0 left-0 w-1.5 ${cumple ? 'bg-bien' : 'bg-mal'}`}
        aria-hidden="true"
      />
      <p className="text-xs font-semibold uppercase tracking-wider text-suave">{titulo}</p>
      <p
        className={`mt-1 font-serif font-semibold tabular-nums ${grande ? 'text-3xl sm:text-4xl' : 'text-2xl'} ${cumple ? 'text-bien' : 'text-mal'}`}
      >
        {valor}
      </p>
      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-suave">
        <span
          className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-fondo ${cumple ? 'bg-bien' : 'bg-mal'}`}
          aria-hidden="true"
        >
          {cumple ? '✓' : '✕'}
        </span>
        <span>
          {cumple ? 'Cumple' : 'No cumple'}: {regla}
        </span>
      </p>
      {detalle && <p className="mt-1 text-xs text-tenue">{detalle}</p>}
    </div>
  );
}

// Acordeón accesible para detalles largos
export function Acordeon({ titulo, children, abierto = false }) {
  const [open, setOpen] = useState(abierto);
  const id = useId();
  return (
    <div className="my-4 rounded-xl border border-borde bg-superficie">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left font-semibold text-cafe hover:bg-elevada"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{titulo}</span>
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true">
          ▾
        </span>
      </button>
      <div id={id} hidden={!open} className="border-t border-borde px-4 pb-4">
        {children}
      </div>
    </div>
  );
}

// Pestañas (por ejemplo, para cambiar de escenario)
export function Pestanas({ opciones, valor, onChange, etiqueta = 'Escenario' }) {
  const refs = useRef([]);
  const onKey = (e, i) => {
    let j = null;
    if (e.key === 'ArrowRight') j = (i + 1) % opciones.length;
    if (e.key === 'ArrowLeft') j = (i - 1 + opciones.length) % opciones.length;
    if (j !== null) {
      e.preventDefault();
      onChange(opciones[j].id);
      refs.current[j]?.focus();
    }
  };
  return (
    <div role="tablist" aria-label={etiqueta} className="inline-flex flex-wrap gap-1 rounded-full border border-borde bg-elevada p-1">
      {opciones.map((o, i) => {
        const activo = o.id === valor;
        return (
          <button
            key={o.id}
            ref={(el) => (refs.current[i] = el)}
            role="tab"
            type="button"
            aria-selected={activo}
            tabIndex={activo ? 0 : -1}
            onKeyDown={(e) => onKey(e, i)}
            onClick={() => onChange(o.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${activo ? 'bg-cafe text-fondo shadow' : 'text-suave hover:text-cafe'}`}
          >
            {o.nombre}
          </button>
        );
      })}
    </div>
  );
}

// Aparición sutil al hacer scroll (desactivada con prefers-reduced-motion en CSS)
export function Revelar({ children, as: Tag = 'div', className = '', ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }
    const obs = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`revelar ${visible ? 'visible' : ''} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

// Encabezado de página
export function Cabecera({ etiqueta, titulo, children }) {
  return (
    <header className="border-b border-borde bg-elevada/50">
      <div className="contenedor py-10 sm:py-14">
        {etiqueta && <p className="etiqueta">{etiqueta}</p>}
        <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">{titulo}</h1>
        {children && <div className="mt-4 max-w-3xl text-base text-suave sm:text-lg">{children}</div>}
      </div>
    </header>
  );
}

// Nota destacada
export function Nota({ tipo = 'info', titulo, children }) {
  const estilos = {
    info: 'border-andino/40 bg-andino/5',
    aviso: 'border-aviso/50 bg-aviso/10',
    mal: 'border-mal/40 bg-mal/5',
    bien: 'border-bien/40 bg-bien/5',
  };
  return (
    <div className={`my-4 rounded-xl border-l-4 px-4 py-3 text-sm ${estilos[tipo]}`}>
      {titulo && <p className="mb-1 font-semibold text-tinta">{titulo}</p>}
      <div className="text-tinta">{children}</div>
    </div>
  );
}

// Tabla con scroll propio en celular
export function Tabla({ children, titulo, className = '' }) {
  return (
    <div className={`tabla-wrap ${className}`} role="region" aria-label={titulo} tabIndex={0}>
      <table className="tabla">
        {titulo && <caption className="sr-only">{titulo}</caption>}
        {children}
      </table>
    </div>
  );
}

// Tabla simple a partir de encabezados y filas; las celdas numéricas se alinean a la derecha.
export function TablaSimple({ titulo, cabeceras, filas, numericas = [], totales = [], className }) {
  const esNum = (i) => numericas.includes(i);
  return (
    <Tabla titulo={titulo} className={className}>
      <thead>
        <tr>
          {cabeceras.map((h, i) => (
            <th key={i} scope="col" className={esNum(i) ? 'num' : ''}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filas.map((fila, r) => (
          <tr key={r} className={totales.includes(r) ? 'total' : ''}>
            {fila.map((c, i) => (
              <td key={i} className={esNum(i) ? 'num' : ''}>
                {typeof c === 'number' ? <N v={c} /> : c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Tabla>
  );
}

export function VerEnModelo({ hoja, texto }) {
  return (
    <p className="mt-6">
      <Link to={`/modelo/${hoja}`} className="btn-secundario">
        Ver en el modelo: hoja {texto ?? hoja} →
      </Link>
    </p>
  );
}
