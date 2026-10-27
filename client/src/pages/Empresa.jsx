import { Cabecera, Revelar } from '../components/ui.jsx';
import { LogoHorizontal, LogoIcono } from '../components/Logo.jsx';
import MapaPeru from '../components/MapaPeru.jsx';
import { useModelo } from '../state/ModelContext.jsx';
import { pct, soles } from '../lib/format.js';

const VALORES = [
  ['Trazabilidad', 'Finca, variedad y proceso de cada lote.'],
  ['Comercio justo', 'Compra anticipada a 18 familias, 25-35 % sobre el precio de bolsa.'],
  ['Calidad', 'Cafés de 84-87 puntos SCA.'],
  ['Experiencia', 'Catas, talleres y una tienda pensada para el visitante.'],
  ['Sostenibilidad', 'Relaciones duraderas con productores y clientes.'],
];

const OBJETIVOS = [
  'Eliminar los pedidos rechazados en temporada alta, que hoy opera al 95 % de la capacidad.',
  'Hacer crecer las ventas online y las suscripciones a un ritmo mayor que el del mercado (12-15 % anual).',
  'Ordenar el canal B2B con contratos y un precio piso.',
  'Reducir costos de merma y empaque.',
  'Decidir con indicadores (VPN, TIR, B/C) si las tiendas físicas crean valor.',
];

