# Aromas del Valle: solución paso a paso del caso

**Resultado: el proyecto completo no es viable, pero la Fase 1 sola sí.** En el escenario base el proyecto completo tiene un VPN de −S/ 77,358 a la TMAR de 16 %. La Fase 1 (maquinaria, empaque, online y B2B) tiene un VPN de +S/ 117,320, una TIR de 27.6 % y una B/C de 1.45. Las tiendas de Lima y Arequipa son las que destruyen valor.

**Cómo está organizada la solución.** Los pasos 1 a 6 preparan los datos y las tasas. Los pasos 7 a 9 construyen los flujos de caja. Los pasos 10 a 16 aplican los indicadores del curso. Al final se responden las 6 preguntas del caso usando esos resultados.

Cada cálculo tiene su hoja en el Excel *Aromas\_del\_Valle\_modelo\_paso\_a\_paso*. La hoja *Paso\_a\_paso* enlaza cada paso con su resultado, y la hoja *Supuestos* marca en amarillo los datos que no vienen en el caso. Montos en soles constantes de 2025.

## Paso 1: datos del caso y supuestos que faltan

El primer paso es separar lo que el caso da de lo que hay que suponer, porque la conclusión depende de ambos.

**Datos que da el caso**

| Dato | Valor | Uso en la solución |
| --- | --- | --- |
| Facturación 2025 | S/ 1,850,000 | Base de las ventas por canal |
| Participación por canal | Tienda 58 %, online 27 %, B2B 15 % | Tienda S/ 1,073,000; online S/ 499,500; B2B S/ 277,500 |
| Costo de producción | S/ 49.50 por kg tostado | Costo unitario U |
| Precio 250 g / 500 g | S/ 42–48 / S/ 78–88 | S/ 180 por kg en tienda; S/ 166 por kg online (puntos medios) |
| Precio a cafeterías | S/ 95–110 por kg | S/ 102.50 (punto medio) |
| Flete online | S/ 14 por 500 g = S/ 28 por kg | Costo variable online |
| Pasarela de pago | 2.5–3.5 % | 3 % (punto medio) |
| Marketing digital | S/ 4.50 por kg online | Costo variable online |
| Comisión a cafeterías | 15–25 % | 20 % (punto medio) |
| Empaque local | S/ 3.80–4.20 por kg (hoy S/ 4.90) | Ahorro de S/ 0.90 por kg |
| Capacidad | 80 kg/día hoy; 250 kg/día con la máquina | Volumen máximo |
| Inversión | S/ 480,000 (maquinaria, local, capital de trabajo, marketing) | Inversión total |
| Préstamo | 36 meses, 14.5 % TEA | Cuota y costo de la deuda |
| Mercado | Crece 12–15 % al año | Ancla de los escenarios |

**Supuestos propios (el caso no los da)**

| Supuesto | Valor | Justificación |
| --- | --- | --- |
| Horizonte | 5 años (2026–2030) | El caso habla de 2026–2028; 5 años permiten ver las tiendas maduras |
| TMAR real | 16 % | Supera al CPPC real (paso 5) por el riesgo de una PYME |
| Impuesto a la Renta | 29.5 % | Régimen general en Perú |
| Inflación | 2 % anual | Centro de la meta del BCRP; el caso dice que «se ha moderado» |
| Desglose de la inversión | Fase 1: S/ 260 mil; Fase 2: S/ 220 mil | Detalle en el paso 8 y el paso 9 |
| Costos fijos de tiendas | Lima S/ 18,000 al mes; Arequipa S/ 11,000 al mes | Alquiler y personal |
| Margen de contribución de tiendas | 62 % | 72.5 % del producto menos ≈ 10 puntos de costos variables de tienda |
| Costos fijos de la Fase 1 | S/ 72,000 al año | Vendedor B2B, operación online y mantenimiento |
| Capital de trabajo | 10 % de las ventas incrementales | Nunca menor que el inicial; se recupera en el año 5 |
| Financiamiento | Préstamo por los S/ 480 mil | El caso no dice el monto |

Los supuestos están en amarillo en la hoja *Supuestos* del Excel. Si cambias uno, todo el modelo se recalcula.

## Paso 2: costo unitario y método unitario

Producir un kg de café tostado cuesta **U = S/ 49.50**. Es la suma de los siete rubros de la tabla del caso.

| Rubro | S/ por kg | % calculado = S/ ÷ 49.50 | % que dice el caso |
| --- | --- | --- | --- |
| Café verde (incluye flete interno) | 28.50 | 57.6 % | 52 % |
| Merma de tostado (15–16 %) | 5.20 | 10.5 % | 9.5 % |
| Mano de obra directa de tostado | 3.80 | 7.7 % | 7 % |
| Energía y gas | 2.10 | 4.2 % | 3.8 % |
| Empaque (bolsa + válvula + etiqueta) | 4.90 | 9.9 % | 9 % |
| Control de calidad y laboratorio | 1.40 | 2.8 % | 2.5 % |
| Costos indirectos de producción | 3.60 | 7.3 % | 6.6 % |
| **Total** | **49.50** | **100 %** | **90.4 %** |

**Cuidado con los porcentajes del caso:** suman 90.4 %, no 100 %. Por eso no cuadran con los soles; por ejemplo, 28.50 / 49.50 = 57.6 %, no 52 %. La solución usa siempre los soles por kg, que sí suman S/ 49.50.

**Método unitario.** El costo total se estima multiplicando el costo por unidad por el número de unidades:

```latex
C_t = U \times N = 49.50 \times 10{,}485 = S/\ 519{,}019
```

N = 10,485 kg es el volumen de 2025 (se calcula en el paso 4). Con la precisión de ±20 % que se acepta en una estimación preliminar, el costo anual de producción está entre **S/ 415,216 y S/ 622,823**. En el año 5 del escenario base se producen 15,985 kg, así que Ct = 49.50 × 15,985 ≈ S/ 791,235.

## Paso 3: precio, costo variable y contribución por canal

