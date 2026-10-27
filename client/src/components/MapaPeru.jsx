// Mapa estático y simplificado del Perú en SVG propio (sin APIs de mapas).
// El contorno es esquemático, no cartográfico.
const CIUDADES = [
  { id: 'cusco', nombre: 'Cusco', detalle: 'Tienda, oficina y tostadero (Urubamba)', x: 268, y: 392, tipo: 'sede' },
  { id: 'lima', nombre: 'Lima', detalle: 'Tienda propuesta: Miraflores', x: 128, y: 352, tipo: 'propuesta' },
  { id: 'arequipa', nombre: 'Arequipa', detalle: 'Tienda propuesta: Yanahuara', x: 262, y: 470, tipo: 'propuesta' },
];

const ORIGENES = [
  { nombre: 'Cajamarca', x: 92, y: 178, rx: 30, ry: 26 },
  { nombre: 'Junín', x: 178, y: 318, rx: 34, ry: 24 },
  { nombre: 'Cusco', x: 262, y: 372, rx: 40, ry: 30 },
];

export default function MapaPeru() {
  return (
    <figure className="tarjeta p-4">
      <svg viewBox="0 0 380 540" className="mx-auto h-auto w-full max-w-sm" role="img" aria-labelledby="mapa-titulo mapa-desc">
        <title id="mapa-titulo">Mapa esquemático del Perú</title>
        <desc id="mapa-desc">
          Sede en Cusco; tiendas propuestas en Lima y Arequipa; regiones de origen del café: Cajamarca, Junín y Cusco.
        </desc>
        <path
          d="M70 40 L120 30 L160 60 L215 70 L250 110 L300 150 L320 210 L300 250 L330 300 L350 360 L330 420 L320 470 L300 510 L250 500 L200 460 L160 420 L120 380 L95 330 L70 270 L50 220 L30 170 L20 120 L40 80 Z"
          fill="rgb(var(--elevada))"
          stroke="rgb(var(--borde))"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <text x="40" y="500" className="fill-tenue" fontSize="12" fontStyle="italic">
          Océano Pacífico
        </text>
        {ORIGENES.map((o) => (
          <g key={o.nombre}>
            <ellipse cx={o.x} cy={o.y} rx={o.rx} ry={o.ry} fill="rgb(var(--andino) / .18)" stroke="rgb(var(--andino))" strokeDasharray="4 3" />
            <text x={o.x} y={o.y - o.ry - 5} textAnchor="middle" fontSize="11" fontWeight="600" fill="rgb(var(--andino))">
              ☕ {o.nombre}
            </text>
          </g>
        ))}
        <path d="M268 392 Q 190 360 128 352" fill="none" stroke="rgb(var(--terracota))" strokeWidth="1.5" strokeDasharray="5 4" />
        <path d="M268 392 Q 275 430 262 470" fill="none" stroke="rgb(var(--terracota))" strokeWidth="1.5" strokeDasharray="5 4" />
        {CIUDADES.map((c) => (
          <g key={c.id}>
            {c.tipo === 'sede' ? (
              <circle cx={c.x} cy={c.y} r="9" fill="rgb(var(--cafe))" stroke="rgb(var(--superficie))" strokeWidth="3" />
            ) : (
              <circle cx={c.x} cy={c.y} r="7" fill="rgb(var(--superficie))" stroke="rgb(var(--terracota))" strokeWidth="3" />
            )}
            <text
              x={c.id === 'lima' ? c.x - 12 : c.x + 14}
              y={c.y + 4}
              textAnchor={c.id === 'lima' ? 'end' : 'start'}
              fontSize="13"
              fontWeight="700"
              fill="rgb(var(--tinta))"
            >
              {c.nombre}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-3 grid gap-1.5 text-xs text-suave">
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-cafe" aria-hidden="true" /> Sede actual: Cusco (tienda, oficina y tostadero en Urubamba)
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full border-[3px] border-terracota" aria-hidden="true" /> Tiendas propuestas: Miraflores (Lima) y Yanahuara (Arequipa)
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full border border-dashed border-andino bg-andino/20" aria-hidden="true" /> Regiones de origen del café: Cajamarca, Junín y Cusco
        </span>
        <span className="text-tenue">Mapa esquemático, no a escala.</span>
      </figcaption>
    </figure>
  );
}
