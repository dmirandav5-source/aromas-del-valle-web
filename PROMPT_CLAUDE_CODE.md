# Prompt para Claude Code: sitio web «Aromas del Valle — Evaluación del proyecto de expansión 2026-2030»

> Copia todo este archivo y pégalo en Claude Code, con la carpeta del proyecto abierta en Visual Studio Code. La carpeta `referencia/` debe estar junto a este archivo.

---

## 1. Rol y contexto

Actúa como un equipo de desarrollo full-stack senior: diseñador de producto, desarrollador frontend y desarrollador backend. Vas a construir el sitio web de **Aromas del Valle S.A.C.**, una empresa peruana (ficticia, para un caso académico de Ingeniería Económica) que tuesta y vende café de especialidad. La empresa quiere presentar, ante sus socios y ante el banco, la evaluación de su proyecto de expansión 2026-2030, y validar si es viable.

El sitio tiene tres objetivos:

1. **Presentar la empresa:** ubicación, misión, visión, objetivos, logo y situación actual.
2. **Mostrar la evaluación económica completa y paso a paso**, con toda la información de los dos documentos definitivos (el Excel y la solución en Markdown). No se puede omitir ningún paso, tabla, fórmula ni respuesta.
3. **Permitir cambiar los supuestos** (las celdas amarillas del Excel) desde un panel. Al cambiar un supuesto, todos los resultados, tablas y gráficos se recalculan al instante, igual que en el Excel.

## 2. Fuentes de verdad (leer antes de programar)

En la carpeta `referencia/` están los documentos **definitivos**. Antes de escribir código, léelos completos:

| Archivo | Qué contiene | Cómo usarlo |
| --- | --- | --- |
| `referencia/Aromas_del_Valle_modelo_paso_a_paso.xlsx` | Modelo financiero con 14 hojas: Resumen, Paso_a_paso, Supuestos, Tasas, Factores, Costos_Margenes, Prestamo, Flujo_Pesimista, Flujo_Base, Flujo_Optimista, Incremental, Equilibrio, Inflacion y Sensibilidad | Lee las **fórmulas** (openpyxl o SheetJS) y los **valores** de cada hoja. El motor de cálculo del sitio debe reproducir exactamente esas fórmulas. |
| `referencia/Aromas_del_Valle_solucion_paso_a_paso.md` | Solución escrita: introducción, pasos 1 a 16 (fórmulas LaTeX, tablas y explicaciones), respuestas a las preguntas 1 a 6, recomendación final y fuentes | Es el **texto del sitio**. Debe aparecer completo, con la misma redacción, pero con los números conectados al motor de cálculo. Los dos `[embedded content: …]` son los gráficos de VPN por escenario y de tornado: vuelve a dibujarlos en React. |
| `referencia/Caso_de_estudio_2026.docx` | Enunciado original del caso, con la tabla de costos como imagen | Para la sección «El caso» (situación actual, mercado, competencia, preguntas). Extrae el texto y la imagen de la tabla de costos. |

**Regla clave:** en la primera carga, con los supuestos por defecto, el sitio debe mostrar **exactamente** las mismas cifras que el Excel y el documento. En la sección 7 hay valores de control para comprobarlo.

## 3. Stack técnico (obligatorio)

- **Frontend:** React 18 + Vite + JavaScript, con Tailwind CSS para los estilos, Recharts para los gráficos, KaTeX (`react-katex` o `katex`) para las fórmulas y React Router para la navegación.
- **Backend:** Node.js 20 + Express. Es una API REST sencilla.
- **Persistencia:** **no hace falta una base de datos.** Basta con archivos JSON en `server/data/`:
  - `supuestos.default.json`: los valores originales del Excel. Nunca se modifica.
  - `supuestos.json`: los valores actuales. Se crea a partir del default si no existe.
  - `escenarios.json` y `versiones.json`: escenarios personalizados y versiones guardadas.
  - Escribe los archivos de forma atómica (archivo temporal y luego `rename`).