La **contribución unitaria** es lo que queda de cada kg vendido para cubrir los costos fijos: p − cv. Es el dato que se usa después en el punto de equilibrio.

**Tienda (Cusco).** Se vende a p = S/ 180 por kg (250 g a S/ 45). El único costo variable del producto es su costo de producción.

- cv = S/ 49.50
- p − cv = 180 − 49.50 = **S/ 130.50 por kg**
- Margen = 130.50 / 180 = **72.5 %**

**Online.** Se vende a p = S/ 166 por kg (500 g a S/ 83). Al costo de producción se suman el flete, la pasarela y el marketing.

- Pasarela = 3 % × 166 = S/ 4.98
- cv = 49.50 + 28.00 + 4.98 + 4.50 = S/ 86.98
- p − cv = 166 − 86.98 = **S/ 79.02 por kg**
- Margen = 79.02 / 166 = **47.6 %**

**B2B (cafeterías y hoteles).** El precio de lista es S/ 102.50 por kg, pero se paga 20 % de comisión.

- Comisión = 20 % × 102.50 = S/ 20.50
- cv = 49.50 + 20.50 = S/ 70.00
- p − cv = 102.50 − 70.00 = **S/ 32.50 por kg**
- Margen = 32.50 / 102.50 = **31.7 %**

| Canal | p (S/ por kg) | cv (S/ por kg) | p − cv | Margen |
| --- | --- | --- | --- | --- |
| Tienda | 180.00 | 49.50 | 130.50 | 72.5 % |
| Online | 166.00 | 86.98 | 79.02 | 47.6 % |
| B2B | 102.50 | 70.00 | 32.50 | 31.7 % |

**Diferencia con el caso.** El caso dice que el margen bruto es 42 % en venta directa y 18–25 % en cafeterías. Nuestros márgenes son mayores porque solo restan costos variables; los del caso incluyen costos que no detalla (alquiler, personal, reparto). Conviene pedir ese detalle (Pregunta 6).

## Paso 4: volumen actual y capacidad

En 2025 se vendieron ≈ **10,485 kg**, el 44 % de la capacidad actual. Los kg salen de dividir las ventas de cada canal entre su precio por kg.

| Canal | Ventas 2025 | ÷ Precio por kg | = Kg al año |
| --- | --- | --- | --- |
| Tienda (solo el 80 % que es café) | 1,073,000 × 0.80 = S/ 858,400 | 180.00 | 4,769 |
| Online | S/ 499,500 | 166.00 | 3,009 |
| B2B | S/ 277,500 | 102.50 | 2,707 |
| **Total** |  |  | **10,485** |

- Capacidad actual: 80 kg × 300 días = 24,000 kg al año, así que el uso promedio es 10,485 / 24,000 = **43.7 %**.
- El problema no es la capacidad promedio, sino los picos: en junio–agosto y diciembre se opera al 95 % y se rechazan pedidos.
- Capacidad con la máquina nueva: 250 kg × 300 días = 75,000 kg al año, **7.2 veces** el volumen actual. Incluso en el escenario optimista el año 5 queda muy por debajo, así que conviene cotizar una máquina más pequeña.

El 80 % de café en las ventas de tienda es un supuesto: el ticket de S/ 68 incluye accesorios y bebidas.

## Paso 5: tasas de interés y TMAR

La TMAR real de **16 %** es la tasa con la que se evalúa todo el proyecto. Este paso muestra que es razonable: supera al costo de financiarse (CPPC real de 8.2 %).

**5.1 Tasa mensual del préstamo.** El banco da una tasa efectiva anual; la cuota es mensual.

```latex
i_m = (1 + i_a)^{1/12} - 1 = (1.145)^{1/12} - 1 = 0.011348 = 1.1348\%
```

**5.2 Costo de la deuda después de impuestos.** Los intereses se descuentan del impuesto, así que la deuda cuesta menos que su tasa.

```latex
K'_d = K_d (1 - T) = 14.5\% \times (1 - 0.295) = 10.22\%
```

**5.3 Costo del patrimonio con CAPM.** Rf = 6.5 % (bono soberano peruano a 10 años), β = 0.67 (sector alimentos procesados) y prima de mercado Rm − Rf = 6.5 % (supuesto).

```latex
R_e = R_f + \beta (R_m - R_f) = 6.5\% + 0.67 \times 6.5\% = 10.86\%
```

**5.4 CPPC (WACC).** Se supone que el préstamo financia el 75 % y los dueños el 25 %.

```latex
CPPC = W_d K_d (1 - T) + W_e K_e = 0.75 \times 10.22\% + 0.25 \times 10.86\% = 10.38\%
```

**5.5 CPPC real.** Se despeja la tasa real de la fórmula de inflación if = i + f + i·f, con f = 2 %:

```latex
i = \frac{i_f - f}{1 + f} = \frac{10.38\% - 2\%}{1.02} = 8.22\%
```

**5.6 TMAR.** Se exige 16 % real, 7.8 puntos por encima del CPPC real, como prima por el riesgo de una PYME familiar que abre tiendas en ciudades nuevas. Se cumple la regla TMAR ≥ CPPC.

**5.7 TMAR inflada.** Sirve para descontar flujos en soles corrientes (paso 14).

```latex
i_f = i + f + i \cdot f = 16\% + 2\% + 16\% \times 2\% = 18.32\%
```

**5.8 TMAR antes de impuestos.** Sirve para descontar flujos antes de impuestos (paso 14).

```latex
TMAR_{antes} = \frac{TMAR_{después}}{1 - T} = \frac{16\%}{1 - 0.295} = 22.70\%
```

**Fórmulas que no se usan:** el costo de capital por dividendos (Re = D1/P + g), porque la empresa no cotiza; el costo capitalizado, porque el horizonte es finito; y la razón costo/efectividad, porque los beneficios sí se miden en soles.

## Paso 6: préstamo con el factor (A/P, i, n)

Un préstamo de S/ 480,000 a 36 meses tiene una cuota de **S/ 16,316 al mes** y cuesta **S/ 107,381** en intereses.

**6.1 Factor de recuperación de capital** con i\_m = 1.1348 % y n = 36 meses:

