// Panel de supuestos (CRUD): edición con recálculo en vivo, escenarios personalizados y versiones.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CAMPOS, CAMPOS_ESCENARIO, COSTOS, GRUPOS, RAMP } from '@aromas/shared/meta.js';
import { SUPUESTOS_DEFAULT } from '@aromas/shared';
import { useModelo } from '../state/ModelContext.jsx';
import { api, setPin } from '../lib/api.js';
import { Cabecera, Tabla } from '../components/ui.jsx';
import CampoNumero, { validar } from '../components/CampoNumero.jsx';
import Modal from '../components/Modal.jsx';
import { num, numSigno, pct, soles } from '../lib/format.js';

const DEF = SUPUESTOS_DEFAULT;
const defEsc = Object.fromEntries(DEF.escenarios.map((e) => [e.id, e]));

// ───────── Vista previa de KPI con diferencia frente al Excel ─────────
function VistaPrevia() {
  const { kpis: k, kpisExcel: x } = useModelo();
  const filas = [
    ['VPN Fase 1', 'vpnFase1', (v) => numSigno(v), (v) => v > 0],
    ['VPN tiendas', 'vpnTiendas', (v) => numSigno(v), (v) => v > 0],
    ['VPN total', 'vpnTotal', (v) => numSigno(v), (v) => v > 0],
    ['TIR Fase 1', 'tirFase1', (v) => (v === null ? 'No existe' : pct(v)), (v) => v !== null && v > k.tmar],
    ['TIR total', 'tirTotal', (v) => (v === null ? 'No existe' : pct(v)), (v) => v !== null && v > k.tmar],
    ['B/C Fase 1', 'bcFase1', (v) => num(v, 2), (v) => v >= 1],
    ['B/C total', 'bcTotal', (v) => num(v, 2), (v) => v >= 1],
    ['E[VPN] Fase 1', 'vpnEsperadoFase1', (v) => numSigno(v), (v) => v > 0],
    ['E[VPN] total', 'vpnEsperadoTotal', (v) => numSigno(v), (v) => v > 0],
    ['ΔB/C (base)', 'dBC', (v) => num(v, 2), (v) => v >= 1],
  ];
  return (
    <div className="tarjeta p-4">
      <p className="font-serif text-lg font-semibold text-cafe">Vista previa (escenario base)</p>
      <p className="text-xs text-suave">Excel → con tus supuestos</p>
      <ul className="mt-3 divide-y divide-borde text-sm">
        {filas.map(([label, key, f, ok]) => {
          const a = x[key];
          const b = k[key];
          const igual = a === b || (a !== null && b !== null && Math.abs(a - b) < 1e-6);
          const sube = !igual && b !== null && a !== null && b > a;
          return (
            <li key={key} className="flex items-center gap-2 py-1.5">
              <span className={`h-2 w-2 shrink-0 rounded-full ${ok(b) ? 'bg-bien' : 'bg-mal'}`} aria-hidden="true" />
              <span className="min-w-0 flex-1 text-suave">{label}</span>
              <span className="tabular-nums text-tenue">{f(a)}</span>
              {!igual && (
                <>
                  <span aria-hidden="true">→</span>
                  <span className={`font-semibold tabular-nums ${ok(b) ? 'text-bien' : 'text-mal'}`}>{f(b)}</span>
                  <span className={sube ? 'text-bien' : 'text-mal'} aria-label={sube ? 'sube' : 'baja'}>
                    {sube ? '▲' : '▼'}
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ───────── Formulario de escenario (crear / editar) ─────────
function FormEscenario({ inicial, onGuardar, onCancelar, ocupado }) {
  const [e, setE] = useState(inicial);
  const errores = CAMPOS_ESCENARIO.map((c) => validar(e[c.key], c)).filter(Boolean);
  const sinNombre = !String(e.nombre ?? '').trim();
  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        if (!errores.length && !sinNombre) onGuardar(e);
      }}
      className="grid gap-3"
    >
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Nombre</span>
        <input
          className="rounded-lg border border-borde bg-superficie px-3 py-2"
          value={e.nombre ?? ''}
          maxLength={60}
          onChange={(ev) => setE({ ...e, nombre: ev.target.value })}
          required
          disabled={e.original}
        />
      </label>
      {CAMPOS_ESCENARIO.map((c) => (
        <CampoNumero key={c.key} campo={{ ...c, origen: 'propio' }} valor={e[c.key]} onChange={(v) => setE({ ...e, [c.key]: v })} />
      ))}
      <p className="text-xs text-suave">Si las probabilidades de todos los escenarios no suman 100 %, el servidor las normaliza y te avisa.</p>
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" className="btn-secundario" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="btn-primario" disabled={ocupado || errores.length > 0 || sinNombre}>Guardar escenario</button>
      </div>
    </form>
  );
}

export default function Supuestos() {
  const m = useModelo();
  const { borrador: b, guardado, sinGuardar, sinConexion, edicionProtegida, notificar } = m;
  const [ocupado, setOcupado] = useState(false);
  const [modal, setModal] = useState(null); // { tipo, datos }
  const [versiones, setVersiones] = useState([]);
  const [pin, setPinLocal] = useState('');

  const cargarVersiones = useCallback(async () => {
    if (sinConexion) return;
    try {
      setVersiones(await api('/versiones'));
    } catch {
      setVersiones([]);
    }
  }, [sinConexion]);
  useEffect(() => {
    cargarVersiones();
  }, [cargarVersiones]);

  // Errores del formulario (validación en el navegador; el servidor vuelve a validar)
  const errores = useMemo(() => {
    const e = [];
    CAMPOS.forEach((c) => validar(b[c.key], c) && e.push(c.label));
    b.costos.forEach((c) => validar(c.valor, { min: 0, unidad: 'solesKg' }) && e.push(c.rubro));
    b.ramp.forEach((v, i) => validar(v, { min: 0, max: 1, unidad: 'pct' }) && e.push(`Maduración año ${i + 1}`));
    b.escenarios.forEach((s) => CAMPOS_ESCENARIO.forEach((c) => validar(s[c.key], c) && e.push(`${c.label} (${s.nombre})`)));
    return e;
  }, [b]);
  const sumaProb = b.escenarios.reduce((a, e) => a + (e.prob || 0), 0);

  const ejecutar = async (fn, ok) => {
    setOcupado(true);
    try {
      await fn();
      if (ok) notificar(ok, 'ok');
      return true;
    } catch (e) {
      if (e.status === 401) notificar('Esta publicación pide un PIN de administrador para guardar. Escríbelo en el recuadro «PIN».', 'error');
      else notificar(e.errores?.join(' ') ?? e.message, 'error');
      return false;
    } finally {
      setOcupado(false);
    }
  };

  const aplicarEscenarios = (resp) => m.aplicar({ supuestos: { ...guardado, escenarios: resp.escenarios }, avisos: resp.avisos }, { conservarBorrador: true });

  const guardarEscenario = (e) =>
    ejecutar(async () => {
      const cuerpo = { nombre: e.nombre, ...Object.fromEntries(CAMPOS_ESCENARIO.map((c) => [c.key, e[c.key]])) };
      const resp = e.id ? await api(`/escenarios/${e.id}`, { method: 'PUT', body: cuerpo }) : await api('/escenarios', { method: 'POST', body: cuerpo });
      aplicarEscenarios(resp);
      setModal(null);
    }, e.id ? 'Escenario actualizado.' : 'Escenario creado.');

  const borrarEscenario = (e) =>
    ejecutar(async () => {
      aplicarEscenarios(await api(`/escenarios/${e.id}`, { method: 'DELETE' }));
      setModal(null);
    }, 'Escenario eliminado.');

  const guardarVersion = (nombre, nota) =>
    ejecutar(async () => {
      const resp = await api('/versiones', { method: 'POST', body: { nombre, nota, supuestos: b } });
      (resp.avisos ?? []).forEach((a) => notificar(a, 'aviso'));
      setModal(null);
      cargarVersiones();
    }, 'Versión guardada.');

  const cargarVersion = (v) =>
    ejecutar(async () => {
      m.aplicar(await api(`/versiones/${v.id}/cargar`, { method: 'POST' }));
      setModal(null);
    }, `Se cargó la versión «${v.nombre}».`);

  const borrarVersion = (v) =>
    ejecutar(async () => {
      await api(`/versiones/${v.id}`, { method: 'DELETE' });
      setModal(null);
      cargarVersiones();
    }, 'Versión eliminada.');

  const verVersion = (v) =>
    ejecutar(async () => {
      setModal({ tipo: 'verVersion', datos: await api(`/versiones/${v.id}`) });
    });

  const bloqueado = sinConexion;

  return (
    <>
      <Cabecera etiqueta="Panel de supuestos" titulo="Prueba tus propios supuestos">
        <p>
          Cambia cualquier celda de entrada del Excel y mira cómo se recalcula todo al instante: tablas, gráficos, la solución paso a paso y las
          respuestas. <span className="rounded bg-propio/70 px-1 font-semibold text-casoAzul">Fondo amarillo</span> = supuesto propio;{' '}
          <span className="font-semibold text-casoAzul">texto azul</span> = dato del caso.
        </p>
      </Cabecera>

      {/* Barra de acciones */}
      <div className="sticky top-16 z-20 border-b border-borde bg-fondo/95 backdrop-blur">
        <div className="contenedor flex flex-wrap items-center gap-2 py-3">
          <button type="button" className="btn-primario" disabled={!sinGuardar || errores.length > 0 || ocupado || bloqueado} onClick={() => ejecutar(m.guardar)}>
            Guardar
          </button>
          <button type="button" className="btn-secundario" disabled={!sinGuardar || ocupado} onClick={m.descartar}>
            Descartar
          </button>
          <button type="button" className="btn-secundario" disabled={ocupado || bloqueado || errores.length > 0} onClick={() => setModal({ tipo: 'version' })}>
            Guardar versión
          </button>
          <button type="button" className="btn-peligro" disabled={ocupado} onClick={() => setModal({ tipo: 'restablecer' })}>
            Restablecer valores del Excel
          </button>
          <span className={`ml-auto text-sm ${sinGuardar ? 'font-semibold text-aviso' : 'text-suave'}`} role="status">
            {errores.length ? `${errores.length} campo(s) con error` : sinGuardar ? '● Cambios sin guardar' : '✓ Todo guardado'}
          </span>
          {edicionProtegida && (
            <label className="flex items-center gap-2 text-sm">
              <span>PIN</span>
              <input
                type="password"
                className="w-24 rounded-lg border border-borde bg-superficie px-2 py-1"
                value={pin}
                onChange={(e) => {
                  setPinLocal(e.target.value);
                  setPin(e.target.value);
                }}
                autoComplete="off"
              />
            </label>
          )}
        </div>
      </div>

      <div className="contenedor grid grid-cols-1 gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          {GRUPOS.filter((g) => g.id !== 'escenarios').map((g) => (
            <section key={g.id} className="tarjeta p-4 sm:p-5" aria-labelledby={`g-${g.id}`}>
              <h2 id={`g-${g.id}`} className="text-xl font-semibold">{g.titulo}</h2>
              <div className="mt-4 space-y-4">
                {g.id === 'costos' ? (
                  <>
                    {b.costos.map((c, i) => (
                      <CampoNumero
                        key={c.id}
                        campo={{ key: c.id, label: c.rubro, unidad: 'solesKg', origen: COSTOS.origen, fuente: COSTOS.fuente, min: 0 }}
                        valor={c.valor}
                        original={DEF.costos.find((d) => d.id === c.id)?.valor}
                        onChange={(v) => m.setCosto(i, v)}
                      />
                    ))}
                    <p className="text-right text-sm">
                      Costo unitario total (U) = <strong className="tabular-nums">{soles(m.r.costos.U, 2)}</strong>
                    </p>
                  </>
                ) : (
                  CAMPOS.filter((c) => c.grupo === g.id).map((c) => (
                    <CampoNumero key={c.key} campo={c} valor={b[c.key]} original={DEF[c.key]} onChange={(v) => m.setCampo(c.key, v)} />
                  ))
                )}
                {g.id === 'capital' && <p className="text-right text-sm">Peso del patrimonio We = 1 − Wd = <strong>{pct(1 - b.Wd, 0)}</strong></p>}
                {g.id === 'actual' && Math.abs(b.shTienda + b.shOnline + b.shB2B - 1) > 1e-9 && (
                  <p className="text-sm text-aviso">Las participaciones suman {pct(b.shTienda + b.shOnline + b.shB2B)}, no 100 %.</p>
                )}
                {g.id === 'fase2' && (
                  <>
                    <fieldset>
                      <legend className="text-sm font-medium">{RAMP.label}</legend>
                      <p className="text-xs text-tenue">{RAMP.fuente}</p>
                      <div className="mt-2 grid grid-cols-5 gap-2">
                        {b.ramp.map((v, i) => (
                          <CampoNumero
                            key={i}
                            compacto
                            etiquetaOculta
                            etiqueta={`Maduración año ${i + 1}`}
                            campo={{ key: `ramp${i}`, unidad: 'pct', origen: 'propio', min: 0, max: 1 }}
                            valor={v}
                            original={DEF.ramp[i]}
                            onChange={(x) => m.setRamp(i, x)}
                          />
                        ))}
                      </div>
                    </fieldset>
                    <p className="text-right text-sm">
                      Inversión total (comprobación):{' '}
                      <strong>{soles(b.invMaq + b.invInt + b.wc1 + b.invLima + b.invAqp + b.wcLima + b.wcAqp)}</strong> (el caso dice S/ 480,000)
                    </p>
                  </>
                )}
              </div>
            </section>
          ))}

          {/* 9. Escenarios */}
          <section className="tarjeta p-4 sm:p-5" aria-labelledby="g-escenarios">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="g-escenarios" className="text-xl font-semibold">9. Escenarios de demanda</h2>
              <button
                type="button"
                className="btn-secundario"
                disabled={bloqueado || ocupado}
                onClick={() => setModal({ tipo: 'escenario', datos: { nombre: '', g: 0.12, b2b: 0.4, lima: 350000, aqp: 230000, prob: 0 } })}
              >
                + Nuevo escenario
              </button>
            </div>
            <Tabla titulo="Escenarios">
              <thead>
                <tr>
                  <th>Variable</th>
                  {b.escenarios.map((e) => (
                    <th key={e.id} className="num">
                      {e.nombre}
                      {!e.original && <span className="ml-1 font-normal opacity-80">(propio)</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CAMPOS_ESCENARIO.map((c) => (
                  <tr key={c.key}>
                    <td className="min-w-[12rem] text-sm">{c.label}</td>
                    {b.escenarios.map((e) => (
                      <td key={e.id} className="min-w-[8.5rem]">
                        <CampoNumero
                          compacto
                          etiquetaOculta
                          etiqueta={`${c.label} — ${e.nombre}`}
                          campo={{ ...c, origen: 'propio' }}
                          valor={e[c.key]}
                          original={e.original ? defEsc[e.id]?.[c.key] : undefined}
                          onChange={(v) => m.setEscenario(e.id, c.key, v)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="text-sm">Acciones</td>
                  {b.escenarios.map((e) => (
                    <td key={e.id} className="text-right">
                      {e.original ? (
                        <span className="text-xs text-tenue">Del Excel</span>
                      ) : (
                        <span className="inline-flex gap-1">
                          <button type="button" className="text-xs font-semibold text-andino underline" disabled={bloqueado} onClick={() => setModal({ tipo: 'escenario', datos: e })}>
                            Editar
                          </button>
                          <button type="button" className="text-xs font-semibold text-mal underline" disabled={bloqueado} onClick={() => setModal({ tipo: 'borrarEscenario', datos: e })}>
                            Borrar
                          </button>
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </Tabla>
            <p className={`text-sm ${Math.abs(sumaProb - 1) > 1e-6 ? 'text-mal' : 'text-suave'}`}>
              Suma de probabilidades: {pct(sumaProb)}.{' '}
              {Math.abs(sumaProb - 1) > 1e-6 ? 'Al guardar, el servidor las normaliza para que sumen 100 % y te avisa.' : 'El VPN esperado pondera cada escenario por su probabilidad.'}
            </p>
            <p className="text-xs text-tenue">
              Los escenarios Pesimista, Base y Optimista vienen del Excel y no se pueden borrar. Los personalizados se guardan al instante con «Nuevo
              escenario», «Editar» y «Borrar»; los cambios en esta tabla se guardan con el botón «Guardar».
            </p>
          </section>

          {/* Versiones */}
          <section className="tarjeta p-4 sm:p-5" aria-labelledby="g-versiones">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="g-versiones" className="text-xl font-semibold">Versiones guardadas</h2>
              <button type="button" className="btn-secundario" disabled={bloqueado || ocupado || errores.length > 0} onClick={() => setModal({ tipo: 'version' })}>
                + Guardar versión actual
              </button>
            </div>
            {versiones.length === 0 ? (
              <p className="mt-3 text-sm text-suave">{bloqueado ? 'Sin conexión con el servidor.' : 'Aún no hay versiones. Guarda una para comparar supuestos.'}</p>
            ) : (
              <Tabla titulo="Versiones">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Fecha</th>
                    <th className="num">VPN Fase 1</th>
                    <th className="num">VPN total</th>
                    <th className="num">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {versiones.map((v) => (
                    <tr key={v.id}>
                      <td>{v.nombre}</td>
                      <td className="whitespace-nowrap">{new Date(v.fecha).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td className="num">{numSigno(v.kpis?.vpnFase1)}</td>
                      <td className="num">{numSigno(v.kpis?.vpnTotal)}</td>
                      <td className="num whitespace-nowrap">
                        <button type="button" className="mr-2 text-xs font-semibold text-andino underline" onClick={() => verVersion(v)}>Ver</button>
                        <button type="button" className="mr-2 text-xs font-semibold text-andino underline" onClick={() => setModal({ tipo: 'cargarVersion', datos: v })}>Cargar</button>
                        <button type="button" className="text-xs font-semibold text-mal underline" onClick={() => setModal({ tipo: 'borrarVersion', datos: v })}>Borrar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tabla>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-36 lg:self-start">
          <VistaPrevia />
          {errores.length > 0 && (
            <div className="mt-4 rounded-xl border border-mal/40 bg-mal/5 p-3 text-sm">
              <p className="font-semibold text-mal">Corrige estos campos:</p>
              <ul className="mt-1 list-disc pl-5">
                {errores.slice(0, 6).map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {/* Modales */}
      <Modal abierto={modal?.tipo === 'restablecer'} onCerrar={() => setModal(null)} titulo="¿Restablecer los valores del Excel?"
        acciones={
          <>
            <button type="button" className="btn-secundario" onClick={() => setModal(null)}>Cancelar</button>
            <button type="button" className="btn-peligro" disabled={ocupado} onClick={() => ejecutar(async () => { await m.restablecer(); setModal(null); })}>
              Sí, restablecer
            </button>
          </>
        }>
        <p className="text-sm">Todos los supuestos y los tres escenarios vuelven a los valores originales del Excel, y se eliminan los escenarios personalizados. Las versiones guardadas no se borran.</p>
      </Modal>

      <Modal abierto={modal?.tipo === 'escenario'} onCerrar={() => setModal(null)} titulo={modal?.datos?.id ? `Editar «${modal.datos.nombre}»` : 'Nuevo escenario'}>
        {modal?.tipo === 'escenario' && <FormEscenario inicial={modal.datos} ocupado={ocupado} onCancelar={() => setModal(null)} onGuardar={guardarEscenario} />}
      </Modal>

      <Modal abierto={modal?.tipo === 'borrarEscenario'} onCerrar={() => setModal(null)} titulo="¿Borrar el escenario?"
        acciones={
          <>
            <button type="button" className="btn-secundario" onClick={() => setModal(null)}>Cancelar</button>
            <button type="button" className="btn-peligro" disabled={ocupado} onClick={() => borrarEscenario(modal.datos)}>Borrar</button>
          </>
        }>
        <p className="text-sm">Se borrará «{modal?.datos?.nombre}». Si las probabilidades dejan de sumar 100 %, se normalizan.</p>
      </Modal>

      <ModalVersion abierto={modal?.tipo === 'version'} onCerrar={() => setModal(null)} onGuardar={guardarVersion} ocupado={ocupado} />

      <Modal abierto={modal?.tipo === 'cargarVersion'} onCerrar={() => setModal(null)} titulo={`¿Cargar «${modal?.datos?.nombre ?? ''}»?`}
        acciones={
          <>
            <button type="button" className="btn-secundario" onClick={() => setModal(null)}>Cancelar</button>
            <button type="button" className="btn-primario" disabled={ocupado} onClick={() => cargarVersion(modal.datos)}>Cargar versión</button>
          </>
        }>
        <p className="text-sm">Sus supuestos reemplazarán a los actuales (también en el servidor).{sinGuardar && ' Perderás tus cambios sin guardar.'}</p>
      </Modal>

      <Modal abierto={modal?.tipo === 'borrarVersion'} onCerrar={() => setModal(null)} titulo="¿Borrar la versión?"
        acciones={
          <>
            <button type="button" className="btn-secundario" onClick={() => setModal(null)}>Cancelar</button>
            <button type="button" className="btn-peligro" disabled={ocupado} onClick={() => borrarVersion(modal.datos)}>Borrar</button>
          </>
        }>
        <p className="text-sm">Se borrará «{modal?.datos?.nombre}».</p>
      </Modal>

      <Modal abierto={modal?.tipo === 'verVersion'} onCerrar={() => setModal(null)} titulo={modal?.datos?.nombre ?? ''}
        acciones={
          <>
            <button type="button" className="btn-secundario" onClick={() => setModal(null)}>Cerrar</button>
            <button type="button" className="btn-primario" onClick={() => setModal({ tipo: 'cargarVersion', datos: modal.datos })}>Cargar</button>
          </>
        }>
        {modal?.tipo === 'verVersion' && <DetalleVersion v={modal.datos} />}
      </Modal>
    </>
  );
}

function ModalVersion({ abierto, onCerrar, onGuardar, ocupado }) {
  const [nombre, setNombre] = useState('');
  const [nota, setNota] = useState('');
  useEffect(() => {
    if (abierto) {
      setNombre('');
      setNota('');
    }
  }, [abierto]);
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Guardar versión">
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (nombre.trim()) onGuardar(nombre.trim(), nota);
        }}
      >
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Nombre de la versión</span>
          <input className="rounded-lg border border-borde bg-superficie px-3 py-2" value={nombre} maxLength={80} onChange={(e) => setNombre(e.target.value)} required placeholder="Ej.: Lima con alquiler más bajo" />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Nota (opcional)</span>
          <textarea className="rounded-lg border border-borde bg-superficie px-3 py-2" rows={3} maxLength={300} value={nota} onChange={(e) => setNota(e.target.value)} />
        </label>
        <p className="text-xs text-suave">Se guardan los supuestos que ves ahora, incluidos los cambios sin guardar.</p>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secundario" onClick={onCerrar}>Cancelar</button>
          <button type="submit" className="btn-primario" disabled={ocupado || !nombre.trim()}>Guardar versión</button>
        </div>
      </form>
    </Modal>
  );
}

function DetalleVersion({ v }) {
  const cambios = [];
  for (const c of CAMPOS) {
    if (Math.abs((v.supuestos[c.key] ?? 0) - DEF[c.key]) > 1e-12) cambios.push([c.label, c.unidad === 'pct' ? pct(DEF[c.key], 2) : num(DEF[c.key], 2), c.unidad === 'pct' ? pct(v.supuestos[c.key], 2) : num(v.supuestos[c.key], 2)]);
  }
  return (
    <div className="text-sm">
      <p className="text-suave">{new Date(v.fecha).toLocaleString('es-PE')}</p>
      {v.nota && <p className="mt-2">{v.nota}</p>}
      <p className="mt-3">
        VPN Fase 1: <strong>{numSigno(v.kpis.vpnFase1)}</strong> · VPN total: <strong>{numSigno(v.kpis.vpnTotal)}</strong>
      </p>
      <p className="mt-3 font-semibold">Supuestos distintos del Excel ({cambios.length})</p>
      {cambios.length ? (
        <ul className="mt-1 max-h-48 list-disc overflow-y-auto pl-5">
          {cambios.map(([l, a, b]) => (
            <li key={l}>
              {l}: {a} → <strong>{b}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-suave">Ninguno de los supuestos generales (revisa costos, maduración y escenarios).</p>
      )}
    </div>
  );
}