export default function Empresa() {
  const { r } = useModelo();
  const v = r.costos.ventas2025;
  const s = r.supuestos;
  const canales = [
    { nombre: 'Tienda física', pct: s.shTienda, ventas: v.tienda, texto: 'Centro histórico de Cusco: turismo y clientes locales. Catas gratuitas los sábados y talleres de preparación.' },
    { nombre: 'Online', pct: s.shOnline, ventas: v.online, texto: 'Página web y WhatsApp Business con envíos a todo el país. 4,200 clientes recurrentes; 41 % son suscripciones.' },
    { nombre: 'B2B', pct: s.shB2B, ventas: v.b2b, texto: '12 cafeterías independientes y 3 hoteles boutique en Cusco y el Valle Sagrado.' },
  ];

  return (
    <>
      <Cabecera etiqueta="Empresa" titulo="Aromas del Valle S.A.C.">
        <p>Café de origen peruano. Fundada en 2018 en Cusco: 8 años tostando, empacando y vendiendo café de especialidad de Cusco, Junín y Cajamarca.</p>
      </Cabecera>

      <div className="contenedor grid grid-cols-1 gap-10 py-12 lg:grid-cols-[1.2fr_1fr]">
        <Revelar>
          <h2 className="text-2xl font-semibold">Misión</h2>
          <blockquote className="mt-3 border-l-4 border-terracota pl-4 font-serif text-lg italic text-tinta">
            «Llevar a cada taza el café de especialidad de las familias productoras del Perú, con trazabilidad completa desde la finca y un
            tueste artesanal que respeta el origen, generando relaciones justas y duraderas con nuestros productores y clientes».
          </blockquote>
          <h2 className="mt-8 text-2xl font-semibold">Visión</h2>
          <blockquote className="mt-3 border-l-4 border-andino pl-4 font-serif text-lg italic text-tinta">
            «Ser al 2030 la marca peruana de café de especialidad de origen más reconocida por su calidad y trazabilidad en el sur del país, con
            presencia nacional a través de canales digitales y alianzas con las mejores cafeterías».
          </blockquote>
          <h2 className="mt-8 text-2xl font-semibold">Valores</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {VALORES.map(([t, d]) => (
              <li key={t} className="tarjeta p-3">
                <p className="font-semibold text-cafe">{t}</p>
                <p className="text-sm text-suave">{d}</p>
              </li>
            ))}
          </ul>
        </Revelar>
        <Revelar>
          <h2 className="text-2xl font-semibold">Ubicación</h2>
          <ul className="prosa mt-2 text-sm">
            <li><strong>Tienda y oficina:</strong> Jr. Los Cafetales 245, Centro Histórico, Cusco, Perú.</li>
            <li><strong>Tostadero artesanal:</strong> Urubamba, Valle Sagrado de los Incas, Cusco.</li>
            <li><strong>Puntos de venta propuestos:</strong> Miraflores (Lima) y Yanahuara (Arequipa).</li>
          </ul>
          <div className="mt-4">
            <MapaPeru />
          </div>
          <p className="mt-4 text-sm text-suave">
            <strong className="text-tinta">Contacto:</strong> contacto@aromasdelvalle.example · +51 984 000 000 · WhatsApp Business
          </p>
        </Revelar>
      </div>

      <section className="border-y border-borde bg-elevada/50">
        <div className="contenedor py-12">
          <h2 className="text-2xl font-semibold">Objetivos del proyecto</h2>
          <p className="mt-3 max-w-3xl text-lg text-tinta">
            <strong>Objetivo general:</strong> «Evaluar la viabilidad económica de expandir la capacidad de tostado, el canal online, el canal B2B y la
            apertura de tiendas en Lima y Arequipa en 2026-2030, y elegir la alternativa que maximice el valor para los socios».
          </p>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {OBJETIVOS.map((o, i) => (
              <li key={i} className="tarjeta flex gap-3 p-4">
                <span className="font-serif text-2xl font-semibold text-terracota">{i + 1}</span>
                <span className="text-sm">{o}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="contenedor py-12">
        <h2 className="text-2xl font-semibold">Línea de tiempo</h2>
        <ol className="relative mt-6 grid gap-6 border-l-2 border-borde pl-6 sm:grid-cols-3 sm:border-l-0 sm:border-t-2 sm:pl-0 sm:pt-6">
          {[
            ['2018', 'Fundación en Cusco', 'Tostadero artesanal de 80 kg/día y tienda en el centro histórico.'],
            ['2025', `${soles(s.facturacion)} de facturación`, 'Tres canales de venta; 18 familias productoras; 28,000 seguidores en Instagram y 9,500 en TikTok.'],
            ['2026', 'Proyecto de expansión', 'Máquina de 250 kg/día, empaque local, online, B2B y tiendas en Lima y Arequipa.'],
          ].map(([a, t, d]) => (
            <li key={a} className="relative">
              <span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full border-4 border-fondo bg-terracota sm:-top-[33px] sm:left-0" aria-hidden="true" />
              <p className="font-serif text-3xl font-semibold text-terracota">{a}</p>
              <p className="font-semibold text-cafe">{t}</p>
              <p className="text-sm text-suave">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="contenedor pb-4">
        <h2 className="text-2xl font-semibold">Situación actual (2025)</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {canales.map((c) => (
            <Revelar key={c.nombre} className="tarjeta p-5">
              <p className="etiqueta">{pct(c.pct, 0)} de las ventas</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-cafe">{c.nombre}</p>
              <p className="text-lg font-semibold tabular-nums">{soles(c.ventas)}</p>
              <div className="mt-2 h-2 rounded-full bg-elevada" aria-hidden="true">
                <div className="h-2 rounded-full bg-andino" style={{ width: `${c.pct * 100}%` }} />
              </div>
              <p className="mt-3 text-sm text-suave">{c.texto}</p>
            </Revelar>
          ))}
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ['Facturación 2025', soles(s.facturacion)],
            ['Clientes online recurrentes', '4,200'],
            ['Suscripciones (ventas online)', '41 %'],
            ['Familias productoras', '18'],
            ['Instagram', '28,000'],
            ['TikTok', '9,500'],
          ].map(([t, d]) => (
            <div key={t} className="tarjeta p-3">
              <dt className="text-xs text-suave">{t}</dt>
              <dd className="font-serif text-xl font-semibold text-cafe tabular-nums">{d}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="contenedor py-12">
        <h2 className="text-2xl font-semibold">Logo</h2>
        <p className="mt-1 text-sm text-suave">Un grano de café cuyo surco es un río que baja por un valle andino. Versión horizontal y solo ícono.</p>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <div className="tarjeta p-6"><LogoHorizontal size={56} /></div>
          <div className="tarjeta p-6"><LogoIcono size={72} /></div>
        </div>
      </section>
    </>
  );
}
