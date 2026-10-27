// API REST de Aromas del Valle.
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { calcular, kpis } from '@aromas/shared';
import { CAMPO_POR_CLAVE } from '@aromas/shared/meta.js';
import * as store from './store.js';
import { supuestosSchema, escenarioSchema, mensajes, normalizarProbabilidades } from './validacion.js';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = path.join(RAIZ, 'client', 'dist');
const REFERENCIA = path.join(RAIZ, 'referencia');

// Error con código HTTP y lista de mensajes para el cliente.
class ErrorApi extends Error {
  constructor(status, errores) {
    super(errores[0]);
    this.status = status;
    this.errores = errores;
  }
}

const asincrono = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Valida un estado completo y normaliza las probabilidades.
function validarEstado(datos) {
  const r = supuestosSchema.safeParse(datos);
  if (!r.success) throw new ErrorApi(400, mensajes(r.error));
  const avisos = [];
  if (r.data.escenarios) {
    const { escenarios, aviso } = normalizarProbabilidades(r.data.escenarios);
    r.data.escenarios = escenarios;
    if (aviso) avisos.push(aviso);
  }
  return { estado: r.data, avisos };
}

// Los ids originales del Excel no se pueden crear ni borrar.
const ORIGINALES = ['pesimista', 'base', 'optimista'];

function marcarEscenarios(escenarios) {
  return escenarios.map((e) => ({
    ...e,
    id: e.id ?? store.nuevoId(),
    original: ORIGINALES.includes(e.id),
  }));
}