- **Motor de cálculo compartido:** un solo módulo de JavaScript puro, `shared/engine.js`, sin dependencias. Lo usan el frontend (para recalcular en vivo mientras se edita) y el backend (para `/api/resultados` y para las pruebas).
- **Estructura:** un monorepo con `client/`, `server/`, `shared/` y `referencia/`, más un `package.json` raíz con estos scripts:
  - `npm install`: instala todo (usa workspaces o `postinstall`).
  - `npm run dev`: levanta Vite y Express a la vez con `concurrently`, con proxy `/api` desde Vite.
  - `npm run build`: compila el frontend.
  - `npm start`: Express sirve la API y el frontend compilado desde un solo puerto (`PORT`, por defecto 3000).
  - `npm test`: corre las pruebas del motor con Vitest.
- **Sin dependencias pagadas ni claves de API.**

## 4. Datos ficticios de la empresa (sección «Empresa»)

Todos estos datos son ficticios y para uso académico. Muéstralos con un aviso en el pie de página: *«Caso académico. Empresa, direcciones y datos de contacto ficticios.»*

- **Razón social:** Aromas del Valle S.A.C. (marca: «Aromas del Valle — Café de origen peruano»).
- **Fundación:** 2018, en Cusco (8 años de operación).
- **Ubicación (ficticia):**
  - Tienda y oficina: Jr. Los Cafetales 245, Centro Histórico, Cusco, Perú.
  - Tostadero artesanal: Urubamba, Valle Sagrado de los Incas, Cusco.
  - Puntos de venta propuestos: Miraflores (Lima) y Yanahuara (Arequipa).
  - Muestra un mapa estático del Perú hecho en SVG propio (sin APIs de mapas), con Cusco, Lima y Arequipa marcados, y las regiones de origen del café: Cusco, Junín y Cajamarca.
- **Contacto (ficticio):** contacto@aromasdelvalle.example · +51 984 000 000 · WhatsApp Business.
- **Misión:** «Llevar a cada taza el café de especialidad de las familias productoras del Perú, con trazabilidad completa desde la finca y un tueste artesanal que respeta el origen, generando relaciones justas y duraderas con nuestros productores y clientes».
- **Visión:** «Ser al 2030 la marca peruana de café de especialidad de origen más reconocida por su calidad y trazabilidad en el sur del país, con presencia nacional a través de canales digitales y alianzas con las mejores cafeterías».
- **Valores:** trazabilidad, comercio justo, calidad (84-87 puntos SCA), experiencia y sostenibilidad.
- **Objetivo general del proyecto:** «Evaluar la viabilidad económica de expandir la capacidad de tostado, el canal online, el canal B2B y la apertura de tiendas en Lima y Arequipa en 2026-2030, y elegir la alternativa que maximice el valor para los socios».
- **Objetivos específicos:**
  1. Eliminar los pedidos rechazados en temporada alta, que hoy opera al 95 % de la capacidad.
  2. Hacer crecer las ventas online y las suscripciones a un ritmo mayor que el del mercado (12-15 % anual).
  3. Ordenar el canal B2B con contratos y un precio piso.
  4. Reducir costos de merma y empaque.
  5. Decidir con indicadores (VPN, TIR, B/C) si las tiendas físicas crean valor.
- **Datos 2025 (del caso):** facturación de S/ 1.85 millones; ventas por canal de 58 % tienda, 27 % online y 15 % B2B; 4,200 clientes online recurrentes; 41 % de suscripciones; 18 familias productoras; Instagram con 28,000 seguidores y TikTok con 9,500.
- **Logo:** diseña un **logo original en SVG** (componente React y archivo `client/public/logo.svg`, también como favicon). Debe combinar un grano de café estilizado con la silueta de una montaña andina o de un valle, y el texto «Aromas del Valle». Usa la paleta del sitio. Haz una versión horizontal y una solo con el ícono. No uses marcas ni logos existentes.

## 5. Diseño del frontend (debe verse como un sitio corporativo profesional)

