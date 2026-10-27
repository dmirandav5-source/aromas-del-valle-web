// Tabla de flujo por año (Año 0 a Año 5). Cada fila: { label, vals, tipo?: 'total' | 'seccion', dec? }
import { N, Tabla } from './ui.jsx';

export function FlujoTabla({ titulo, filas, concepto = 'Concepto', anios = [0, 1, 2, 3, 4, 5], extra }) {
  return (
    <Tabla titulo={titulo}>
      <thead>
        <tr>
          <th scope="col">{concepto}</th>
          {anios.map((t) => (
            <th key={t} scope="col" className="num">
              Año {t}
            </th>
          ))}
          {extra && <th scope="col" className="num">{extra.titulo}</th>}
        </tr>
      </thead>
      <tbody>
        {filas.map((f, i) =>
          f.tipo === 'seccion' ? (
            <tr key={i} className="seccion">
              <td colSpan={anios.length + 1 + (extra ? 1 : 0)}>{f.label}</td>
            </tr>
          ) : (
            <tr key={i} className={f.tipo === 'total' ? 'total' : ''}>
              <th scope="row" className={`${f.tipo === 'total' ? '!bg-elevada' : '!bg-transparent'} border-t border-borde !px-3 !py-1.5 !text-left !text-sm !font-normal !text-tinta`} style={{ whiteSpace: 'normal', minWidth: '14rem' }}>
                {f.tipo === 'total' ? <strong>{f.label}</strong> : f.label}
              </th>
              {anios.map((t) => (
                <td key={t} className="num">
                  <N v={f.vals[t]} dec={f.dec ?? 0} />
                </td>
              ))}
              {extra && <td className="num">{f.extra}</td>}
            </tr>
          ),
        )}
      </tbody>
    </Tabla>
  );
}
