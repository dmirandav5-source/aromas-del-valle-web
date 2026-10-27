// Validación con zod. Mensajes de error en español.
import { z } from 'zod';
import { CAMPOS, CAMPOS_ESCENARIO } from '@aromas/shared/meta.js';

function numero(campo) {
  let s = z.number({
    required_error: `«${campo.label}» es obligatorio`,
    invalid_type_error: `«${campo.label}» debe ser un número`,
  });
  if (campo.entero) s = s.int(`«${campo.label}» debe ser un número entero`);
  const esTasa = campo.unidad === 'pct';
  const min = campo.min ?? (esTasa ? -0.99 : 0);
  const max = campo.max ?? (esTasa ? 1 : Number.MAX_SAFE_INTEGER);
  const fmt = (v) => (esTasa ? `${+(v * 100).toFixed(4)} %` : v.toLocaleString('es-PE'));
  s = s.min(min, `«${campo.label}» no puede ser menor que ${fmt(min)}`);
  s = s.max(max, `«${campo.label}» no puede ser mayor que ${fmt(max)}`);
  return s;
}

const costo = z.object({
  id: z.string().min(1),
  rubro: z.string().min(1, 'Cada rubro de costo necesita un nombre'),
  valor: z.number({ invalid_type_error: 'El costo por kg debe ser un número' }).min(0, 'El costo por kg no puede ser negativo'),
  pctCaso: z.number().min(0).max(1).optional(),
});

export const escenarioSchema = z.object({
  id: z.string().optional(),
  nombre: z.string({ required_error: 'El escenario necesita un nombre' }).trim().min(1, 'El escenario necesita un nombre').max(60, 'El nombre es demasiado largo (máx. 60 caracteres)'),
  original: z.boolean().optional(),
  ...Object.fromEntries(CAMPOS_ESCENARIO.map((c) => [c.key, numero(c)])),
});

export const supuestosSchema = z
  .object({
    ...Object.fromEntries(CAMPOS.map((c) => [c.key, numero(c)])),
    costos: z.array(costo).min(1, 'Debe haber al menos un rubro de costo'),
    ramp: z
      .array(z.number({ invalid_type_error: 'La maduración debe ser numérica' }).min(0, 'La maduración debe estar entre 0 y 1').max(1, 'La maduración debe estar entre 0 y 1'), {
        invalid_type_error: 'La maduración debe ser una lista de 5 valores',
      })
      .length(5, 'La maduración necesita exactamente 5 valores (años 1 a 5)'),
    escenarios: z.array(escenarioSchema).min(1, 'Debe haber al menos un escenario').optional(),
  })
  .strip();

// Convierte los errores de zod en una lista legible.
export function mensajes(error) {
  return error.issues.map((i) => {
    const ruta = i.path.join('.');
    return ruta ? `${i.message} (${ruta})` : i.message;
  });
}

// Si las probabilidades no suman 1, las normaliza y devuelve un aviso.
export function normalizarProbabilidades(escenarios) {
  const suma = escenarios.reduce((a, e) => a + e.prob, 0);
  if (Math.abs(suma - 1) < 1e-6) return { escenarios, aviso: null };
  if (suma <= 0) {
    const p = 1 / escenarios.length;
    return {
      escenarios: escenarios.map((e) => ({ ...e, prob: p })),
      aviso: 'Las probabilidades sumaban 0; se repartieron en partes iguales.',
    };
  }
  return {
    escenarios: escenarios.map((e) => ({ ...e, prob: e.prob / suma })),
    aviso: `Las probabilidades sumaban ${(suma * 100).toFixed(1)} %; se normalizaron para que sumen 100 %.`,
  };
}