- **Dirección visual:** cálida y editorial, inspirada en el café y los Andes. La paleta usa tonos café tostado, crema, verde andino y un acento terracota. Define tokens CSS en `:root` y una versión para **modo oscuro** (con interruptor y respeto a `prefers-color-scheme`).
- **Tipografía (Google Fonts):** una serif con carácter para los títulos (por ejemplo, Fraunces) y una sans legible para el texto y las cifras (por ejemplo, Inter, con `font-variant-numeric: tabular-nums` en las tablas).
- **Diseño adaptable:** debe verse impecable en celular (360 px), tablet y escritorio, sin scroll horizontal de la página. En celular, las tablas anchas hacen scroll dentro de su propio contenedor.
- **Navegación:** barra superior fija con el logo y las secciones; menú hamburguesa en celular; índice lateral fijo en la sección «Solución paso a paso»; botón para volver arriba.
- **Componentes:**
  - Tarjetas de indicadores (KPI) con semáforo: verde si cumple la regla (VPN > 0, TIR > TMAR, B/C ≥ 1) y rojo si no.
  - Tablas con formato peruano de soles: `S/ 117,320`, con los negativos en rojo y con signo «−».
  - Fórmulas con KaTeX.
  - Acordeones para los detalles largos.
  - Pestañas para cambiar de escenario.
- **Gráficos (Recharts):**
  1. VPN por escenario: barras agrupadas de Fase 1, Tiendas y Proyecto completo en Pesimista, Base y Optimista.
  2. Tornado de sensibilidad (±20 %).
  3. Flujo de caja por año en barras, con el VPN acumulado como línea.
  4. Cronograma del préstamo: saldo e intereses.
  5. Punto de equilibrio: ventas de equilibrio frente a las ventas del escenario base, por tienda.
  6. Composición del costo por kg.
- **Accesibilidad:** contraste AA, `alt` en las imágenes, foco visible y gráficos con título y descripción.
- **Animaciones** sutiles al hacer scroll, desactivadas si el usuario tiene `prefers-reduced-motion`.

## 6. Páginas y secciones

1. **Inicio (hero):** logo, propuesta de valor y el veredicto en grande: *«El proyecto completo no es viable; la Fase 1 sí»*. Muestra cuatro KPI conectados al motor: VPN de la Fase 1, VPN del proyecto completo, TIR de la Fase 1 y B/C de la Fase 1. Agrega botones «Ver la solución paso a paso» y «Probar supuestos».
2. **Empresa:** los datos de la sección 4, más una línea de tiempo (2018: fundación; 2025: S/ 1.85 millones; 2026: proyecto de expansión) y los tres canales de venta.
3. **El caso:** resumen del enunciado (situación actual, mercado, competencia, condiciones económicas), la tabla de costos por kg con la nota de que los porcentajes del caso suman 90.4 %, y las seis preguntas.
4. **Solución paso a paso:** los **pasos 1 a 16 completos** del documento de referencia, con sus tablas, fórmulas y explicaciones. Cada número sale del motor, así que si cambian los supuestos, el texto cambia. Al final de cada paso, agrega un enlace «Ver en el modelo» hacia la vista de la hoja equivalente del Excel.
5. **Modelo financiero (las 14 hojas del Excel):** una vista por hoja, con las mismas filas, columnas y etiquetas:
   - Resumen y Paso_a_paso.
   - Supuestos: enlaza al panel de edición.
   - Tasas, Factores y Costos_Margenes.
   - Prestamo: el cronograma de 36 meses de los dos préstamos y el resumen anual.
   - Flujo_Pesimista, Flujo_Base y Flujo_Optimista: todas las líneas, más las tablas de indicadores, de TIR por interpolación (i1, VPN1, i2, VPN2) y de TER.
   - Incremental, Equilibrio, Inflacion y Sensibilidad.
6. **Panel de supuestos (CRUD):** ver la sección 8.
7. **Respuestas y recomendación:** las preguntas 1 a 6, la recomendación final y las fuentes, tal como están en el documento.
8. **Descargas:** el Excel original (`referencia/…xlsx`, servido como archivo estático) y un botón para **exportar a Excel los supuestos y resultados actuales** con SheetJS (`xlsx`), en una hoja de supuestos y una de resultados.

## 7. Motor de cálculo (`shared/engine.js`)

Exporta `calcular(supuestos)`. La función devuelve un objeto con todas las tablas de las 14 hojas. Reproduce las fórmulas del Excel: si algo de esta especificación no coincide con el Excel, **manda el Excel**.