```latex
(A/P,\ i,\ n) = \frac{i(1+i)^n}{(1+i)^n - 1} = \frac{0.011348 \times (1.011348)^{36}}{(1.011348)^{36} - 1} = 0.033992
```

**6.2 Cuota.**

```latex
A = P\,(A/P,\ i_m,\ 36) = 480{,}000 \times 0.033992 = S/\ 16{,}316.15
```

**6.3 Primeros meses del cronograma.** Cada mes, interés = saldo × 1.1348 %; amortización = cuota − interés; saldo nuevo = saldo − amortización.

| Mes | Saldo inicial | Interés | Amortización | Saldo final |
| --- | --- | --- | --- | --- |
| 1 | 480,000.00 | 5,446.86 | 10,869.29 | 469,130.71 |
| 2 | 469,130.71 | 5,323.52 | 10,992.63 | 458,138.08 |
| 3 | 458,138.08 | 5,198.78 | 11,117.37 | 447,020.71 |
| 36 | 16,133.08 | 183.07 | 16,133.08 | 0.00 |

**6.4 Resumen por año.**

| Año | Cuota anual | Interés | Amortización | Escudo fiscal = interés × 29.5 % |
| --- | --- | --- | --- | --- |
| 1 | 195,794 | 56,906 | 138,888 | 16,787 |
| 2 | 195,794 | 36,767 | 159,027 | 10,846 |
| 3 | 195,794 | 13,708 | 182,086 | 4,044 |
| **Total** | **587,381** | **107,381** | **480,000** | **31,678** |

Si solo se financia la Fase 1 (S/ 260,000), la cuota baja a 260,000 × 0.033992 = **S/ 8,838 al mes** (S/ 106,055 al año). El cronograma completo está en la hoja *Prestamo*.

## Paso 7: escenarios de demanda (Pregunta 4)

Se arman tres escenarios alrededor del dato del caso: el segmento de especialidad crece 12–15 % al año. Este paso va antes del flujo de caja porque lo alimenta.

| Variable | Pesimista | Base | Optimista |
| --- | --- | --- | --- |
| Crecimiento anual de las ventas online (g) | 8 % | 18 % | 28 % |
| Ventas B2B adicionales al año 3 (sobre S/ 277,500) | +25 % | +60 % | +100 % |
| Ventas anuales de la tienda de Lima ya madura | S/ 250 mil | S/ 400 mil | S/ 550 mil |
| Ventas anuales de la tienda de Arequipa ya madura | S/ 170 mil | S/ 280 mil | S/ 380 mil |
| Probabilidad | 25 % | 50 % | 25 % |

**Por qué son razonables (con datos del caso):**

- **Pesimista:** solo el 8–12 % del mercado paga más de S/ 40 por 250 g; en Lima el cliente lo ve «caro» y hay marcas consolidadas con mejor distribución. Un sol más débil encarece el empaque y la maquinaria importados.
- **Base:** el online crece algo más que el mercado (18 %) porque ya tiene 4,200 clientes recurrentes y 41 % de suscripciones, y la máquina nueva elimina los pedidos rechazados en temporada alta.
- **Optimista:** una alianza logística con cooperativas baja el flete, se cierran contratos trimestrales con cafeterías y los microlotes se venden a S/ 55–65 por 250 g.

**Cómo se usan en el modelo:**

- Ventas online incrementales del año t = 499,500 × \[(1 + g)^t − 1\]. Ejemplo, base año 1: 499,500 × 0.18 = S/ 89,910.
- Las ventas B2B adicionales crecen en línea recta hasta el año 3: en la base, 277,500 × 60 % × 1/3 = S/ 55,500 el año 1 y S/ 166,500 desde el año 3.
- Las tiendas venden 50 % de sus ventas maduras el año 1, 75 % el año 2 y 100 % desde el año 3.

## Paso 8: flujo de caja de la Fase 1 (escenario base)

El flujo es **incremental**: solo cuenta lo que cambia por hacer la Fase 1. Las ventas de 2025 ya existen sin proyecto y no se suman.

**8.1 Inversión de la Fase 1 (S/ 260,000, desglose supuesto):** maquinaria de tostado y empaque S/ 180,000 (se deprecia 10 % al año); plataforma online, CRM y marketing inicial S/ 50,000 (se amortiza 20 % al año); capital de trabajo inicial S/ 30,000.

**8.2 Flujo línea por línea (S/)**

| Concepto | Año 0 | Año 1 | Año 2 | Año 3 | Año 4 | Año 5 |
| --- | --- | --- | --- | --- | --- | --- |
| Ventas online incrementales |  | 89,910 | 196,004 | 321,194 | 468,919 | 643,235 |
| Ventas B2B incrementales |  | 55,500 | 111,000 | 166,500 | 166,500 | 166,500 |
| Contribución online (× 47.6 %) |  | 42,799 | 93,303 | 152,896 | 223,217 | 306,195 |
| Contribución B2B (× 31.7 %) |  | 17,598 | 35,195 | 52,793 | 52,793 | 52,793 |
| Ahorros de merma y empaque (kg × S/ 1.24) |  | 14,345 | 15,809 | 17,415 | 18,519 | 19,821 |
| (−) Costos fijos |  | −72,000 | −72,000 | −72,000 | −72,000 | −72,000 |
| (−) Depreciación y amortización |  | −28,000 | −28,000 | −28,000 | −28,000 | −28,000 |
| **Utilidad operativa (EBIT)** |  | **−25,258** | **44,306** | **123,104** | **194,528** | **278,809** |
| (−) Impuesto = 29.5 % × EBIT |  | 7,451 | −13,070 | −36,316 | −57,386 | −82,249 |
| Utilidad después de impuestos |  | −17,807 | 31,236 | 86,788 | 137,143 | 196,560 |
| (+) Depreciación (no es salida de caja) |  | 28,000 | 28,000 | 28,000 | 28,000 | 28,000 |
| (−) Inversión fija y diferida | −230,000 |  |  |  |  |  |
| (−) Inversión en capital de trabajo | −30,000 | 0 | −700 | −18,069 | −14,773 | −17,432 |
| (+) Recuperación del capital de trabajo |  |  |  |  |  | 80,974 |
| (+) Valor de rescate de la maquinaria |  |  |  |  |  | 90,000 |
| **Flujo económico Fase 1** | **−260,000** | **10,193** | **58,536** | **96,719** | **150,370** | **378,102** |

