// Estructura común: barra superior fija, banner de cambios, avisos, pie y botón para volver arriba.
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { LogoHorizontal, LogoIcono } from './Logo.jsx';
import { useModelo } from '../state/ModelContext.jsx';

const SECCIONES = [
  { to: '/', texto: 'Inicio', fin: true },
  { to: '/empresa', texto: 'Empresa' },
  { to: '/caso', texto: 'El caso' },
  { to: '/solucion', texto: 'Solución' },
  { to: '/modelo', texto: 'Modelo' },
  { to: '/supuestos', texto: 'Supuestos' },
  { to: '/respuestas', texto: 'Respuestas' },
  { to: '/descargas', texto: 'Descargas' },
];

function useTema() {
  const leer = () => {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr) return attr;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  const [tema, setTema] = useState(leer);
  const cambiar = () => {
    const nuevo = tema === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nuevo);
    try {
      localStorage.setItem('tema', nuevo);
    } catch {
      /* sin almacenamiento */
    }
    setTema(nuevo);
  };
  return [tema, cambiar];
}

function BotonTema() {
  const [tema, cambiar] = useTema();
  const oscuro = tema === 'dark';
  return (
    <button
      type="button"
      onClick={cambiar}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-cafe hover:bg-elevada"
      aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={oscuro ? 'Modo claro' : 'Modo oscuro'}
    >
      {oscuro ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function Navegacion() {
  const [abierto, setAbierto] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setAbierto(false), [pathname]);

  const clase = ({ isActive }) =>
    `rounded-full px-3 py-1.5 text-sm font-medium no-underline transition-colors ${isActive ? 'bg-cafe text-fondo' : 'text-suave hover:bg-elevada hover:text-cafe'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-borde bg-fondo/90 backdrop-blur supports-[backdrop-filter]:bg-fondo/75">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded focus:bg-superficie focus:px-3 focus:py-2">
        Saltar al contenido
      </a>
      <div className="contenedor flex h-16 items-center justify-between gap-3">
        <Link to="/" className="no-underline" aria-label="Aromas del Valle, inicio">
          <span className="hidden sm:inline">
            <LogoHorizontal size={38} />
          </span>
          <span className="sm:hidden">
            <LogoHorizontal size={34} subtitulo={false} />
          </span>
        </Link>
        <nav aria-label="Secciones" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {SECCIONES.map((s) => (
              <li key={s.to}>
                <NavLink to={s.to} end={s.fin} className={clase}>
                  {s.texto}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <BotonTema />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-cafe hover:bg-elevada xl:hidden"
            aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={abierto}
            aria-controls="menu-movil"
            onClick={() => setAbierto((a) => !a)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {abierto ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      <nav id="menu-movil" aria-label="Secciones (menú)" hidden={!abierto} className="border-t border-borde bg-fondo xl:hidden">
        <ul className="contenedor grid grid-cols-2 gap-1 py-3 sm:grid-cols-4">
          {SECCIONES.map((s) => (
            <li key={s.to}>
              <NavLink to={s.to} end={s.fin} className={(p) => `${clase(p)} block text-center`}>
                {s.texto}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function BannerCambios() {
  const { sinGuardar, descartar } = useModelo();
  const { pathname } = useLocation();
  // En el panel ya hay un indicador propio en su barra de acciones
  if (!sinGuardar || pathname === '/supuestos') return null;
  // Franja fija inferior: no tapa la barra superior ni las barras fijas de cada página
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-aviso/50 bg-fondo/95 shadow-tarjeta backdrop-blur" role="status">
      <div className="contenedor flex flex-wrap items-center justify-between gap-2 py-2 pr-16 text-sm">
        <p className="font-medium text-tinta">
          <span className="text-aviso" aria-hidden="true">●</span> Cambios sin guardar: el sitio muestra los resultados con tus supuestos editados.
        </p>
        <div className="flex gap-2">
          <Link to="/supuestos" className="btn-secundario !px-3 !py-1">
            Ir al panel
          </Link>
          <button type="button" className="btn-secundario !px-3 !py-1" onClick={descartar}>
            Descartar
          </button>
        </div>
      </div>
    </div>
  );
}

function Avisos() {
  const { mensajes, cerrarMensaje } = useModelo();
  const color = { ok: 'border-bien', aviso: 'border-aviso', error: 'border-mal', info: 'border-andino' };
  return (
    <div className="pointer-events-none fixed bottom-20 left-1/2 z-50 flex w-[min(28rem,calc(100%-2rem))] -translate-x-1/2 flex-col gap-2" aria-live="polite">
      {mensajes.map((m) => (
        <div key={m.id} className={`tarjeta pointer-events-auto flex items-start justify-between gap-3 border-l-4 px-4 py-3 text-sm ${color[m.tipo]}`}>
          <p>{m.texto}</p>
          <button type="button" onClick={() => cerrarMensaje(m.id)} aria-label="Cerrar aviso" className="text-suave hover:text-tinta">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

function VolverArriba() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const f = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0 })}
      className="fixed bottom-20 right-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full bg-cafe text-fondo shadow-tarjeta hover:bg-cafe/90"
      aria-label="Volver arriba"
    >
      ↑
    </button>
  );
}

function Pie() {
  return (
    <footer className="mt-20 border-t border-borde bg-elevada/60">
      <div className="contenedor grid grid-cols-1 gap-8 py-10 sm:grid-cols-3">
        <div>
          <LogoIcono size={44} />
          <p className="mt-3 font-serif text-lg font-semibold text-cafe">Aromas del Valle S.A.C.</p>
          <p className="text-sm text-suave">Café de origen peruano · Cusco, desde 2018</p>
        </div>
        <div className="text-sm text-suave">
          <p className="font-semibold text-tinta">Contacto</p>
          <p className="mt-2">Jr. Los Cafetales 245, Centro Histórico, Cusco</p>
          <p>contacto@aromasdelvalle.example</p>
          <p>+51 984 000 000 · WhatsApp Business</p>
        </div>
        <div className="text-sm text-suave">
          <p className="font-semibold text-tinta">El sitio</p>
          <ul className="mt-2 space-y-1">
            <li><Link to="/solucion">Solución paso a paso</Link></li>
            <li><Link to="/modelo">Modelo financiero (14 hojas)</Link></li>
            <li><Link to="/supuestos">Panel de supuestos</Link></li>
            <li><Link to="/descargas">Descargas</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-borde">
        <p className="contenedor py-4 text-xs text-suave">
          <strong>Caso académico. Empresa, direcciones y datos de contacto ficticios.</strong> Evaluación elaborada para el curso de Ingeniería Económica.
        </p>
      </div>
    </footer>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const { sinConexion, sinGuardar } = useModelo();
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className={`flex min-h-screen flex-col ${sinGuardar && pathname !== '/supuestos' ? 'pb-24 sm:pb-14' : ''}`}>
      <Navegacion />
      <BannerCambios />
      {sinConexion && (
        <p className="bg-aviso/15 py-1.5 text-center text-xs text-tinta">
          Sin conexión con el servidor: se muestran los valores del Excel y los cambios no se pueden guardar.
        </p>
      )}
      <main id="contenido" className="flex-1">
        <Outlet />
      </main>
      <Pie />
      <VolverArriba />
      <Avisos />
    </div>
  );
}
