import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './styles.css';
import { ModelProvider } from './state/ModelContext.jsx';
import Layout from './components/Layout.jsx';
import Inicio from './pages/Inicio.jsx';

const Empresa = lazy(() => import('./pages/Empresa.jsx'));
const Caso = lazy(() => import('./pages/Caso.jsx'));
const Solucion = lazy(() => import('./pages/Solucion.jsx'));
const Modelo = lazy(() => import('./pages/Modelo.jsx'));
const Supuestos = lazy(() => import('./pages/Supuestos.jsx'));
const Respuestas = lazy(() => import('./pages/Respuestas.jsx'));
const Descargas = lazy(() => import('./pages/Descargas.jsx'));
const NoEncontrado = lazy(() => import('./pages/NoEncontrado.jsx'));

const Cargando = () => <p className="contenedor py-20 text-center text-suave">Cargando…</p>;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ModelProvider>
        <Suspense fallback={<Cargando />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Inicio />} />
              <Route path="empresa" element={<Empresa />} />
              <Route path="caso" element={<Caso />} />
              <Route path="solucion" element={<Solucion />} />
              <Route path="modelo" element={<Modelo />} />
              <Route path="modelo/:hoja" element={<Modelo />} />
              <Route path="supuestos" element={<Supuestos />} />
              <Route path="respuestas" element={<Respuestas />} />
              <Route path="descargas" element={<Descargas />} />
              <Route path="*" element={<NoEncontrado />} />
            </Route>
          </Routes>
        </Suspense>
      </ModelProvider>
    </BrowserRouter>
  </StrictMode>,
);