**8.3 Cómo se obtiene cada línea**

- **Ventas online:** 499,500 × \[(1.18)^t − 1\]. Año 2: 499,500 × (1.3924 − 1) = 196,004.
- **Contribución:** ventas × margen del paso 3. Año 1 online: 89,910 × 47.6 % = 42,799.
- **Ahorros:** kg totales × (0.34 + 0.90). Los S/ 0.34 vienen de bajar la merma un punto: 28.50 × (1/0.84 − 1/0.85) ÷ (1/0.84). Los S/ 0.90 vienen de cambiar a empaque local (de S/ 4.90 a ≈ S/ 4.00).
- **Depreciación:** 180,000 × 10 % + 50,000 × 20 % = 28,000 al año.
- **Impuesto:** 29.5 % × EBIT. En el año 1 el EBIT es negativo y el impuesto sale positivo (+7,451): la pérdida reduce el impuesto que la empresa ya paga por sus otras utilidades.
- **Capital de trabajo:** cada año se necesita el mayor entre S/ 30,000 y el 10 % de las ventas incrementales; solo se invierte la diferencia. Año 3: 10 % × (321,194 + 166,500) = 48,769, menos 30,700 del año 2 = 18,069. Al final del año 5 se recupera todo.
- **Valor de rescate:** la maquinaria lleva 5 de sus 10 años de vida, así que vale 180,000 × (1 − 5 × 10 %) = 90,000 en libros.
- **Flujo:** utilidad después de impuestos + depreciación − inversiones + recuperaciones. Año 1: −17,807 + 28,000 − 0 = 10,193.

## Paso 9: flujo de caja de las tiendas (escenario base)

Cada tienda pierde dinero los dos primeros años mientras madura, y en régimen gana poco porque sus costos fijos son altos.

**9.1 Inversión de la Fase 2 (S/ 220,000, desglose supuesto):** acondicionamiento de Lima S/ 115,000 y de Arequipa S/ 80,000 (se deprecian 20 % al año, el plazo del alquiler); capital de trabajo inicial (inventario) S/ 15,000 en Lima y S/ 10,000 en Arequipa.

**9.2 Tienda de Lima (S/)**

| Concepto | Año 0 | Año 1 | Año 2 | Año 3 | Año 4 | Año 5 |
| --- | --- | --- | --- | --- | --- | --- |
| Ventas (50 % / 75 % / 100 % de S/ 400 mil) |  | 200,000 | 300,000 | 400,000 | 400,000 | 400,000 |
| Contribución (× 62 %) |  | 124,000 | 186,000 | 248,000 | 248,000 | 248,000 |
| (−) Costos fijos (18,000 × 12) |  | −216,000 | −216,000 | −216,000 | −216,000 | −216,000 |
| (−) Depreciación (115,000 × 20 %) |  | −23,000 | −23,000 | −23,000 | −23,000 | −23,000 |
| **EBIT** |  | **−115,000** | **−53,000** | **9,000** | **9,000** | **9,000** |
| (−) Impuesto (29.5 %) |  | 33,925 | 15,635 | −2,655 | −2,655 | −2,655 |
| (+) Depreciación |  | 23,000 | 23,000 | 23,000 | 23,000 | 23,000 |
| (−) Inversión | −115,000 |  |  |  |  |  |
| (−) Capital de trabajo | −15,000 | −5,000 | −10,000 | −10,000 | 0 | 0 |
| (+) Recuperación del capital de trabajo |  |  |  |  |  | 40,000 |
| **Flujo económico Lima** | **−130,000** | **−63,075** | **−24,365** | **19,345** | **29,345** | **69,345** |

**9.3 Tienda de Arequipa (S/)**, con el mismo procedimiento (ventas maduras de S/ 280 mil, costos fijos de S/ 132,000 y depreciación de S/ 16,000):

|  | Año 0 | Año 1 | Año 2 | Año 3 | Año 4 | Año 5 |
| --- | --- | --- | --- | --- | --- | --- |
| EBIT |  | −61,200 | −17,800 | 25,600 | 25,600 | 25,600 |
| **Flujo económico Arequipa** | **−90,000** | **−31,146** | **−3,549** | **27,048** | **34,048** | **62,048** |
| **Flujo de las dos tiendas** | **−220,000** | **−94,221** | **−27,914** | **46,393** | **63,393** | **131,393** |

**Lectura.** Ya madura, Lima deja solo S/ 9,000 de utilidad operativa al año sobre S/ 400,000 de ventas: el 62 % de margen apenas cubre los S/ 216,000 de costos fijos. El proyecto completo es la suma de los dos flujos: Fase 1 + tiendas = −480,000; −84,028; 30,622; 143,112; 213,763; 509,495.

## Paso 10: VPN con el factor (P/F, i, t)

En el escenario base el VPN de la Fase 1 es **+S/ 117,320** y el del proyecto completo, **−S/ 77,358**. Cada flujo se trae a presente con su factor y se suman:

```latex
VPN = \sum_{t=0}^{5} F_t \,(P/F,\ 16\%,\ t) \qquad (P/F,\ i,\ t) = \frac{1}{(1+i)^t}
```

| Año t | (P/F, 16 %, t) | Flujo Fase 1 | VP Fase 1 | Flujo tiendas | VP tiendas | Flujo total | VP total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 1.00000 | −260,000 | −260,000 | −220,000 | −220,000 | −480,000 | −480,000 |
| 1 | 0.86207 | 10,193 | 8,787 | −94,221 | −81,225 | −84,028 | −72,438 |
| 2 | 0.74316 | 58,536 | 43,501 | −27,914 | −20,745 | 30,622 | 22,757 |
| 3 | 0.64066 | 96,719 | 61,964 | 46,393 | 29,722 | 143,112 | 91,686 |
| 4 | 0.55229 | 150,370 | 83,048 | 63,393 | 35,011 | 213,763 | 118,059 |
| 5 | 0.47611 | 378,102 | 180,019 | 131,393 | 62,558 | 509,495 | 242,577 |
| **VPN** |  |  | **+117,320** |  | **−194,678** |  | **−77,358** |

