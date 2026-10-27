import { useState } from 'react';
import { useModelo } from '../state/ModelContext.jsx';
import { Cabecera } from '../components/ui.jsx';
import { exportarExcel } from '../lib/exportar.js';

const EXCEL = 'Aromas_del_Valle_modelo_paso_a_paso.xlsx';

export default function Descargas() {
  const { borrador, r, sinGuardar, notificar } = useModelo();
  const [ocupado, setOcupado] = useState(false);
  const exportar = async () => {
    setOcupado(true);
    try {
      await exportarExcel(borrador, r);
    } catch (e) {
      notificar(`No se pudo exportar: ${e.message}`, 'error');
    } finally {
      setOcupado(false);
    }
  };
  return (
    <>
      <Cabecera etiqueta="Descargas" titulo="Descargas" />
      <div className="contenedor grid grid-cols-1 gap-6 py-10 md:grid-cols-2">
        <div className="tarjeta p-6">
          <p className="etiqueta">Original</p>
          <h2 className="mt-1 text-2xl font-semibold">Modelo financiero en Excel</h2>
          <p className="mt-2 text-sm text-suave">
            El archivo definitivo con las 14 hojas: Resumen, Paso_a_paso, Supuestos, Tasas, Factores, Costos_Margenes, Prestamo, Flujo_Pesimista,
            Flujo_Base, Flujo_Optimista, Incremental, Equilibrio, Inflacion y Sensibilidad. Contiene los valores originales.
          </p>
          <a href={`/descargas/${EXCEL}`} download className="btn-primario mt-5 max-w-full break-all text-center">
            Descargar el Excel original (.xlsx)
          </a>
          <p className="mt-2 break-all text-xs text-tenue">{EXCEL}</p>
        </div>
        <div className="tarjeta p-6">
          <p className="etiqueta">Actual</p>
          <h2 className="mt-1 text-2xl font-semibold">Exportar supuestos y resultados</h2>
          <p className="mt-2 text-sm text-suave">
            Genera un Excel con dos hojas: <strong>Supuestos</strong> (todos los valores que estás usando) y <strong>Resultados</strong> (VPN, VAE, TIR,
            TER, B/C y recuperación por escenario, VPN esperado, análisis incremental, equilibrio y flujos del escenario base).
            {sinGuardar && ' Incluye tus cambios sin guardar.'}
          </p>
          <button type="button" className="btn-primario mt-5" onClick={exportar} disabled={ocupado}>
            {ocupado ? 'Generando…' : 'Exportar a Excel'}
          </button>
        </div>
      </div>
    </>
  );
}