### 7.1 Supuestos y valores por defecto (celdas editables)

| Clave | Valor por defecto | Descripción |
| --- | --- | --- |
| `tmar` | 0.16 | TMAR real |
| `T` | 0.295 | Impuesto a la Renta |
| `f` | 0.02 | Inflación anual |
| `wcPct` | 0.10 | Capital de trabajo, como % de las ventas incrementales |
| `n` | 5 | Horizonte en años |
| `Rf` | 0.065 | Tasa libre de riesgo (BCRP, bono soberano a 10 años) |
| `beta` | 0.67 | Beta (Damodaran, Food Processing) |
| `primaMercado` | 0.065 | Prima de mercado |
| `Wd` | 0.75 | Peso de la deuda (We = 1 − Wd) |
| `costos` | Café verde (incluye flete interno) 28.50; Merma de tostado 5.20; Mano de obra directa de tostado 3.80; Energía y gas 2.10; Empaque 4.90; Control de calidad y laboratorio 1.40; Costos indirectos de producción 3.60 | Costo por kg. U = suma = 49.50 |
| `pTienda` | 180 | Precio por kg en tienda |
| `pOnline` | 166 | Precio por kg online |
| `flete` | 28 | Flete online por kg |
| `pasarela` | 0.03 | Comisión de la pasarela de pago |
| `mkt` | 4.5 | Marketing online por kg |
| `pB2B` | 102.5 | Precio por kg a cafeterías |
| `comB2B` | 0.20 | Comisión a cafeterías |
| `facturacion` | 1,850,000 | Facturación 2025 |
| `shTienda` | 0.58 | Participación de la tienda |
| `shOnline` | 0.27 | Participación del canal online |
| `shB2B` | 0.15 | Participación del canal B2B |
| `cafeTienda` | 0.80 | % de las ventas de tienda que es café |
| `cap0` | 80 | Capacidad actual (kg/día) |
| `cap1` | 250 | Capacidad nueva (kg/día) |
| `dias` | 300 | Días de operación al año |
| `invMaq` | 180,000 | Inversión en maquinaria y empaque |
| `invInt` | 50,000 | Plataforma online, CRM y marketing inicial |
| `wc1` | 30,000 | Capital de trabajo inicial de la Fase 1 |
| `dMaq` | 0.10 | Tasa de depreciación de la maquinaria |
| `dInt` | 0.20 | Tasa de amortización del intangible |
| `cf1` | 72,000 | Costos fijos de la Fase 1 |
| `ahMerma` | 0.34 | Ahorro por merma (S/ por kg) |
| `ahEmp` | 0.90 | Ahorro por empaque (S/ por kg) |
| `invLima` | 115,000 | Inversión en la tienda de Lima |
| `invAqp` | 80,000 | Inversión en la tienda de Arequipa |
| `wcLima` | 15,000 | Capital de trabajo inicial de Lima |
| `wcAqp` | 10,000 | Capital de trabajo inicial de Arequipa |
| `dT` | 0.20 | Tasa de depreciación de las tiendas |
| `cmT` | 0.62 | Margen de contribución de las tiendas |
| `FLima` | 216,000 | Costos fijos anuales de Lima |
| `FAqp` | 132,000 | Costos fijos anuales de Arequipa |
| `ramp` | [0.5, 0.75, 1, 1, 1] | Maduración de las ventas de las tiendas |
| `P` | 480,000 | Préstamo del proyecto completo |
| `P1` | 260,000 | Préstamo solo para la Fase 1 |
| `tea` | 0.145 | TEA del préstamo |
| `nm` | 36 | Plazo del préstamo en meses |

**Escenarios por defecto:**

| Escenario | `g` | `b2b` | `lima` | `aqp` | `prob` |
| --- | --- | --- | --- | --- | --- |
| Pesimista | 0.08 | 0.25 | 250,000 | 170,000 | 0.25 |
| Base | 0.18 | 0.60 | 400,000 | 280,000 | 0.50 |
| Optimista | 0.28 | 1.00 | 550,000 | 380,000 | 0.25 |

### 7.2 Fórmulas (t = 1…5; el año 0 es la inversión)

