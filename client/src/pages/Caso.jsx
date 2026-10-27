// Resumen del enunciado original (referencia/Caso_de_estudio_2026.docx)
import { Link } from 'react-router-dom';
import { Acordeon, Cabecera, N, Nota, Tabla } from '../components/ui.jsx';
import { useModelo } from '../state/ModelContext.jsx';
import { num, pct } from '../lib/format.js';

const SITUACION = [
  ['Calidad y posicionamiento', 'El café se comercializa como «especialidad» con puntuaciones SCA entre 84 y 87 puntos. Tienen trazabilidad completa (finca, variedad, proceso), lo que les ha permitido construir una reputación sólida entre baristas y consumidores exigentes. El ticket promedio en tienda es de S/ 68 (incluye café molido + accesorios o bebidas).'],
  ['Relación con productores', 'Trabajan directamente con 18 familias productoras mediante contratos de compra anticipada a precios 25-35 % por encima del precio de bolsa. Esto les garantiza suministro estable de café verde de calidad y genera lealtad. Pagan en efectivo o transferencia a 7 días.'],
  ['Experiencia de compra en tienda', 'La tienda de Cusco ofrece catas gratuitas los sábados, talleres de preparación y un ambiente «instagrammable». El 34 % de los clientes de tienda repite compra en menos de 60 días.'],
  ['Canal online', 'Tienen una base de 4,200 clientes recurrentes. El 41 % de las ventas online son suscripciones mensuales (café de 250 g o 500 g). La tasa de abandono de carrito es baja (22 %) gracias a un proceso de checkout simple por WhatsApp.'],
  ['Marca y storytelling', 'Comunican bien el origen, las historias de los productores y el proceso de tueste. Tienen buen engagement en Instagram (28,000 seguidores) y TikTok (9,500).'],
  ['Capacidad de producción limitada', 'En temporada alta (junio-agosto y diciembre) rechazan pedidos de cafeterías porque no pueden tostar más. El tostadero actual opera al 95 % de capacidad en esos meses.'],
  ['Empaque y costos de envío', 'Usan bolsas trilaminadas importadas que se han encarecido 18 % en el último año. El empaque representa el 9 % del costo del producto terminado. Los envíos a Lima y Arequipa tardan 4-6 días y el flete (S/ 12-18 por paquete de 500 g) reduce el margen del canal online.'],
  ['Gestión de inventarios y rotación', 'Tienen sobrestock de algunas variedades menos populares (especialmente lavados de Cajamarca) y faltantes de las más demandadas (naturales y honey de Cusco). No usan un sistema formal de pronóstico de demanda.'],
  ['Precio y percepción de valor', 'El precio actual de 250 g es S/ 42-48. Algunos clientes de Lima lo consideran «caro» frente a marcas más conocidas, aunque la calidad es comparable o superior. No hay una estrategia clara de precios diferenciados por canal ni por volumen.'],
  ['Dependencia del turismo', 'El 48 % de las ventas de la tienda física proviene de turistas extranjeros. La recuperación del turismo post-pandemia ha sido irregular y cualquier crisis (clima, protestas, tipo de cambio) impacta fuerte.'],
  ['Equipo comercial reducido', 'Solo hay una persona dedicada a ventas B2B. No existen metas formales ni un CRM. La tasa de conversión de prospectos B2B es baja (alrededor del 18 %).'],
];

const MERCADO = [
  'El segmento de café de especialidad crece a tasas de 12-15 % anual en Lima y ciudades intermedias. Cada vez más consumidores jóvenes (25-40 años) buscan origen, sostenibilidad y experiencia.',
  'Auge de las suscripciones y el e-commerce de alimentos premium. Plataformas como Rappi y Cornershop abren espacios para productos gourmet; el pago con tarjetas y billeteras digitales facilita la compra recurrente.',
  'Interés de cafeterías independientes y cadenas medianas por diferenciarse con orígenes peruanos de alta puntuación: oportunidad de contratos de suministro trimestral o semestral.',
  'Posible alianza con cooperativas o exportadoras con presencia en Lima para usar su red logística (podría reducir costos de envío).',
  'Tendencia de «café de origen único» y ediciones limitadas: micro-lotes de temporada a precios premium (S/ 55-65 por 250 g).',
  'Recuperación del turismo internacional hacia Cusco y el Valle Sagrado, que favorece la tienda física y los «souvenirs de café».',
  'Inflación y poder adquisitivo: aunque la inflación se ha moderado, el costo de vida en Lima sigue alto; el consumidor de clase media-alta es más sensible al precio de productos no esenciales.',
  'Tipo de cambio y costos importados: el empaque, las válvulas de desgasificación y parte de la maquinaria se importan; un sol más débil eleva estos costos. El café verde de algunas zonas ha subido por menores rendimientos climáticos.',
];

