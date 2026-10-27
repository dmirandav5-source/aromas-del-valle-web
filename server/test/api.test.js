// Pruebas de la API REST con un directorio de datos temporal.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, copyFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

let server;
let url;
let dir;

const pedir = async (ruta, opciones = {}) => {
  const res = await fetch(url + ruta, {
    ...opciones,
    headers: { 'content-type': 'application/json', ...(opciones.headers ?? {}) },
    body: opciones.body ? JSON.stringify(opciones.body) : undefined,
  });
  return { status: res.status, json: await res.json() };
};

beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'aromas-'));
  const origen = fileURLToPath(new URL('../data/supuestos.default.json', import.meta.url));
  await copyFile(origen, path.join(dir, 'supuestos.default.json'));
  process.env.DATA_DIR = dir;
  process.env.ADMIN_PIN = '';
  const { crearApp } = await import('../src/app.js');
  const { inicializar } = await import('../src/store.js');
  await inicializar();
  server = crearApp().listen(0);
  url = `http://127.0.0.1:${server.address().port}/api`;
});

afterAll(async () => {
  server?.close();
  await rm(dir, { recursive: true, force: true });
});

describe('API', () => {
  it('salud', async () => {
    const r = await pedir('/salud');
    expect(r.json.estado).toBe('ok');
  });

  it('resultados con los valores del Excel', async () => {
    const r = await pedir('/resultados');
    expect(r.json.kpis.vpnTotal).toBeCloseTo(-77358.49, 1);
    expect(r.json.kpis.vpnFase1).toBeCloseTo(117319.82, 1);
  });

  it('PATCH de un supuesto recalcula y restablecer vuelve al Excel', async () => {
    const p = await pedir('/supuestos/FLima', { method: 'PATCH', body: { valor: 172800 } });
    expect(p.status).toBe(200);
    const r = await pedir('/resultados');
    expect(r.json.kpis.vpnTotal).toBeGreaterThan(-77358);
    await pedir('/supuestos/restablecer', { method: 'POST' });
    const r2 = await pedir('/resultados');
    expect(r2.json.kpis.vpnTotal).toBeCloseTo(-77358.49, 1);
  });

  it('valida y responde en español', async () => {
    const r = await pedir('/supuestos/tmar', { method: 'PATCH', body: { valor: 3 } });
    expect(r.status).toBe(400);
    expect(r.json.errores[0]).toMatch(/no puede ser mayor/);
    const r2 = await pedir('/supuestos/ramp', { method: 'PATCH', body: { valor: [0.5, 1] } });
    expect(r2.json.errores[0]).toMatch(/5 valores/);
  });

  it('CRUD de escenarios con normalización de probabilidades', async () => {
    const c = await pedir('/escenarios', {
      method: 'POST',
      body: { nombre: 'Estrés', g: 0.05, b2b: 0.1, lima: 200000, aqp: 150000, prob: 0.2 },
    });
    expect(c.status).toBe(201);
    expect(c.json.avisos[0]).toMatch(/normalizaron/);
    const id = c.json.escenario.id;
    const suma = c.json.escenarios.reduce((a, e) => a + e.prob, 0);
    expect(suma).toBeCloseTo(1, 9);
    const e = await pedir(`/escenarios/${id}`, { method: 'PUT', body: { nombre: 'Estrés fuerte' } });
    expect(e.json.escenario.nombre).toBe('Estrés fuerte');
    const noBorra = await pedir('/escenarios/base', { method: 'DELETE' });
    expect(noBorra.status).toBe(403);
    const d = await pedir(`/escenarios/${id}`, { method: 'DELETE' });
    expect(d.json.escenarios).toHaveLength(3);
    await pedir('/supuestos/restablecer', { method: 'POST' });
  });

  it('CRUD de versiones', async () => {
    await pedir('/supuestos/cmT', { method: 'PATCH', body: { valor: 0.7 } });
    const v = await pedir('/versiones', { method: 'POST', body: { nombre: 'Margen 70 %' } });
    expect(v.status).toBe(201);
    const id = v.json.version.id;
    await pedir('/supuestos/restablecer', { method: 'POST' });
    const l = await pedir('/versiones');
    expect(l.json[0].nombre).toBe('Margen 70 %');
    expect(l.json[0].supuestos).toBeUndefined();
    const c = await pedir(`/versiones/${id}/cargar`, { method: 'POST' });
    expect(c.json.supuestos.cmT).toBe(0.7);
    const d = await pedir(`/versiones/${id}`, { method: 'DELETE' });
    expect(d.json.ok).toBe(true);
    await pedir('/supuestos/restablecer', { method: 'POST' });
  });
});