**Ventas, márgenes y volumen**

- Ventas 2025 por canal: `vT = facturacion·shTienda`, `vOn = facturacion·shOnline`, `vB = facturacion·shB2B`.
- Margen online: `cmOn = (pOnline − U − flete − pasarela·pOnline − mkt) / pOnline`.
- Margen B2B: `cmB = (pB2B·(1 − comB2B) − U) / pB2B`.
- Volumen 2025: `kg0 = vT·cafeTienda/pTienda + vOn/pOnline + vB/pB2B`.

**Fase 1**

- `on_t = vOn·((1+g)^t − 1)`.
- `b2b_t = vB·b2b·min(t/3, 1)`.
- `kg_t = kg0 + on_t/pOnline + b2b_t/pB2B`.
- `EBITDA_t = on_t·cmOn + b2b_t·cmB + kg_t·(ahMerma + ahEmp) − cf1`.
- `dep = invMaq·dMaq + invInt·dInt`.
- `EBIT_t = EBITDA_t − dep`.
- `imp_t = −EBIT_t·T`. Un EBIT negativo genera un escudo fiscal positivo.
- `CT_0 = wc1`; `CT_t = max(wc1, wcPct·(on_t + b2b_t))`.
- `F_0 = −(invMaq + invInt) − wc1`.
- `F_t = EBIT_t·(1 − T) + dep − (CT_t − CT_{t−1})`.
- En t = 5 se suman además `CT_5` y el valor de rescate `invMaq·(1 − 5·dMaq)`.

**Tiendas** (cada una con su `inv`, `wc0`, `F` y ventas maduras `S`)

- `v_t = S·ramp[t−1]`.
- `EBIT_t = v_t·cmT − F − inv·dT`.
- `CT_0 = wc0`; `CT_t = max(wc0, wcPct·v_t)`.
- `F_0 = −inv − wc0`.
- `F_t = EBIT_t·(1 − T) + inv·dT − ΔCT`.
- En t = 5 se suma `CT_5`. Las tiendas no tienen valor de rescate.

**Tasas**

- `i_m = (1 + tea)^(1/12) − 1`.
- `Kd' = tea·(1 − T)`.
- `Ke = Rf + beta·primaMercado`.
- `CPPC = Wd·Kd' + (1 − Wd)·Ke`.
- `CPPC_real = (CPPC − f)/(1 + f)`.
- `TMAR_inflada = tmar + f + tmar·f`.
- `TMAR_antes = tmar/(1 − T)`.
- `i_b = (tea − f)/(1 + f)`.

**Factores**

- `(P/F,i,t) = 1/(1+i)^t`.
- `(P/A,i,n) = ((1+i)^n − 1)/(i(1+i)^n)`.
- `(A/P,i,n) = i(1+i)^n/((1+i)^n − 1)`.
- `(A/F,i,n) = i/((1+i)^n − 1)`.
- `(F/A,i,n) = ((1+i)^n − 1)/i`.
- `(P/A,g,i,n) = (1 − ((1+g)/(1+i))^n)/(i − g)`, o `n/(1+i)` si g = i.

**Préstamo:** cuota `A = P·(A/P, i_m, nm)`. Para cada mes: `interés = saldo·i_m`; `amortización = A − interés`; `saldo_nuevo = saldo − amortización`. Haz un resumen por año.

**Indicadores**, para cada flujo (Fase 1, Lima, Arequipa, Tiendas, Total económico, Total financiero, Fase 1 financiero, Fase 1 antes de impuestos y Total antes de impuestos)

- `VPN = Σ F_t·(P/F, tmar, t)`. Los flujos antes de impuestos se descuentan a `TMAR_antes`.
- `VAE = VPN·(A/P, tmar, n)`.
- `B/C = VP(flujos > 0) / VP(|flujos < 0|)`.
- **TIR por interpolación:** calcula el VPN en una grilla de −40 % a 60 % en pasos de 5 %. Toma el último `i1` con VPN ≥ 0 y el siguiente `i2`, y aplica `TIR = i1 + VPN1/(VPN1 − VPN2)·(i2 − i1)`. Si todos los VPN tienen el mismo signo, muestra «No existe». Muestra también la TIR exacta (bisección) para comparar.
- **TER:** `VP_neg` a `i_b`, `VF_pos` a `tmar` llevados al año n, y `TER = (VF_pos/VP_neg)^(1/n) − 1`.
- **Recuperación descontada:** el año en que el VP acumulado pasa a ser positivo, con interpolación lineal dentro de ese año. Si no ocurre, muestra «No recupera en 5 años».

