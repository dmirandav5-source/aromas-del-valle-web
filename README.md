# Aromas del Valle — Evaluación del proyecto de expansión 2026-2030

Sitio web del caso académico de Ingeniería Económica **«Aromas del Valle»**: presenta la empresa (ficticia), el enunciado del caso, la
**solución paso a paso** (pasos 1 a 16), las **14 hojas del modelo financiero** del Excel y un **panel de supuestos** donde se puede cambiar
cualquier celda de entrada y ver cómo se recalculan al instante todas las tablas, gráficos y respuestas.

> Caso académico. Empresa, direcciones y datos de contacto ficticios.

## Contenido

| Carpeta | Qué hay |
| --- | --- |
| `client/` | Frontend: React 18 + Vite, Tailwind CSS, Recharts, KaTeX y React Router |
| `server/` | Backend: Node.js + Express (API REST, validación con zod, archivos JSON en `server/data/`) |
| `shared/` | Motor de cálculo `engine.js` (JavaScript puro, sin dependencias), valores por defecto y metadatos de los supuestos |
| `referencia/` | Documentos definitivos: el Excel, la solución en Markdown y el enunciado del caso |

## Requisitos

- **Node.js 20 LTS** o superior (<https://nodejs.org>). Comprueba la versión con `node -v`.
- Visual Studio Code (recomendado) con las extensiones sugeridas: ESLint, Prettier y Tailwind CSS IntelliSense.

## Ejecutar en tu computadora

1. Abre la carpeta del proyecto en Visual Studio Code (**Archivo → Abrir carpeta**).
2. Abre una terminal (**Terminal → Nueva terminal**) e instala las dependencias:

   ```bash
   npm install
   ```

3. Levanta el sitio en modo desarrollo (Vite + API a la vez):

   ```bash
   npm run dev
   ```

4. Abre **<http://localhost:5173>** en el navegador.

También puedes presionar **F5** y elegir «Desarrollo (Vite + API)».

### Pruebas

```bash
npm test
```

Comprueban el motor contra los valores de control del Excel (VPN, TIR, TER, B/C, préstamo, equilibrio, sensibilidad, etc.) y la API REST.

### Versión de producción (un solo puerto)

```bash
npm run build && npm start
```

Abre **<http://localhost:3000>**. Express sirve la API y el frontend compilado. Para cambiar el puerto o proteger la edición con un PIN, copia
`.env.example` como `.env` y edita `PORT` y `ADMIN_PIN`.

## API REST

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | `/api/supuestos` | Lee los supuestos actuales |
| PUT | `/api/supuestos` | Reemplaza todos los supuestos (con validación) |
| PATCH | `/api/supuestos/:clave` | Actualiza un supuesto: `{ "valor": ... }` |
| POST | `/api/supuestos/restablecer` | Vuelve a los valores del Excel |
| GET / POST | `/api/escenarios` | Lista / crea escenarios personalizados |
| PUT / DELETE | `/api/escenarios/:id` | Edita / borra (los 3 del Excel no se pueden borrar) |
| GET / POST | `/api/versiones` | Lista / guarda versiones |
| GET / DELETE | `/api/versiones/:id` | Lee / borra una versión |
| POST | `/api/versiones/:id/cargar` | Carga una versión como supuestos actuales |
| GET | `/api/resultados` | Ejecuta `calcular()` con los supuestos actuales |
| GET | `/api/salud` | Estado del servidor |

Si existe la variable `ADMIN_PIN`, las rutas que modifican datos piden la cabecera `x-admin-pin` (el panel tiene un recuadro «PIN»). Sin
`ADMIN_PIN`, la edición queda abierta. Los datos se guardan en `server/data/` con escritura atómica (archivo temporal y `rename`).

## Publicar con una URL pública (gratis en Render)

El proyecto ya incluye `render.yaml`, así que Render lo configura solo.

### 1. Subir el proyecto a GitHub desde VS Code

1. Crea una cuenta en <https://github.com> si no la tienes.
2. En VS Code, abre la vista **Control de código fuente** (ícono de ramas, `Ctrl+Shift+G`).
3. Haz clic en **Publicar en GitHub** (o **Inicializar repositorio** y luego **Publicar rama**). Inicia sesión cuando te lo pida.
4. Elige **repositorio público** o privado y confirma. VS Code sube todos los archivos (el `.gitignore` excluye `node_modules` y los datos
   temporales).

### 2. Crear el servicio en Render

1. Crea una cuenta en <https://render.com> (puedes entrar con tu cuenta de GitHub).
2. En el panel de Render, elige **New → Blueprint**.
3. Conecta tu cuenta de GitHub y selecciona el repositorio del proyecto.
4. Render lee `render.yaml` y muestra el servicio **aromas-del-valle**. Te pedirá `ADMIN_PIN`:
   - déjalo **vacío** si quieres que cualquiera pueda probar y guardar supuestos;
   - escribe un PIN si quieres que todos vean el sitio pero solo tú puedas guardar cambios.
5. Haz clic en **Apply** y espera a que termine el despliegue (unos minutos la primera vez).

### 3. Abrir el sitio

Copia la URL que asigna Render, por ejemplo `https://aromas-del-valle.onrender.com`, y ábrela desde cualquier computadora o celular.

### Limitaciones del plan gratuito

- **El servidor «se duerme»** tras unos minutos sin visitas y la primera visita después tarda unos segundos (hasta ~1 minuto) en despertar. Antes
  de una presentación, abre la URL un rato antes.
- **Los archivos JSON se reinician** a los valores del Excel con cada redespliegue o reinicio, porque el disco del plan gratuito no es
  permanente. Para una presentación es suficiente gracias al botón **«Restablecer valores del Excel»**. Si necesitas que los cambios persistan, se
  puede agregar un **Render Disk** montado en `server/data` (variable `DATA_DIR`) o migrar a SQLite/Postgres sin cambiar la API.

### Alternativa rápida sin desplegar: un túnel temporal

Con el sitio corriendo en tu computadora (`npm run build && npm start`), abre otra terminal y ejecuta una de estas opciones:

```bash
npx localtunnel --port 3000
# o, si tienes cloudflared instalado:
cloudflared tunnel --url http://localhost:3000
```

Te dará una URL pública temporal. **Solo funciona mientras tu computadora esté encendida** y la terminal abierta.

## Notas sobre el modelo

- El motor `shared/engine.js` reproduce las fórmulas del Excel. Con los supuestos por defecto, el sitio muestra exactamente las cifras del Excel
  y de la solución (lo comprueban las pruebas).
- En el Excel, la hoja **Sensibilidad** y el **equilibrio económico de las tiendas** (S/ 524,000 y S/ 328,000) están escritos a mano. En el sitio
  se recalculan solos: la sensibilidad mueve cada grupo de supuestos ±20 % sobre el escenario base y el equilibrio económico se busca por
  bisección (≈ S/ 524,495 en Lima y ≈ S/ 327,559 en Arequipa).
- Los flujos están fijos en 5 años, igual que en el Excel; el horizonte `n` solo afecta los factores (A/P), (A/F), el VAE y la TER.
