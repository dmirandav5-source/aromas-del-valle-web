import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Carga .env de la raíz si existe (PORT, ADMIN_PIN). Las variables ya definidas no se pisan.
const ENV = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '.env');
if (existsSync(ENV)) {
  for (const linea of readFileSync(ENV, 'utf8').split(/\r?\n/)) {
    const m = linea.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const { crearApp } = await import('./app.js');
const { inicializar } = await import('./store.js');

const PORT = Number(process.env.PORT) || 3000;

await inicializar();
crearApp().listen(PORT, () => {
  console.log(`Aromas del Valle: servidor en http://localhost:${PORT}`);
  if (process.env.ADMIN_PIN) console.log('Edición protegida con ADMIN_PIN.');
});