**Otros cálculos**

- **Flujo financiero:** `FF_0 = F_0 + P`; `FF_t = F_t − (cuota_anual_t − interés_t·T)/(1 + f)^t`. Se hace para el total con P y para la Fase 1 con P1.
- **VPN esperado:** `Σ prob_k·VPN_k`.
- **Análisis incremental:** retadora = Total y defensora = Fase 1.
  - `ΔF = F_ret − F_def`.
  - `ΔB/C = (B_ret − B_def)/(C_ret − C_def)`.
  - Si `ΔB/C ≥ 1`, se elige la retadora; si no, la defensora.
- **Equilibrio de tiendas:**
  - `cv = pTienda·(1 − cmT)`.
  - `Q = CF/(p − cv)`.
  - Con recuperación de la inversión: `A = (inv + wc0)·(A/P) − wc0·(A/F)` y `Q2 = (CF + A)/(p − cv)`.
  - Ventas de equilibrio = `Q·p`.
- **Equilibrio económico de tiendas:** busca por bisección las ventas maduras que hacen VPN = 0 en cada tienda.
- **Equilibrio de la Fase 1:** `A = cf1 + (invMaq + invInt + wc1)·(A/P) − (rescate + wc1)·(A/F)` y `Q = A / contribución online por kg`.
- **Gradiente geométrico:** `VP_inc = vOn(1+g)·(P/A,g,tmar,n) − vOn·(P/A,tmar,n)`. Debe coincidir con `Σ on_t·(P/F)`.
- **Inflación:** muestra que `Σ F_t(1+f)^t/(1+TMAR_inflada)^t` es igual a `Σ F_t/(1+tmar)^t`.
- **Método unitario:** `Ct = U·N`, con un rango de ±20 %.
- **Sensibilidad:** en el escenario base, multiplica por 0.8 y por 1.2 un grupo de supuestos a la vez y recalcula el VPN total y el de la Fase 1. Los grupos son:
  - Ventas maduras de tiendas (lima y aqp).
  - Margen de las tiendas (cmT).
  - Costos fijos de las tiendas (FLima y FAqp).
  - Crecimiento online (g).
  - B2B adicional (b2b).
  - Flete.
  - Costo de producción (todos los rubros de `costos`).
  - Inversión total (las 7 partidas de inversión).
  - TMAR.
  - Costos fijos de la Fase 1 (cf1).

  Ordena el resultado por rango, de mayor a menor.

### 7.3 Valores de control (supuestos por defecto)

Escribe **pruebas con Vitest** que comprueben estos valores con una tolerancia de ±1 sol, o de ±0.0001 en tasas y razones:

- U = 49.50.
- Contribución por kg: tienda 130.50, online 79.02 y B2B 32.50.
- kg0 = 10,485.24; uso de la capacidad actual = 43.69 %.
- i_m = 1.13476 %; cuota = 16,316.15; intereses totales = 107,381.34; cuota con P1 = 8,837.91.
- Kd' = 10.2225 %; Ke = 10.855 %; CPPC = 10.3806 %; CPPC real = 8.2163 %; TMAR inflada = 18.32 %; TMAR antes = 22.695 %.
- Flujos del escenario base:

  | Flujo | Año 0 | Año 1 | Año 2 | Año 3 | Año 4 | Año 5 |
  | --- | --- | --- | --- | --- | --- | --- |
  | Fase 1 | −260,000 | 10,192.84 | 58,535.57 | 96,719.41 | 150,370.00 | 378,102.21 |
  | Tiendas | −220,000 | −94,221 | −27,914 | 46,393 | 63,393 | 131,393 |