**Ejemplo del año 1:** (P/F, 16 %, 1) = 1 / 1.16 = 0.86207, y 10,193 × 0.86207 = 8,787.

**Regla de decisión:** si VPN > 0, el proyecto rinde más que la TMAR y se acepta. La Fase 1 se acepta; las tiendas y el proyecto completo se rechazan.

## Paso 11: VAE, TIR, TER, B/C y periodo de recuperación

Los cinco indicadores llevan a la misma decisión que el VPN: la Fase 1 pasa todas las pruebas y el proyecto completo no pasa ninguna.

**11.1 Valor anual equivalente (VAE).** Reparte el VPN en 5 cuotas iguales con (A/P, 16 %, 5) = 0.16 × 1.16^5 / (1.16^5 − 1) = 0.30541.

```latex
VAE_{Fase\,1} = VPN\,(A/P,\ 16\%,\ 5) = 117{,}320 \times 0.30541 = +S/\ 35{,}831 \text{ por año}
```

El proyecto completo da −77,358 × 0.30541 = −S/ 23,626 por año.

**11.2 TIR por interpolación.** La TIR es la tasa con VPN = 0. Se calcula el VPN a varias tasas, se ubica dónde cambia de signo y se interpola. Para la Fase 1, a i1 = 25 % el VPN es +20,625 y a i2 = 30 % es −19,017:

```latex
TIR = i_1 + \frac{VPN_1}{VPN_1 - VPN_2}(i_2 - i_1) = 25\% + \frac{20{,}625}{20{,}625 + 19{,}017} \times 5\% = 27.60\%
```

Para el proyecto completo, a 10 % el VPN es +38,800 y a 15 % es −60,286:

```latex
TIR = 10\% + \frac{38{,}800}{38{,}800 + 60{,}286} \times 5\% = 11.96\%
```

La TIR de la Fase 1 (27.6 %) supera la TMAR (16 %) y se acepta; la del proyecto completo (12.0 %) no. Las TIR exactas son 27.47 % y 11.81 %: la interpolación se desvía en menos de 0.2 puntos.

**11.3 TER (TIR modificada).** Los flujos negativos se traen a presente al costo real del préstamo, i\_b = (14.5 % − 2 %) / 1.02 = 12.25 %. Los positivos se llevan al año 5 a la TMAR, como si se reinvirtieran.

- Fase 1: el único flujo negativo es la inversión, VP\_neg = 260,000.
- VF\_pos = 10,193 × 1.16^4 + 58,536 × 1.16^3 + 96,719 × 1.16^2 + 150,370 × 1.16 + 378,102 = 792,501.

```latex
TER = \left(\frac{VF_{pos}}{VP_{neg}}\right)^{1/n} - 1 = \left(\frac{792{,}501}{260{,}000}\right)^{1/5} - 1 = 24.97\%
```

El proyecto completo da (997,829 / 554,855)^(1/5) − 1 = 12.45 %, otra vez menor que la TMAR.

**11.4 Relación beneficio/costo.** VP de los flujos positivos ÷ VP de los flujos negativos, ambos a la TMAR (paso 10).

```latex
B/C_{Fase\,1} = \frac{8{,}787 + 43{,}501 + 61{,}964 + 83{,}048 + 180{,}019}{260{,}000} = \frac{377{,}320}{260{,}000} = 1.45
```

Con el mismo cálculo, el proyecto completo da 475,080 / 552,438 = 0.86 y las tiendas, 127,291 / 321,970 = 0.40. Se acepta si B/C ≥ 1.

**11.5 Periodo de recuperación descontado (Fase 1).** Se acumulan los VP del paso 10: −260,000; −251,213; −207,712; −145,748; −62,700 al final del año 4; y +117,320 al final del año 5. Se recupera en 4 + 62,700 / 180,019 = **4.35 años**. El proyecto completo no se recupera en 5 años.

| Indicador (base) | Fase 1 | Tiendas | Proyecto completo | Regla |
| --- | --- | --- | --- | --- |
| VPN | +117,320 | −194,678 | −77,358 | > 0 |
| VAE (por año) | +35,831 | −59,457 | −23,626 | > 0 |
| TIR por interpolación | 27.6 % | −8.4 % | 12.0 % | > 16 % |
| TER | 25.0 % | −3.9 % | 12.5 % | > 16 % |
| B/C | 1.45 | 0.40 | 0.86 | ≥ 1 |
| Recuperación descontada | 4.35 años | No recupera | No recupera | ≤ 5 años |

## Paso 12: los tres escenarios y el VPN esperado

Se repiten los pasos 8 a 11 con los datos de cada escenario. La Fase 1 solo pierde en el pesimista; el proyecto completo solo gana en el optimista.

&#91;embedded content: Excel, hojas Flujo\_Pesimista, Flujo\_Base y Flujo\_Optimista · horizonte de 5 años\]

**VPN esperado.** Cada VPN se pondera por la probabilidad de su escenario (25 % / 50 % / 25 %):

```latex
E[VPN] = \sum p_k \cdot VPN_k
```

- Fase 1: 0.25 × (−139,468) + 0.50 × 117,320 + 0.25 × 430,319 = **+S/ 131,373**
- Proyecto completo: 0.25 × (−628,809) + 0.50 × (−77,358) + 0.25 × 518,514 = **−S/ 66,253**

| TIR por interpolación | Pesimista | Base | Optimista |
| --- | --- | --- | --- |
| Fase 1 | −1.1 % | 27.6 % | 50.8 % |
| Tiendas | No existe | −8.4 % | 25.5 % |
| Proyecto completo | −29.7 % | 12.0 % | 39.6 % |

