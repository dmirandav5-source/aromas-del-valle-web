import { Link } from 'react-router-dom';

export default function NoEncontrado() {
  return (
    <div className="contenedor py-24 text-center">
      <p className="etiqueta">Error 404</p>
      <h1 className="mt-2 text-4xl font-semibold">Esta página no existe</h1>
      <p className="mt-6">
        <Link to="/" className="btn-primario">
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}