- VPN por escenario:

  | Escenario | Fase 1 | Tiendas | Total |
  | --- | --- | --- | --- |
  | Pesimista | −139,467.55 | −489,341.80 | −628,809.35 |
  | Base | 117,319.82 | −194,678.31 | −77,358.49 |
  | Optimista | 430,319.34 | 88,194.64 | 518,513.98 |

- VPN esperado: Fase 1 = 131,372.86; Total = −66,253.09.
- Indicadores base:
  - VAE: Fase 1 = 35,830.57; Total = −23,626.01.
  - TIR interpolada: Fase 1 = 27.60 %; Total = 11.96 %.
  - TIR exacta: Fase 1 = 27.47 %; Total = 11.81 %.
  - TER de la Fase 1 = 24.97 %.
  - B/C: Fase 1 = 1.4512; Total = 0.8600; Tiendas = 0.3954.
  - Recuperación de la Fase 1 = 4.35 años.
- ΔB/C: Pesimista = −0.1134; Base = 0.3343; Optimista = 1.3768.
- VPN financiero base: Total = 3,481.90; Fase 1 con P1 = 161,108.37.
- Equilibrio con recuperación: Lima = S/ 408,906.58; Arequipa = S/ 254,891.53.
- Q de la Fase 1 = 1,695.23 kg.
- Equilibrio económico: ≈ 524,495 (Lima) y ≈ 327,559 (Arequipa).
- Gradiente: VP incremental = 994,179.70.
- Sensibilidad (VPN total con −20 % / +20 %):

  | Grupo | −20 % | +20 % |
  | --- | --- | --- |
  | Costos fijos de tiendas | 83,305 | −238,022 |
  | Margen de tiendas | −235,333 | 80,616 |
  | Ventas de tiendas | −231,241 | 76,524 |
  | Crecimiento online | −155,427 | 7,036 |

Si alguna prueba falla, corrige el motor contra el Excel antes de continuar.

## 8. Backend y CRUD (`server/`)

**Endpoints REST** (todas las respuestas en JSON):

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | `/api/supuestos` | Lee los supuestos actuales |
| PUT | `/api/supuestos` | Reemplaza todos los supuestos (con validación) |
| PATCH | `/api/supuestos/:clave` | Actualiza un supuesto |
| POST | `/api/supuestos/restablecer` | Vuelve a los valores por defecto del Excel |
| GET | `/api/escenarios` | Lista los escenarios |
| POST | `/api/escenarios` | Crea un escenario personalizado (nombre, g, b2b, lima, aqp, prob) |
| PUT | `/api/escenarios/:id` | Edita un escenario |
| DELETE | `/api/escenarios/:id` | Borra un escenario personalizado (los 3 originales no se pueden borrar) |
| GET | `/api/versiones` | Lista las versiones guardadas |
| POST | `/api/versiones` | Guarda los supuestos actuales con un nombre |
| GET | `/api/versiones/:id` | Lee una versión |
| POST | `/api/versiones/:id/cargar` | Carga una versión como supuestos actuales |
| DELETE | `/api/versiones/:id` | Borra una versión |
| GET | `/api/resultados` | Ejecuta `calcular()` con los supuestos actuales |
| GET | `/api/salud` | Estado del servidor |

**Reglas del backend:**

- **Validación con `zod`:** tasas entre −0.99 y 1, montos ≥ 0, probabilidades que sumen 1 (o normalizarlas avisando) y `ramp` con 5 valores entre 0 y 1. Los errores se devuelven en español.
- **Protección opcional:** si existe la variable de entorno `ADMIN_PIN`, las rutas que modifican datos piden el encabezado `x-admin-pin`. Así, en la URL pública cualquiera puede ver el sitio, pero solo quien tenga el PIN puede guardar cambios. Sin `ADMIN_PIN`, la edición queda abierta.
- **Middleware:** CORS, `helmet` y `compression`.

**Panel de supuestos en el frontend:**

- Formulario agrupado igual que la hoja Supuestos (tasas, costo de capital, costos por kg, precios, situación actual, Fase 1, Fase 2, préstamo y escenarios).
- Los campos que vienen del caso se muestran en azul y los supuestos propios con fondo amarillo, igual que en el Excel. Cada campo lleva su fuente o comentario.
- **Recálculo en vivo:** mientras se escribe, se usa el motor en el navegador y se muestra un banner de «Cambios sin guardar». Los botones son:
  - Guardar (PUT).
  - Descartar.
  - Restablecer valores del Excel (con confirmación).
  - Guardar versión.