«No existe» significa que todos los flujos de las tiendas en el pesimista son negativos: no hay ninguna tasa que haga el VPN igual a cero.

## Paso 13: análisis incremental (¿vale la pena agregar las tiendas?)

En el escenario base, agregar las tiendas a la Fase 1 da un **ΔB/C de 0.33**, menor que 1, así que se elige la defensora (solo Fase 1).

**13.1 Las dos alternativas.** La defensora es la de menor inversión: solo la Fase 1 (S/ 260 mil). La retadora es el proyecto completo (S/ 480 mil). El flujo incremental es la diferencia:

```latex
\Delta F = F_{retadora} - F_{defensora}
```

| Año | F retadora (completo) | F defensora (Fase 1) | ΔF |
| --- | --- | --- | --- |
| 0 | −480,000 | −260,000 | −220,000 |
| 1 | −84,028 | 10,193 | −94,221 |
| 2 | 30,622 | 58,536 | −27,914 |
| 3 | 143,112 | 96,719 | 46,393 |
| 4 | 213,763 | 150,370 | 63,393 |
| 5 | 509,495 | 378,102 | 131,393 |

El ΔF es exactamente el flujo de las tiendas (paso 9).

**13.2 ΔB/C.** ΔB es la diferencia de los VP de beneficios y ΔC, la de los VP de costos (paso 11):

```latex
\frac{\Delta B}{\Delta C} = \frac{475{,}080 - 377{,}320}{552{,}438 - 260{,}000} = \frac{97{,}760}{292{,}438} = 0.33
```

**13.3 Decisión en los tres escenarios**

| Escenario | ΔVPN | ΔB / ΔC | ΔB/C | Se elige |
| --- | --- | --- | --- | --- |
| Pesimista | −489,342 | −49,856 / 439,486 | −0.11 | Defensora (Fase 1) |
| Base | −194,678 | 97,760 / 292,438 | 0.33 | Defensora (Fase 1) |
| Optimista | +88,195 | 322,228 / 234,033 | 1.38 | Retadora (completo) |

La TIR del flujo incremental en la base es −8.5 %, muy por debajo de la TMAR. Las tiendas solo valen la pena si se cumple el escenario optimista.

## Paso 14: flujo financiero, inflación y comprobación antes de impuestos

Con el préstamo de S/ 480 mil, el proyecto completo queda casi en cero (VPN financiero de +S/ 3,482). Si solo se financia la Fase 1 con S/ 260 mil, su VPN sube a **+S/ 161,108**.

**14.1 Flujo financiero.** Al flujo económico se suma el préstamo en el año 0 y se restan las cuotas, descontando su escudo fiscal (interés × T). Como la cuota está fija en soles corrientes, se pasa a soles constantes dividiendo entre (1 + f)^t:

```latex
F^{fin}_t = F_t - \frac{\text{cuota}_t - \text{interés}_t \cdot T}{(1 + f)^t}
```

Año 1 del proyecto completo: −84,028 − (195,794 − 16,787) / 1.02 = −84,028 − 175,497 = **−259,525**.

| Año | 0 | 1 | 2 | 3 | 4 | 5 | VPN a 16 % |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Completo + préstamo S/ 480 mil | 0 | −259,525 | −147,144 | −37,578 | 213,763 | 509,495 | **+3,482** |
| Fase 1 + préstamo S/ 260 mil | 0 | −84,868 | −37,754 | −1,154 | 150,370 | 378,102 | **+161,108** |

**Por qué sube el VPN con deuda:** el préstamo cuesta 10.22 % después de impuestos (≈ 8 % real), menos que la TMAR de 16 %. Pero la decisión de inversión se toma con el **flujo económico**: la deuda no vuelve buenas a las tiendas, solo traslada el problema a la caja de los años 1 a 3. En esos años el proyecto completo necesitaría S/ 444 mil adicionales de los dueños para pagar las cuotas.

**14.2 Inflación.** Los flujos están en soles constantes y se descuentan a la tasa real. Si se inflaran a 2 % anual, habría que descontarlos a la TMAR inflada (18.32 %), y el VPN sería el mismo. Comprobación con el año 5 de la Fase 1:

- En soles corrientes: 378,102 × (1.02)^5 = 417,452.
- A la TMAR inflada: 417,452 / (1.1832)^5 = 180,019.
- A la TMAR real: 378,102 / (1.16)^5 = 180,019. Es el mismo valor.

Sumando los seis años, ambas formas dan VPN = S/ 117,320 (hoja *Inflacion*).

**14.3 Comprobación antes de impuestos.** Si no se restan impuestos, hay que descontar a la TMAR antes de impuestos (22.7 %, paso 5.8). La Fase 1 da un VPN de +S/ 119,059 y el proyecto completo, −S/ 138,470. La conclusión no cambia.

## Paso 15: punto de equilibrio Q = CF / (p − cv)

Lima necesita vender ≈ **S/ 409 mil al año** para cubrir sus costos fijos y recuperar su inversión, y el escenario base le asigna S/ 400 mil. Arequipa necesita ≈ S/ 255 mil y la base le asigna S/ 280 mil.

**15.1 Equilibrio contable de las tiendas.** De los pasos 1 y 3: p = S/ 180, cv = 180 × (1 − 62 %) = S/ 68.40, p − cv = S/ 111.60 por kg.

```latex
Q_{Lima} = \frac{CF}{p - cv} = \frac{216{,}000}{111.60} = 1{,}935 \text{ kg} \;\Rightarrow\; 1{,}935 \times 180 = S/\ 348{,}387
```

Arequipa: Q = 132,000 / 111.60 = 1,183 kg, es decir, S/ 212,903 al año.

**15.2 Equilibrio con recuperación de la inversión.** Igual que en el ejemplo de la excavadora, la inversión se convierte en un costo anual equivalente y se suma a los costos fijos. En Lima, I = 115,000 + 15,000 = S/ 130,000 y el valor de rescate es el capital de trabajo recuperado, S = S/ 15,000:

