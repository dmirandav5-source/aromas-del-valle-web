// Metadatos de los supuestos editables, en el mismo orden y con los mismos grupos
// que la hoja Supuestos del Excel.
// origen: 'caso' = dato del caso (texto azul); 'propio' = supuesto propio (fondo amarillo).
// unidad: 'pct' se guarda como fracción (0.16) y se muestra como porcentaje (16 %).

export const GRUPOS = [
  { id: 'tasas', titulo: '1. Tasas y parámetros generales' },
  { id: 'capital', titulo: '2. Costo de capital (CAPM y CPPC)' },
  { id: 'costos', titulo: '3. Costo de producción por kg tostado (S/)' },
  { id: 'precios', titulo: '4. Precios y costos por canal' },
  { id: 'actual', titulo: '5. Situación actual (2025)' },
  { id: 'fase1', titulo: '6. Fase 1: maquinaria, empaque, online y B2B' },
  { id: 'fase2', titulo: '7. Fase 2: tiendas Lima y Arequipa' },
  { id: 'prestamo', titulo: '8. Préstamo' },
  { id: 'escenarios', titulo: '9. Escenarios de demanda' },
];

const C = 'Caso: tabla de costos por kg tostado (2025)';

export const CAMPOS = [
  // 1. Tasas y parámetros generales
  { key: 'tmar', grupo: 'tasas', label: 'TMAR real (rendimiento mínimo exigido, en soles constantes)', unidad: 'pct', origen: 'propio', fuente: 'Supuesto: CPPC + prima de riesgo de una PYME con tiendas nuevas (ver hoja Tasas)', min: -0.99, max: 1 },
  { key: 'T', grupo: 'tasas', label: 'Impuesto a la Renta (T)', unidad: 'pct', origen: 'propio', fuente: 'Perú, régimen general. Las pérdidas del proyecto generan escudo porque la empresa ya tiene utilidades', min: 0, max: 0.99 },
  { key: 'f', grupo: 'tasas', label: 'Inflación anual esperada (f)', unidad: 'pct', origen: 'propio', fuente: 'Supuesto: centro del rango meta del BCRP (1–3 %)', min: -0.99, max: 1 },
  { key: 'wcPct', grupo: 'tasas', label: 'Capital de trabajo requerido (% de ventas incrementales)', unidad: 'pct', origen: 'propio', fuente: 'Supuesto: nunca baja del capital de trabajo inicial; se recupera en el año 5', min: 0, max: 1 },
  { key: 'n', grupo: 'tasas', label: 'Horizonte de evaluación', unidad: 'años', origen: 'caso', fuente: 'Años 2026–2030. Los flujos del modelo están fijos en 5 años; n se usa en los factores (A/P), (A/F) y en la TER', min: 1, max: 30, entero: true },

  // 2. Costo de capital
  { key: 'Rf', grupo: 'capital', label: 'Tasa libre de riesgo Rf', unidad: 'pct', origen: 'caso', fuente: 'BCRP: rendimiento del bono soberano a 10 años en soles, setiembre 2026 (6.5 %)', min: -0.99, max: 1 },
  { key: 'beta', grupo: 'capital', label: 'Beta (β) del sector', unidad: 'num', origen: 'caso', fuente: 'Damodaran, Food Processing (global), datos de enero 2026', min: 0, max: 5, step: 0.01 },
  { key: 'primaMercado', grupo: 'capital', label: 'Prima de mercado (Rm − Rf)', unidad: 'pct', origen: 'propio', fuente: 'Supuesto: prima de mercado madura ≈ 4.5 % + riesgo país ≈ 2 %', min: -0.99, max: 1 },
  { key: 'Wd', grupo: 'capital', label: 'Peso de la deuda (Wd)', unidad: 'pct', origen: 'propio', fuente: 'Supuesto: el préstamo cubre la inversión fija; los dueños aportan el capital de trabajo. We = 1 − Wd', min: 0, max: 1 },

  // 4. Precios y costos por canal  (el grupo 3 son los rubros de `costos`)
  { key: 'pTienda', grupo: 'precios', label: 'Precio tienda por kg (250 g a S/ 42–48)', unidad: 'solesKg', origen: 'caso', fuente: 'Caso: S/ 168–192 por kg (punto medio)', min: 0 },
  { key: 'pOnline', grupo: 'precios', label: 'Precio online por kg (500 g a S/ 78–88)', unidad: 'solesKg', origen: 'caso', fuente: 'Caso: punto medio S/ 83 por 500 g', min: 0 },
  { key: 'flete', grupo: 'precios', label: 'Flete online por kg', unidad: 'solesKg', origen: 'caso', fuente: 'Caso: S/ 14 por 500 g', min: 0 },
  { key: 'pasarela', grupo: 'precios', label: 'Comisión pasarela de pago / WhatsApp Business', unidad: 'pct', origen: 'caso', fuente: 'Caso: 2.5–3.5 % (punto medio)', min: 0, max: 1 },
  { key: 'mkt', grupo: 'precios', label: 'Marketing online por kg', unidad: 'solesKg', origen: 'caso', fuente: 'Caso', min: 0 },
  { key: 'pB2B', grupo: 'precios', label: 'Precio mayorista a cafeterías por kg', unidad: 'solesKg', origen: 'caso', fuente: 'Caso: punto medio de S/ 95–110', min: 0 },
  { key: 'comB2B', grupo: 'precios', label: 'Comisión a cafeterías y hoteles', unidad: 'pct', origen: 'caso', fuente: 'Caso: punto medio de 15–25 % del precio de lista', min: 0, max: 1 },

  // 5. Situación actual
  { key: 'facturacion', grupo: 'actual', label: 'Facturación 2025', unidad: 'soles', origen: 'caso', fuente: 'Caso: ≈ S/ 1.85 millones', min: 0 },
  { key: 'shTienda', grupo: 'actual', label: 'Participación tienda física', unidad: 'pct', origen: 'caso', fuente: 'Caso', min: 0, max: 1 },
  { key: 'shOnline', grupo: 'actual', label: 'Participación online', unidad: 'pct', origen: 'caso', fuente: 'Caso', min: 0, max: 1 },
  { key: 'shB2B', grupo: 'actual', label: 'Participación cafeterías y hoteles (B2B)', unidad: 'pct', origen: 'caso', fuente: 'Caso', min: 0, max: 1 },
  { key: 'cafeTienda', grupo: 'actual', label: '% de ventas de tienda que es café', unidad: 'pct', origen: 'propio', fuente: 'Supuesto: el ticket de S/ 68 incluye accesorios y bebidas', min: 0, max: 1 },
  { key: 'cap0', grupo: 'actual', label: 'Capacidad actual de tueste', unidad: 'kg/día', origen: 'caso', fuente: 'Caso', min: 0.0001 },
  { key: 'cap1', grupo: 'actual', label: 'Capacidad con máquina nueva', unidad: 'kg/día', origen: 'caso', fuente: 'Caso', min: 0 },
  { key: 'dias', grupo: 'actual', label: 'Días de operación al año', unidad: 'días', origen: 'propio', fuente: 'Supuesto: 6 días por semana', min: 1, max: 366, entero: true },

  // 6. Fase 1
  { key: 'invMaq', grupo: 'fase1', label: 'Maquinaria de tostado (250 kg/día) y equipo de empaque', unidad: 'soles', origen: 'propio', fuente: 'Supuesto: desglose propio de los S/ 480 mil del caso', min: 0 },
  { key: 'invInt', grupo: 'fase1', label: 'Plataforma online, CRM y marketing inicial', unidad: 'soles', origen: 'propio', fuente: 'Supuesto: desglose propio; se amortiza en 5 años', min: 0 },
  { key: 'wc1', grupo: 'fase1', label: 'Capital de trabajo inicial Fase 1', unidad: 'soles', origen: 'propio', fuente: 'Supuesto: el caso incluye el capital de trabajo dentro de los S/ 480 mil', min: 0 },
  { key: 'dMaq', grupo: 'fase1', label: 'Depreciación maquinaria (línea recta)', unidad: 'pct', origen: 'caso', fuente: 'Tasa tributaria referencial 10 % anual', min: 0, max: 0.2 },
  { key: 'dInt', grupo: 'fase1', label: 'Amortización plataforma y desarrollo', unidad: 'pct', origen: 'caso', fuente: 'Supuesto: 5 años', min: 0, max: 1 },
  { key: 'cf1', grupo: 'fase1', label: 'Costos fijos incrementales Fase 1 (anual)', unidad: 'soles', origen: 'propio', fuente: 'Supuesto: ejecutivo B2B + operación online + mantenimiento', min: 0 },
  { key: 'ahMerma', grupo: 'fase1', label: 'Ahorro por reducir merma 1 punto', unidad: 'solesKg', origen: 'caso', fuente: 'S/ 28.50 × (1/0.84 − 1/0.85) ÷ (1/0.84)', min: 0 },
  { key: 'ahEmp', grupo: 'fase1', label: 'Ahorro por empaque local', unidad: 'solesKg', origen: 'caso', fuente: 'Caso: de S/ 4.90 a S/ 3.80–4.20 (punto medio)', min: 0 },

  // 7. Fase 2
  { key: 'invLima', grupo: 'fase2', label: 'Acondicionamiento tienda Lima', unidad: 'soles', origen: 'propio', fuente: 'Supuesto: desglose propio de los S/ 480 mil', min: 0 },
  { key: 'invAqp', grupo: 'fase2', label: 'Acondicionamiento tienda Arequipa', unidad: 'soles', origen: 'propio', fuente: 'Supuesto: desglose propio de los S/ 480 mil', min: 0 },
  { key: 'wcLima', grupo: 'fase2', label: 'Capital de trabajo inicial Lima (inventario)', unidad: 'soles', origen: 'propio', fuente: 'Supuesto', min: 0 },
  { key: 'wcAqp', grupo: 'fase2', label: 'Capital de trabajo inicial Arequipa (inventario)', unidad: 'soles', origen: 'propio', fuente: 'Supuesto', min: 0 },
  { key: 'dT', grupo: 'fase2', label: 'Depreciación implementación de tiendas', unidad: 'pct', origen: 'caso', fuente: 'Supuesto: 5 años, sin valor de rescate', min: 0, max: 1 },
  { key: 'cmT', grupo: 'fase2', label: 'Margen de contribución tiendas nuevas', unidad: 'pct', origen: 'propio', fuente: 'Supuesto: 72.5 % del producto menos ≈ 10 puntos de costos variables de tienda', min: -0.99, max: 1 },
  { key: 'FLima', grupo: 'fase2', label: 'Costos fijos anuales Lima', unidad: 'soles', origen: 'propio', fuente: 'Supuesto: S/ 18,000 al mes', min: 0 },
  { key: 'FAqp', grupo: 'fase2', label: 'Costos fijos anuales Arequipa', unidad: 'soles', origen: 'propio', fuente: 'Supuesto: S/ 11,000 al mes', min: 0 },

  // 8. Préstamo
  { key: 'P', grupo: 'prestamo', label: 'Monto del préstamo (proyecto completo)', unidad: 'soles', origen: 'propio', fuente: 'Supuesto: se financia toda la inversión con el préstamo del caso', min: 0 },
  { key: 'P1', grupo: 'prestamo', label: 'Monto alternativo (solo Fase 1)', unidad: 'soles', origen: 'caso', fuente: 'Propuesta: financiar solo la Fase 1', min: 0 },
  { key: 'tea', grupo: 'prestamo', label: 'Tasa efectiva anual del préstamo (Kd)', unidad: 'pct', origen: 'caso', fuente: 'Caso: 14.5 % TEA', min: 0.0001, max: 1 },
  { key: 'nm', grupo: 'prestamo', label: 'Plazo', unidad: 'meses', origen: 'caso', fuente: 'Caso', min: 1, max: 60, entero: true },
];

export const RAMP = {
  key: 'ramp',
  grupo: 'fase2',
  label: 'Maduración de ventas de tiendas (año 1 a 5)',
  origen: 'propio',
  fuente: 'Supuesto: 50 % / 75 % / 100 %',
};

export const COSTOS = { origen: 'caso', fuente: C };

export const CAMPOS_ESCENARIO = [
  { key: 'g', label: 'Crecimiento online anual (g)', unidad: 'pct', min: -0.99, max: 1 },
  { key: 'b2b', label: 'Ventas B2B adicionales al año 3 (sobre 2025)', unidad: 'pct', min: -0.99, max: 5 },
  { key: 'lima', label: 'Ventas tienda Lima madura (anual)', unidad: 'soles', min: 0 },
  { key: 'aqp', label: 'Ventas tienda Arequipa madura (anual)', unidad: 'soles', min: 0 },
  { key: 'prob', label: 'Probabilidad del escenario', unidad: 'pct', min: 0, max: 1 },
];

export const CAMPO_POR_CLAVE = Object.fromEntries(CAMPOS.map((c) => [c.key, c]));