- Al lado del formulario, una vista previa fija con los KPI clave, que muestra la diferencia frente a los valores originales (por ejemplo, «VPN total: −77,358 → +12,400 ▲»).
- CRUD de escenarios personalizados y de versiones guardadas, con tablas y modales.

## 9. Ejecución local en Visual Studio Code

- Incluye un **README.md en español** con estos pasos: requisitos (Node.js 20 LTS), `npm install`, `npm run dev`, abrir `http://localhost:5173`, `npm test` y `npm run build && npm start`.
- Incluye `.vscode/launch.json` y `.vscode/tasks.json` para levantar el proyecto con F5, y `.vscode/extensions.json` que recomiende ESLint, Prettier y Tailwind CSS IntelliSense.
- Incluye `.env.example` con `PORT=3000` y `ADMIN_PIN=` (vacío).
- Incluye `.gitignore` y `.nvmrc`.

## 10. Publicar con una URL pública

1. Prepara el proyecto para desplegarlo **gratis en Render** como un solo servicio web de Node, con un `render.yaml` (Blueprint):
   - `buildCommand: npm install && npm run build`.
   - `startCommand: npm start`.
   - Variable `NODE_VERSION=20` y `ADMIN_PIN` configurable.
2. Agrega al README una guía paso a paso para alguien sin experiencia:
   1. Crear un repositorio en GitHub y subir el proyecto desde VS Code.
   2. Crear una cuenta en Render y elegir «New → Blueprint» con ese repositorio.
   3. Esperar el despliegue y copiar la URL `https://aromas-del-valle.onrender.com` (o la que asigne Render) para abrirla desde cualquier dispositivo.
3. Explica en el README dos limitaciones del plan gratuito:
   - El servidor «se duerme» tras unos minutos sin uso y tarda unos segundos en despertar.
   - Los archivos JSON se reinician a los valores del Excel con cada redespliegue. Para una presentación es suficiente, gracias al botón «Restablecer». Si se necesita que los cambios persistan, se puede agregar un Render Disk o migrar a SQLite/Postgres sin cambiar la API.
4. Como alternativa para una demo rápida sin desplegar, documenta el uso de un túnel temporal (`npx localtunnel --port 3000` o `cloudflared tunnel --url http://localhost:3000`) y aclara que la URL solo funciona mientras la computadora esté encendida.

## 11. Calidad y entrega

- El código va en español en los textos visibles y puede ir en inglés en los nombres de variables. Organízalo en componentes pequeños y comenta las fórmulas con su nombre del curso, por ejemplo `// (A/P, i, n) factor de recuperación de capital`.
- Formato numérico con `Intl.NumberFormat('es-PE')`, adaptado a S/ y con separador de miles «,» igual que el documento. Los porcentajes llevan un decimal, o dos en las tasas.
- No inventes cifras: todo número que se muestre sale del motor o de los documentos de referencia.
- Antes de terminar, **verifica**:
  1. `npm test` en verde.
  2. `npm run build` sin errores.
  3. Levanta `npm start` y revisa con Playwright o capturas que la página se vea bien en 375 px y 1440 px, en modo claro y oscuro.
  4. Cambia un supuesto (por ejemplo, `FLima` a 172,800) y confirma que el VPN total y los gráficos cambian, y que «Restablecer» devuelve los valores de control.
- Al final, dame un resumen corto con:
  - La estructura de carpetas.
  - Los comandos para ejecutar.
  - Los pasos para publicar en Render.
  - Cualquier diferencia que hayas encontrado entre el Excel y esta especificación, y cómo la resolviste.

**Trabaja por etapas** y muéstrame el avance en cada una:

1. Leer las referencias.
2. Escribir el motor y las pruebas.
3. Hacer el backend.
4. Hacer el diseño base y el logo.
5. Construir las secciones.
6. Hacer el panel de supuestos.
7. Configurar el despliegue y el README.