```latex
A = I\,(A/P,\ 16\%,\ 5) - S\,(A/F,\ 16\%,\ 5) = 130{,}000 \times 0.30541 - 15{,}000 \times 0.14541 = 37{,}522
```

```latex
Q = \frac{CF + A}{p - cv} = \frac{216{,}000 + 37{,}522}{111.60} = 2{,}272 \text{ kg} \;\Rightarrow\; S/\ 408{,}907
```

| Tienda | CF | A | Q contable | Q con recuperación | Ventas de equilibrio | Ventas base (madura) |
| --- | --- | --- | --- | --- | --- | --- |
| Lima | 216,000 | 37,522 | 1,935 kg | 2,272 kg | S/ 408,907 | S/ 400,000 |
| Arequipa | 132,000 | 26,033 | 1,183 kg | 1,416 kg | S/ 254,892 | S/ 280,000 |

**Por qué Arequipa supera su equilibrio y aun así tiene VPN negativo:** el cálculo anterior supone que la tienda vende el 100 % desde el año 1. Con la maduración (50 % y 75 % en los años 1 y 2) y los impuestos, el equilibrio real sube a ≈ S/ 524 mil en Lima y S/ 328 mil en Arequipa. Ninguna de las dos lo alcanza en el escenario base.

**15.3 Equilibrio de la Fase 1.** I = S/ 260,000; S = 90,000 (maquinaria) + 30,000 (capital de trabajo) = S/ 120,000.

```latex
A = 72{,}000 + 260{,}000 \times 0.30541 - 120{,}000 \times 0.14541 = S/\ 133{,}957 \text{ por año}
```

```latex
Q = \frac{133{,}957}{79.02} = 1{,}695 \text{ kg online incrementales por año}
```

En el escenario base se venden 542 kg online adicionales el año 1, 1,935 kg el año 3 y 3,875 kg el año 5. La Fase 1 pasa su equilibrio desde el año 3, aun sin contar el aporte del B2B.

## Paso 16: gradiente geométrico y sensibilidad

**16.1 Valor del crecimiento online con gradiente geométrico.** Las ventas online crecen a una tasa constante g = 18 %, así que su valor presente sale de una sola fórmula. Las ventas del año 1 son A1 = 499,500 × 1.18 = S/ 589,410.

```latex
(P/A,\ g,\ i,\ n) = \frac{1 - \left(\frac{1+g}{1+i}\right)^n}{i - g} = \frac{1 - (1.18/1.16)^5}{0.16 - 0.18} = 4.4616
```

- VP de las ventas online con proyecto = 589,410 × 4.4616 = S/ 2,629,687.
- VP sin proyecto = 499,500 × (P/A, 16 %, 5) = 499,500 × 3.2743 = S/ 1,635,507.
- VP de las ventas incrementales = 2,629,687 − 1,635,507 = **S/ 994,180**. Coincide con sumar año por año las ventas del paso 8 × (P/F).

Con 47.6 % de margen, ese crecimiento aporta ≈ S/ 473 mil de contribución en valor presente, antes de costos fijos e impuestos. Es el motor de la Fase 1.

**16.2 Sensibilidad.** Se mueve un supuesto a la vez ±20 % y se recalcula el VPN del proyecto completo. Las tres variables de las tiendas mueven el VPN en más de S/ 300 mil; solo con ellas, o con un online que crezca 20 % más, el VPN total pasa a positivo.

&#91;embedded content: Excel, hoja Sensibilidad · un supuesto a la vez, escenario base\]

La Fase 1 sola resiste: incluso con un crecimiento online 20 % menor, su VPN sigue en +S/ 39 mil.

## Respuestas a las preguntas del caso

### Pregunta 1: ¿es viable financieramente el proyecto?

**Tal como está planteado, no.** En el escenario base el proyecto completo tiene un VPN de −S/ 77,358, una TIR de 12.0 % (menor que la TMAR de 16 %) y una B/C de 0.86 (pasos 10 y 11). Su VPN esperado es −S/ 66,253 (paso 12). La Fase 1 sola sí es viable: VPN +S/ 117,320, TIR 27.6 %, B/C 1.45 y recuperación en 4.35 años. El análisis incremental confirma que agregar las tiendas destruye valor (ΔB/C = 0.33, paso 13).

Los riesgos externos del caso empeoran el pronóstico de las tiendas: el consumidor de Lima es sensible al precio, la competencia tiene mejor distribución y las tasas de interés altas encarecen el financiamiento. El 48 % de las ventas de la tienda de Cusco depende del turismo, así que la caja actual tampoco es estable para pagar cuotas de S/ 196 mil al año.

### Pregunta 2: estrategia de precios por canal

La regla es no competir por precio en Lima, sino por origen, trazabilidad y experiencia, y usar una palanca distinta en cada canal.

| Canal | Situación (paso 3) | Estrategia | Efecto |
| --- | --- | --- | --- |
| Tienda | Mejor contribución: S/ 130.50 por kg | Mantener S/ 42–48 por 250 g; microlotes a S/ 55–65; formatos de 150–200 g; venta cruzada de accesorios | Más ticket promedio sin perder al cliente que compara precio |
| Online | El flete (S/ 28 por kg) es el 17 % del precio | Envío gratis solo desde un monto mínimo; \~10 % de descuento en suscripción a cambio de permanencia; formato más pequeño para Lima | Cada S/ 1 menos de flete por kg sube el margen 0.6 puntos |
| B2B | Margen más bajo: 31.7 % | Cambiar la comisión de 15–25 % por precios escalonados por volumen y contratos trimestrales; precio piso de S/ 105 netos por kg | Con S/ 105 netos, la contribución sube de S/ 32.50 a S/ 55.50 por kg (+71 %) |

### Pregunta 3: oportunidades en la cadena de valor y efecto en la caja

