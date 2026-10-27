// Estado global del modelo: supuestos guardados en el servidor, borrador en edición
// y resultados recalculados en el navegador con el mismo motor del backend.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { calcular, kpis, SUPUESTOS_DEFAULT } from '@aromas/shared';
import { api } from '../lib/api.js';

const ModelContext = createContext(null);

const clonar = (x) => JSON.parse(JSON.stringify(x));
const RESULTADOS_EXCEL = calcular(SUPUESTOS_DEFAULT);
const KPIS_EXCEL = kpis(RESULTADOS_EXCEL);

export function ModelProvider({ children }) {
  const [guardado, setGuardado] = useState(() => clonar(SUPUESTOS_DEFAULT));
  const [borrador, setBorrador] = useState(() => clonar(SUPUESTOS_DEFAULT));
  const [estado, setEstado] = useState({ cargando: true, sinConexion: false, edicionProtegida: false });
  const [mensajes, setMensajes] = useState([]);

  const notificar = useCallback((texto, tipo = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setMensajes((m) => [...m, { id, texto, tipo }]);
    setTimeout(() => setMensajes((m) => m.filter((x) => x.id !== id)), tipo === 'error' ? 9000 : 5000);
  }, []);
  const cerrarMensaje = useCallback((id) => setMensajes((m) => m.filter((x) => x.id !== id)), []);

  // Aplica una respuesta del servidor { supuestos, avisos }.
  const aplicar = useCallback(
    (resp, { conservarBorrador = false } = {}) => {
      const sup = resp.supuestos ?? resp;
      setGuardado(clonar(sup));
      setBorrador((b) => (conservarBorrador ? { ...b, escenarios: clonar(sup.escenarios) } : clonar(sup)));
      (resp.avisos ?? []).forEach((a) => notificar(a, 'aviso'));
    },
    [notificar],
  );

  const recargar = useCallback(async () => {
    try {
      const [sup, salud] = await Promise.all([api('/supuestos'), api('/salud')]);
      setGuardado(clonar(sup));
      setBorrador(clonar(sup));
      setEstado({ cargando: false, sinConexion: false, edicionProtegida: salud.edicionProtegida });
    } catch {
      setEstado({ cargando: false, sinConexion: true, edicionProtegida: false });
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  // ── Edición del borrador ──
  const setCampo = useCallback((key, valor) => setBorrador((b) => ({ ...b, [key]: valor })), []);
  const setCosto = useCallback(
    (idx, valor) => setBorrador((b) => ({ ...b, costos: b.costos.map((c, i) => (i === idx ? { ...c, valor } : c)) })),
    [],
  );
  const setRamp = useCallback(
    (idx, valor) => setBorrador((b) => ({ ...b, ramp: b.ramp.map((r, i) => (i === idx ? valor : r)) })),
    [],
  );
  const setEscenario = useCallback(
    (id, key, valor) =>
      setBorrador((b) => ({ ...b, escenarios: b.escenarios.map((e) => (e.id === id ? { ...e, [key]: valor } : e)) })),
    [],
  );
  const descartar = useCallback(() => setBorrador(clonar(guardado)), [guardado]);

  const guardar = useCallback(async () => {
    const resp = await api('/supuestos', { method: 'PUT', body: borrador });
    aplicar(resp);
    notificar('Supuestos guardados.', 'ok');
  }, [borrador, aplicar, notificar]);

  const restablecer = useCallback(async () => {
    if (estado.sinConexion) {
      setGuardado(clonar(SUPUESTOS_DEFAULT));
      setBorrador(clonar(SUPUESTOS_DEFAULT));
      notificar('Se restablecieron los valores del Excel (sin conexión con el servidor).', 'aviso');
      return;
    }
    const resp = await api('/supuestos/restablecer', { method: 'POST' });
    aplicar(resp);
  }, [estado.sinConexion, aplicar, notificar]);

  const sinGuardar = useMemo(() => JSON.stringify(borrador) !== JSON.stringify(guardado), [borrador, guardado]);

  // Recálculo en vivo con el motor compartido
  const { resultados, errorCalculo } = useMemo(() => {
    try {
      return { resultados: calcular(borrador), errorCalculo: null };
    } catch (e) {
      return { resultados: null, errorCalculo: e };
    }
  }, [borrador]);
  const valido = resultados ?? RESULTADOS_EXCEL;
  const k = useMemo(() => kpis(valido), [valido]);

  const valor = {
    guardado,
    borrador,
    r: valido,
    kpis: k,
    rExcel: RESULTADOS_EXCEL,
    kpisExcel: KPIS_EXCEL,
    errorCalculo,
    sinGuardar,
    ...estado,
    setCampo,
    setCosto,
    setRamp,
    setEscenario,
    descartar,
    guardar,
    restablecer,
    aplicar,
    recargar,
    notificar,
    mensajes,
    cerrarMensaje,
  };

  return <ModelContext.Provider value={valor}>{children}</ModelContext.Provider>;
}

export function useModelo() {
  const ctx = useContext(ModelContext);
  if (!ctx) throw new Error('useModelo debe usarse dentro de ModelProvider');
  return ctx;
}