export function crearApp() {
  const app = express();
  const ADMIN_PIN = process.env.ADMIN_PIN?.trim() || '';

  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));

  // Protección opcional: con ADMIN_PIN, las rutas que modifican datos piden x-admin-pin.
  app.use('/api', (req, res, next) => {
    if (!ADMIN_PIN || ['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    if (req.get('x-admin-pin') === ADMIN_PIN) return next();
    res.status(401).json({ errores: ['PIN de administrador incorrecto o ausente. Ingrésalo para guardar cambios.'] });
  });

  const api = express.Router();

  api.get('/salud', (req, res) => {
    res.json({ estado: 'ok', hora: new Date().toISOString(), edicionProtegida: Boolean(ADMIN_PIN), version: '1.0.0' });
  });

  // ── Supuestos ──
  api.get('/supuestos', asincrono(async (req, res) => res.json(await store.leerEstado())));

  api.put(
    '/supuestos',
    asincrono(async (req, res) => {
      const actual = await store.leerEstado();
      const body = { ...req.body, escenarios: req.body?.escenarios ?? actual.escenarios };
      const { estado, avisos } = validarEstado(body);
      estado.escenarios = marcarEscenarios(estado.escenarios);
      await store.guardarEstado(estado);
      res.json({ supuestos: await store.leerEstado(), avisos });
    }),
  );

  api.patch(
    '/supuestos/:clave',
    asincrono(async (req, res) => {
      const { clave } = req.params;
      if (!CAMPO_POR_CLAVE[clave] && !['ramp', 'costos'].includes(clave)) {
        throw new ErrorApi(404, [`No existe el supuesto «${clave}».`]);
      }
      if (!req.body || !('valor' in req.body)) throw new ErrorApi(400, ['Envía el nuevo valor como { "valor": ... }.']);
      const actual = await store.leerEstado();
      const { estado, avisos } = validarEstado({ ...actual, [clave]: req.body.valor });
      estado.escenarios = marcarEscenarios(estado.escenarios);
      await store.guardarEstado(estado);
      res.json({ supuestos: await store.leerEstado(), avisos });
    }),
  );

  api.post(
    '/supuestos/restablecer',
    asincrono(async (req, res) => {
      await store.guardarEstado(await store.leerDefault());
      res.json({ supuestos: await store.leerEstado(), avisos: ['Se restablecieron los valores del Excel y se eliminaron los escenarios personalizados.'] });
    }),
  );

  // ── Escenarios ──
  api.get('/escenarios', asincrono(async (req, res) => res.json((await store.leerEstado()).escenarios)));

  async function guardarEscenarios(actual, escenarios) {
    const { escenarios: normal, aviso } = normalizarProbabilidades(escenarios);
    await store.guardarEstado({ ...actual, escenarios: normal });
    return aviso ? [aviso] : [];
  }

  api.post(
    '/escenarios',
    asincrono(async (req, res) => {
      const r = escenarioSchema.safeParse(req.body);
      if (!r.success) throw new ErrorApi(400, mensajes(r.error));
      const actual = await store.leerEstado();
      const nuevo = { ...r.data, id: store.nuevoId(), original: false };
      const avisos = await guardarEscenarios(actual, [...actual.escenarios, nuevo]);
      res.status(201).json({ escenario: nuevo, escenarios: (await store.leerEstado()).escenarios, avisos });
    }),
  );

  api.put(
    '/escenarios/:id',
    asincrono(async (req, res) => {
      const actual = await store.leerEstado();
      const previo = actual.escenarios.find((e) => e.id === req.params.id);
      if (!previo) throw new ErrorApi(404, ['No existe ese escenario.']);
      const r = escenarioSchema.safeParse({ ...previo, ...req.body });
      if (!r.success) throw new ErrorApi(400, mensajes(r.error));
      const editado = { ...r.data, id: previo.id, original: previo.original };
      const avisos = await guardarEscenarios(
        actual,
        actual.escenarios.map((e) => (e.id === previo.id ? editado : e)),
      );
      res.json({ escenario: editado, escenarios: (await store.leerEstado()).escenarios, avisos });
    }),
  );

  api.delete(
    '/escenarios/:id',
    asincrono(async (req, res) => {
      const actual = await store.leerEstado();
      const previo = actual.escenarios.find((e) => e.id === req.params.id);
      if (!previo) throw new ErrorApi(404, ['No existe ese escenario.']);
      if (previo.original) throw new ErrorApi(403, ['Los escenarios Pesimista, Base y Optimista del Excel no se pueden borrar.']);
      const avisos = await guardarEscenarios(
        actual,
        actual.escenarios.filter((e) => e.id !== previo.id),
      );
      res.json({ escenarios: (await store.leerEstado()).escenarios, avisos });
    }),
  );

  // ── Versiones ──
  const resumenVersion = ({ supuestos, ...resto }) => resto;

  api.get('/versiones', asincrono(async (req, res) => res.json((await store.leerVersiones()).map(resumenVersion))));

  api.post(
    '/versiones',
    asincrono(async (req, res) => {
      const nombre = String(req.body?.nombre ?? '').trim();
      if (!nombre) throw new ErrorApi(400, ['La versión necesita un nombre.']);
      if (nombre.length > 80) throw new ErrorApi(400, ['El nombre es demasiado largo (máx. 80 caracteres).']);
      let supuestos = await store.leerEstado();
      const avisos = [];
      if (req.body?.supuestos) {
        const v = validarEstado(req.body.supuestos);
        supuestos = { ...v.estado, escenarios: marcarEscenarios(v.estado.escenarios ?? supuestos.escenarios) };
        avisos.push(...v.avisos);
      }
      const version = {
        id: store.nuevoId(),
        nombre,
        nota: String(req.body?.nota ?? '').slice(0, 300),
        fecha: new Date().toISOString(),
        kpis: kpis(calcular(supuestos)),
        supuestos,
      };
      const lista = await store.leerVersiones();
      await store.guardarVersiones([version, ...lista]);
      res.status(201).json({ version: resumenVersion(version), avisos });
    }),
  );

  api.get(
    '/versiones/:id',
    asincrono(async (req, res) => {
      const v = (await store.leerVersiones()).find((x) => x.id === req.params.id);
      if (!v) throw new ErrorApi(404, ['No existe esa versión.']);
      res.json(v);
    }),
  );

  api.post(
    '/versiones/:id/cargar',
    asincrono(async (req, res) => {
      const v = (await store.leerVersiones()).find((x) => x.id === req.params.id);
      if (!v) throw new ErrorApi(404, ['No existe esa versión.']);
      const { estado, avisos } = validarEstado(v.supuestos);
      await store.guardarEstado({ ...estado, escenarios: marcarEscenarios(estado.escenarios) });
      res.json({ supuestos: await store.leerEstado(), avisos });
    }),
  );

  api.delete(
    '/versiones/:id',
    asincrono(async (req, res) => {
      const lista = await store.leerVersiones();
      if (!lista.some((x) => x.id === req.params.id)) throw new ErrorApi(404, ['No existe esa versión.']);
      await store.guardarVersiones(lista.filter((x) => x.id !== req.params.id));
      res.json({ ok: true });
    }),
  );

  // ── Resultados ──
  api.get(
    '/resultados',
    asincrono(async (req, res) => {
      const r = calcular(await store.leerEstado());
      res.json({ kpis: kpis(r), resultados: r });
    }),
  );

  api.use((req, res) => res.status(404).json({ errores: ['Ruta de la API no encontrada.'] }));

  app.use('/api', api);

  // Excel original para descarga
  app.use(
    '/descargas',
    express.static(REFERENCIA, {
      index: false,
      setHeaders: (res) => res.setHeader('Content-Disposition', 'attachment'),
    }),
  );

  // Frontend compilado (npm start)
  if (existsSync(DIST)) {
    app.use(express.static(DIST, { index: false, maxAge: '1h' }));
    app.get('*', (req, res) => res.sendFile(path.join(DIST, 'index.html')));
  }

  // Errores
  app.use((err, req, res, next) => {
    if (err instanceof ErrorApi) return res.status(err.status).json({ errores: err.errores });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ errores: ['El cuerpo de la petición no es un JSON válido.'] });
    console.error(err);
    res.status(500).json({ errores: ['Error interno del servidor.'] });
  });

  return app;
}
