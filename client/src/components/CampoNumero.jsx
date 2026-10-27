// Campo numérico del panel. Los porcentajes se escriben como 16 (y se guardan como 0.16).
// Colores como en el Excel: texto azul = dato de entrada; fondo amarillo = supuesto propio.
import { useEffect, useId, useState } from 'react';

const sufijos = { pct: '%', soles: 'S/', solesKg: 'S/ kg', 'kg/día': 'kg/día', días: 'días', años: 'años', meses: 'meses' };

function aTexto(valor, unidad) {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return '';
  const v = unidad === 'pct' ? valor * 100 : valor;
  return String(Number(v.toPrecision(12)));
}

export function validar(valor, campo) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return 'Escribe un número';
  const esPct = campo.unidad === 'pct';
  const min = campo.min ?? (esPct ? -0.99 : 0);
  const max = campo.max ?? (esPct ? 1 : Infinity);
  const fmt = (v) => (esPct ? `${+(v * 100).toFixed(4)} %` : v.toLocaleString('es-PE'));
  if (campo.entero && !Number.isInteger(valor)) return 'Debe ser un número entero';
  if (valor < min) return `Mínimo ${fmt(min)}`;
  if (valor > max) return `Máximo ${fmt(max)}`;
  return null;
}

export default function CampoNumero({ campo, valor, original, onChange, compacto = false, etiquetaOculta = false, etiqueta }) {
  const id = useId();
  const [texto, setTexto] = useState(() => aTexto(valor, campo.unidad));
  const [enfocado, setEnfocado] = useState(false);

  // Sincroniza cuando el valor cambia desde fuera (descartar, restablecer, cargar versión)
  useEffect(() => {
    if (!enfocado) setTexto(aTexto(valor, campo.unidad));
  }, [valor, campo.unidad, enfocado]);

  const cambiar = (t) => {
    setTexto(t);
    const limpio = t.replace(/\s/g, '').replace(/,/g, '');
    const n = limpio === '' || limpio === '-' ? NaN : Number(limpio);
    onChange(Number.isFinite(n) ? (campo.unidad === 'pct' ? n / 100 : n) : NaN);
  };

  const error = validar(valor, campo);
  const cambiado = original !== undefined && Math.abs((valor ?? 0) - original) > 1e-12;
  const propio = campo.origen === 'propio';

  return (
    <div className={compacto ? '' : 'grid gap-1 sm:grid-cols-[minmax(0,1fr)_10rem] sm:items-start sm:gap-4'}>
      {!etiquetaOculta && (
        <label htmlFor={id} className="text-sm">
          <span className="font-medium text-tinta">{etiqueta ?? campo.label}</span>
          {campo.fuente && <span className="block text-xs text-tenue">{campo.fuente}</span>}
        </label>
      )}
      <div>
        <div
          className={`flex items-center rounded-lg border focus-within:ring-2 focus-within:ring-terracota ${error ? 'border-mal' : cambiado ? 'border-terracota' : 'border-borde'} ${propio ? 'bg-propio/70' : 'bg-superficie'}`}
        >
          {campo.unidad === 'soles' && <span className="pl-2 text-xs text-suave">S/</span>}
          <input
            id={id}
            type="text"
            inputMode="decimal"
            aria-label={etiquetaOculta ? (etiqueta ?? campo.label) : undefined}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-err` : undefined}
            value={texto}
            onFocus={() => setEnfocado(true)}
            onBlur={() => {
              setEnfocado(false);
              setTexto(aTexto(valor, campo.unidad));
            }}
            onChange={(e) => cambiar(e.target.value)}
            className="w-full min-w-0 bg-transparent px-2 py-1.5 text-right font-semibold tabular-nums text-casoAzul outline-none"
          />
          {campo.unidad !== 'soles' && sufijos[campo.unidad] && <span className="pr-2 text-xs text-suave">{sufijos[campo.unidad]}</span>}
        </div>
        {error && (
          <p id={`${id}-err`} className="mt-0.5 text-xs text-mal">
            {error}
          </p>
        )}
        {!error && cambiado && !compacto && (
          <p className="mt-0.5 text-right text-xs text-terracota">
            Excel: {Number(aTexto(original, campo.unidad)).toLocaleString('es-PE', { maximumFractionDigits: 6 })}
            {campo.unidad === 'pct' ? ' %' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
