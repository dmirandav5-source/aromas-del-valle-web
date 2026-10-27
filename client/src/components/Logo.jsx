// Logo original de Aromas del Valle: un grano de café cuyo surco es un río
// que baja por un valle andino, con un sol terracota.
import { useId } from 'react';

export function LogoIcono({ size = 40, className = '', titulo = 'Aromas del Valle' }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={titulo}
      className={className}
    >
      <defs>
        <clipPath id={`grano-${id}`}>
          <ellipse cx="32" cy="32" rx="21" ry="28" transform="rotate(-24 32 32)" />
        </clipPath>
      </defs>
      <ellipse cx="32" cy="32" rx="21" ry="28" transform="rotate(-24 32 32)" fill="#4E342E" />
      <g clipPath={`url(#grano-${id})`}>
        <circle cx="40" cy="19" r="5.5" fill="#D0602E" />
        <path d="M2 50 L19 27 L27 36 L36 22 L62 52 L62 64 L2 64 Z" fill="#2F6B4F" />
        <path d="M19 27 L23 32.4 L21 32 L19 34 L16.6 30.2 Z M36 22 L40.6 27.3 L38 26.6 L35.6 29 L32.6 27 Z" fill="#F4ECE1" />
        <path d="M2 58 L22 44 L34 50 L62 40 L62 64 L2 64 Z" fill="#1F4F39" />
      </g>
      <path
        d="M41 8.5 C 30 18, 36 30, 29 40 S 24 54, 23 56"
        fill="none"
        stroke="#F4ECE1"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LogoHorizontal({ className = '', size = 40, subtitulo = true }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoIcono size={size} titulo="" />
      <span className="flex flex-col leading-none">
        <span className="font-serif text-[1.15rem] font-semibold tracking-tight text-cafe">Aromas del Valle</span>
        {subtitulo && (
          <span className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-terracota">
            Café de origen peruano
          </span>
        )}
      </span>
    </span>
  );
}