const COMPETENCIA = [
  'Marcas peruanas consolidadas (Café del Mundo, Tostaduría Bisetti, Origen, Café Verde, entre otras) con mayor presencia en supermercados y mejor distribución.',
  'Importadores de café colombiano y brasileño que compiten en precio en el segmento «premium accesible».',
  'Tostadurías pequeñas y medianas que abren en Lima y Arequipa con propuestas similares de «origen + experiencia».',
  'Cadenas internacionales y cafeterías de especialidad que tuestan su propio café o compran a grandes volúmenes.',
];

const PREFERENCIAS = [
  'El consumidor peruano promedio aún prioriza precio y conveniencia sobre puntuación SCA. Solo un segmento (8-12 % del mercado total de café) paga consistentemente más de S/ 40 por 250 g.',
  'Crece la preferencia por formatos más pequeños (150-200 g) y por café molido listo para usar.',
  'Aumenta la demanda de opciones «sin cafeína» y de procesos experimentales (anaeróbicos, co-fermentados), segmentos donde Aromas del Valle aún no tiene oferta.',
];

const ECONOMIA = [
  'Crecimiento moderado del PBI peruano (alrededor de 2.5-3 %).',
  'Posible presión en el tipo de cambio si se mantienen tensiones políticas o menores precios de commodities.',
  'Tasas de interés todavía relativamente altas, lo que encarece el financiamiento de la expansión.',
  'Mayor formalización y controles sanitarios y tributarios sobre pequeños productores y tostadurías, que podrían elevar costos de cumplimiento.',
];

export const PREGUNTAS = [
  '¿Es viable financieramente el proyecto de expansión considerando los costos actuales, los márgenes por canal y los factores de riesgo externos?',
  '¿Qué estrategia de precios debería adoptar la empresa en cada canal (tienda, online, B2B) para mejorar la rentabilidad sin perder competitividad?',
  '¿Cuáles son las principales oportunidades de mejora en la cadena de valor (proveedores, producción, empaque, logística, ventas) y cómo impactan el flujo de caja del proyecto?',
  '¿Qué escenarios de demanda (optimista, base, pesimista) son razonables dados el entorno económico, la competencia y las preferencias de los consumidores?',
  '¿Conviene priorizar el crecimiento del canal online y las suscripciones, o la apertura de tiendas físicas en Lima y Arequipa? Justifique con los datos disponibles.',
  'Identifique qué información es crítica, cuál es secundaria y qué datos adicionales solicitaría antes de tomar una decisión de inversión.',
];

const Lista = ({ items }) => (
  <ul className="prosa">
    {items.map((t, i) => (
      <li key={i}>{t}</li>
    ))}
  </ul>
);