| Eslabón | Oportunidad | Impacto |
| --- | --- | --- |
| Proveedores (18 familias) | Contratos por volumen; negociar parte del sobreprecio de 25–35 % en los lavados de Cajamarca, que sobran | Café verde = S/ 28.50 por kg: 5 % menos ahorra S/ 1.43 por kg |
| Producción | La máquina nueva permite bajar la merma del 15–16 % | Cada punto menos ahorra S/ 0.34 por kg (paso 8) |
| Empaque | Proveedor local: de S/ 4.90 a S/ 3.80–4.20 por kg | Ahorra S/ 0.70–1.10 por kg y reduce el riesgo del tipo de cambio |
| Logística | Alianza con cooperativas o exportadoras con red en Lima | Baja el flete de S/ 28 por kg; es la variable con más peso en el margen online |
| Ventas B2B | CRM, metas formales y más de un vendedor para subir la conversión del 18 % | Contratos recurrentes y cobranza más predecible |
| Inventario | Pronóstico de demanda; hoy sobran lavados y faltan naturales y honey | Libera capital de trabajo |

**Efecto en el flujo de caja:** los ahorros de merma y empaque suman S/ 14–20 mil al año en la Fase 1 (paso 8). El capital de trabajo crece de S/ 30 mil a S/ 81 mil al año 5, porque se paga a los productores a 7 días y a las cafeterías probablemente se les cobra a plazo. Cobrar a 30 días en lugar de 60 reduciría a la mitad lo inmovilizado en cuentas por cobrar.

### Pregunta 4: escenarios de demanda

Ver el paso 7. Base: online +18 % al año, B2B +60 % al año 3, Lima S/ 400 mil y Arequipa S/ 280 mil. Pesimista y optimista se separan alrededor del crecimiento del mercado (12–15 %), y los riesgos del caso (precio, competencia, tipo de cambio) justifican el pesimista.

### Pregunta 5: ¿online o tiendas?

**Priorizar el online y las suscripciones, junto con un B2B ordenado.**

- **Demanda comprobada:** 4,200 clientes recurrentes, 41 % de suscripciones y solo 22 % de abandono de carrito.
- **Números:** la Fase 1 tiene VPN +S/ 117,320 y las tiendas −S/ 194,678 (paso 10). El crecimiento online vale S/ 994 mil en ventas en valor presente (paso 16).
- **Costos fijos:** el online deja 47.6 % sin alquiler ni personal de tienda; cada tienda carga S/ 132–216 mil fijos al año y Lima ni siquiera llega a su equilibrio con recuperación de la inversión (paso 15).
- **Riesgo reversible:** si el online no crece, se pierde poco; un alquiler de 5 años es difícil de cerrar.

Camino recomendado: hacer la Fase 1 y usar las ventas online a Lima y Arequipa como termómetro de demanda. Abrir una tienda solo cuando esos datos apunten a ventas cercanas a S/ 524 mil en Lima o S/ 328 mil en Arequipa, y probar antes con un pop-up o quiosco.

### Pregunta 6: información crítica, secundaria y adicional

Es crítica la información que cambia el signo del VPN; la sensibilidad (paso 16) muestra que son los datos de las tiendas.

**Crítica (pedir antes de decidir)**

1. Costos fijos reales de las tiendas nuevas (alquiler, personal) y de la tienda actual, para explicar el margen de 42 %. Un ±20 % en este dato mueve el VPN total en S/ 321 mil.
2. Demanda real en Lima y Arequipa: ventas online actuales a esas ciudades, estudios de ubicación y tráfico.
3. Desglose real de los S/ 480 mil y calendario de desembolsos.
4. Cotizaciones de las dos máquinas (brasileña y china): precio, vida útil, repuestos, merma esperada y una capacidad más cercana a la demanda.
5. Histórico de ventas de 24 meses y rotación por variedad y canal, para la estacionalidad y el capital de trabajo.
6. Monto del préstamo y comparación con el leasing, con el flujo de caja mensual.
7. Régimen tributario de la empresa y costos de los nuevos controles sanitarios.

**Secundaria**

- Seguidores en redes (28,000 en Instagram y 9,500 en TikTok): indican marca, no ventas.
- Encuesta a 180 clientes: útil como pista, pero la muestra es pequeña y sesgada hacia clientes actuales.
- Productos nuevos (descafeinado, procesos experimentales) mientras no se valide su demanda.

**Datos adicionales que pediría:** la tasa de inflación y el tipo de cambio esperados por el BCRP, la TMAR que exigen los dueños y el costo de los contratos con cafeterías (plazos de pago y descuentos por volumen).

## Recomendación final

1. **No aprobar el proyecto completo de S/ 480 mil tal como está.** VPN base −S/ 77,358; TIR 12.0 % menor que la TMAR de 16 %; B/C 0.86; VPN esperado −S/ 66,253.
2. **Aprobar la Fase 1 por S/ 260 mil.** VPN +S/ 117,320; VAE +S/ 35,831 al año; TIR 27.6 %; B/C 1.45; se recupera en 4.35 años. Incluye la maquinaria (con capacidad más cercana a la demanda que 250 kg/día), el empaque local, el refuerzo del online y las suscripciones, y un B2B con contratos y precio piso.
3. **Financiar solo la Fase 1:** un préstamo de S/ 260 mil baja la cuota a S/ 8,838 al mes y deja un VPN financiero de +S/ 161,108.
4. **Condicionar las tiendas** a datos de demanda que se acerquen a su equilibrio (S/ 524 mil en Lima y S/ 328 mil en Arequipa) y a costos fijos confirmados. El análisis incremental solo las favorece en el escenario optimista (ΔB/C = 1.38). Probar primero con un pop-up.
5. **Vigilar los riesgos:** dependencia del turismo (48 % de la tienda), tipo de cambio en empaque y maquinaria importados, inflación y tasas de interés altas.

## Fuentes

- Caso de estudio «Aromas del Valle» (2026) y formulario del curso.
- [BCRP: rendimiento del bono del gobierno peruano a 10 años en soles](https://estadisticas.bcrp.gob.pe/estadisticas/series/mensuales/resultados/PD31895MM/html), dato de setiembre de 2026 (Rf = 6.5 %).
- [Damodaran: betas por sector (global)](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/BetasGlobal.html), Food Processing, datos de enero de 2026 (β = 0.67).
