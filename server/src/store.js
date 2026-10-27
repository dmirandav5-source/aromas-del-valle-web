// Persistencia en archivos JSON (sin base de datos).
// - supuestos.default.json: valores originales del Excel (nunca se modifica)
// - supuestos.json: supuestos actuales + los 3 escenarios originales
// - escenarios.json: escenarios personalizados
// - versiones.json: versiones guardadas
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA_DIR = process.env.DATA_DIR ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
const archivo = (nombre) => path.join(DATA_DIR, nombre);

async function leerJSON(nombre, porDefecto) {
  try {
    return JSON.parse(await readFile(archivo(nombre), 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return porDefecto;
    throw e;
  }
}

// Escritura atómica: archivo temporal y luego rename.
// Las escrituras se encadenan para que dos peticiones no se pisen.
let cola = Promise.resolve();
function escribirJSON(nombre, datos) {
  const tarea = cola.then(async () => {
    await mkdir(DATA_DIR, { recursive: true });
    const tmp = archivo(`${nombre}.${process.pid}.${randomUUID()}.tmp`);
    await writeFile(tmp, JSON.stringify(datos, null, 2), 'utf8');
    await rename(tmp, archivo(nombre));
  });
  cola = tarea.catch(() => {});
  return tarea;
}

export async function leerDefault() {
  return leerJSON('supuestos.default.json');
}

export async function inicializar() {
  if (!existsSync(archivo('supuestos.json'))) await escribirJSON('supuestos.json', await leerDefault());
  if (!existsSync(archivo('escenarios.json'))) await escribirJSON('escenarios.json', []);
  if (!existsSync(archivo('versiones.json'))) await escribirJSON('versiones.json', []);
}

// Supuestos actuales con todos los escenarios (originales + personalizados).
export async function leerEstado() {
  const sup = await leerJSON('supuestos.json', await leerDefault());
  const personalizados = await leerJSON('escenarios.json', []);
  const originales = (sup.escenarios ?? []).filter((e) => e.original);
  return { ...sup, escenarios: [...originales, ...personalizados] };
}

// Guarda un estado completo: separa los escenarios originales de los personalizados.
export async function guardarEstado(estado) {
  const escenarios = estado.escenarios ?? [];
  const originales = escenarios.filter((e) => e.original);
  const personalizados = escenarios.filter((e) => !e.original);
  await escribirJSON('supuestos.json', { ...estado, escenarios: originales });
  await escribirJSON('escenarios.json', personalizados);
}

export async function leerVersiones() {
  return leerJSON('versiones.json', []);
}

export async function guardarVersiones(lista) {
  await escribirJSON('versiones.json', lista);
}

export const nuevoId = () => randomUUID().slice(0, 8);