export default function Caso() {
  const { r } = useModelo();
  const c = r.costos;
  return (
    <>
      <Cabecera etiqueta="El caso" titulo="«Aromas del Valle»: evaluación de un proyecto de expansión de café tostado de especialidad">
        <p>Resumen del enunciado original del caso de estudio 2026.</p>
      </Cabecera>
      <div className="contenedor max-w-4xl py-10">
        <h2 className="text-2xl font-semibold">Información general</h2>
        <div className="prosa">
          <p>
            Aromas del Valle es una empresa familiar peruana con 8 años de operación, ubicada en Cusco. Se dedica al tostado, empaquetado y
            comercialización de café de especialidad de origen peruano (principalmente de Cusco, Junín y Cajamarca). Opera un pequeño tostadero
            artesanal de <strong>80 kg por día</strong> y vende por tres canales: su tienda en el centro histórico de Cusco, la venta online
            (página web y WhatsApp Business, con envíos a todo el país) y la distribución a 12 cafeterías independientes y 3 hoteles boutique.
          </p>
          <p>
            En 2025 facturó aproximadamente <strong>S/ 1.85 millones</strong>, con un margen bruto promedio de 42 %: el 58 % de las ventas viene de
            la tienda, el 27 % del canal online y el 15 % de cafeterías y hoteles.
          </p>
          <p>
            La familia propietaria (padre, madre e hijo de 32 años que estudió administración) evalúa un proyecto de expansión para 2026-2028:
            aumentar la capacidad de tostado a 250 kg/día, mejorar el empaque, reforzar el canal online y abrir dos puntos de venta (Lima y
            Arequipa). La inversión estimada es de <strong>S/ 480,000</strong> (maquinaria, acondicionamiento de local, capital de trabajo y
            marketing inicial).
          </p>
        </div>

        <h2 className="mt-10 text-2xl font-semibold">Situación actual de ventas</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {SITUACION.map(([t, d]) => (
            <div key={t} className="tarjeta p-4">
              <p className="font-semibold text-cafe">{t}</p>
              <p className="mt-1 text-sm text-tinta">{d}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-2xl font-semibold">Mercado, competencia y entorno</h2>
        <Acordeon titulo="Situaciones de mercado" abierto>
          <Lista items={MERCADO} />
        </Acordeon>
        <Acordeon titulo="Competencia intensa">
          <Lista items={COMPETENCIA} />
        </Acordeon>
        <Acordeon titulo="Preferencias de mercado">
          <Lista items={PREFERENCIAS} />
        </Acordeon>
        <Acordeon titulo="Condiciones económicas generales (2026 proyectado)">
          <Lista items={ECONOMIA} />
        </Acordeon>

        <h2 className="mt-10 text-2xl font-semibold">Costos del producto (por kg tostado, 2025)</h2>
        <p className="mt-2 text-sm text-suave">Tabla original del caso (imagen) y la misma tabla con los porcentajes recalculados:</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2 lg:items-start">
          <img
            src="/tabla-costos-caso.png"
            alt="Tabla del caso: café verde S/ 28.50 (52 %), merma de tostado S/ 5.20 (9.5 %), mano de obra directa S/ 3.80 (7 %), energía y gas S/ 2.10 (3.8 %), empaque S/ 4.90 (9 %), control de calidad S/ 1.40 (2.5 %), costos indirectos S/ 3.60 (6.6 %); costo total S/ 49.50 (100 %)."
            className="w-full rounded-xl border border-borde bg-white p-2"
            loading="lazy"
          />
          <Tabla titulo="Costo por kg con porcentajes recalculados">
            <thead>
              <tr>
                <th>Concepto</th>
                <th className="num">S/ por kg</th>
                <th className="num">% calculado</th>
                <th className="num">% del caso</th>
              </tr>
            </thead>
            <tbody>
              {c.rubros.map((x) => (
                <tr key={x.id}>
                  <td>{x.rubro}</td>
                  <td className="num"><N v={x.valor} dec={2} /></td>
                  <td className="num">{pct(x.pct)}</td>
                  <td className="num">{pct(x.pctCaso)}</td>
                </tr>
              ))}
              <tr className="total">
                <td>Costo total de producción</td>
                <td className="num">{num(c.U, 2)}</td>
                <td className="num">100 %</td>
                <td className="num">{pct(c.pctCasoTotal)}</td>
              </tr>
            </tbody>
          </Tabla>
        </div>
        <Nota tipo="aviso" titulo={`Los porcentajes del caso suman ${pct(c.pctCasoTotal)}, no 100 %`}>
          No cuadran con los soles: por ejemplo, 28.50 / 49.50 = 57.6 %, no 52 %. El modelo usa los soles por kg, que sí suman S/ 49.50.
        </Nota>
        <Acordeon titulo="Notas adicionales sobre costos y precios">
          <Lista
            items={[
              'El café verde varía según origen y proceso: naturales y honey de Cusco cuestan S/ 26-32 por kg verde; lavados de Cajamarca, S/ 24-28.',
              'El empaque importado ha subido; con un proveedor local o compra por volumen podría bajar a S/ 3.80-4.20 por kg.',
              'Costos de comercialización no incluidos en la tabla: pasarela de pago o WhatsApp Business 2.5-3.5 % de la venta online; flete nacional S/ 14 por paquete de 500 g (S/ 28 por kg); comisión a cafeterías y hoteles de 15-25 % del precio de lista; marketing digital ≈ S/ 4.50 por kg vendido online.',
              'Precio al público: 250 g a S/ 42-48 (S/ 168-192 por kg); 500 g a S/ 78-88. Precio a cafeterías: S/ 95-110 por kg según volumen y frecuencia.',
              'El margen bruto sobre el costo de producción ronda el 42 % en venta directa y baja a 18-25 % en cafeterías después de descuentos y comisiones.',
            ]}
          />
        </Acordeon>
        <Acordeon titulo="Información adicional disponible para el análisis">
          <Lista
            items={[
              'Histórico de ventas mensuales de los últimos 24 meses (estacionalidad por turismo y campañas de fin de año).',
              'Datos de rotación por variedad y por canal.',
              'Encuesta informal a 180 clientes (preferencias de origen, formato, precio máximo y frecuencia de compra).',
              'Cotizaciones preliminares de maquinaria de mayor capacidad: una semiautomática brasileña y una china más económica.',
              'Financiamiento: préstamo bancario a 36 meses con tasa efectiva anual de 14.5 %, o leasing de maquinaria.',
              'Estimaciones de demanda potencial en Lima y Arequipa basadas en densidad de cafeterías de especialidad y poder adquisitivo.',
            ]}
          />
        </Acordeon>

        <h2 className="mt-10 text-2xl font-semibold">Las seis preguntas</h2>
        <ol className="mt-4 space-y-3">
          {PREGUNTAS.map((p, i) => (
            <li key={i} className="tarjeta flex gap-4 p-4">
              <span className="font-serif text-2xl font-semibold text-terracota">{i + 1}</span>
              <span>{p}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6">
          <Link to="/respuestas" className="btn-primario">Ver las respuestas →</Link>
        </p>
      </div>
    </>
  );
}
