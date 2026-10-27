// Exporta a Excel los supuestos y resultados actuales con SheetJS (hojas «Supuestos» y «Resultados»).
import { CAMPOS, CAMPOS_ESCENARIO, GRUPOS } from '@aromas/shared/meta.js';

export async function exportarExcel(supuestos, r) {
  const XLSX = await import('xlsx');
  const grupo = Object.fromEntries(GRUPOS.map((g) => [g.id, g.titulo]));

  // Hoja de supuestos
  const sup = [['Grupo', 'Concepto', 'Clave', 'Valor', 'Unidad', 'Origen', 'Fuente / comentario']];
  for (const c of CAMPOS) {
    sup.push([grupo[c.grupo], c.label, c.key, supuestos[c.key], c.unidad === 'pct' ? 'fracción' : c.unidad, c.origen === 'caso' ? 'Dato del caso' : 'Supuesto propio', c.fuente]);
  }
  supuestos.costos.forEach((c) => sup.push([grupo.costos, c.rubro, `costos.${c.id}`, c.valor, 'S/ por kg', 'Dato del caso', 'Caso: tabla de costos por kg tostado (2025)']));
  supuestos.ramp.forEach((v, i) => sup.push([grupo.fase2, `Maduración de ventas de tiendas, año ${i + 1}`, `ramp[${i}]`, v, 'fracción', 'Supuesto propio', 'Supuesto: 50 % / 75 % / 100 %']));
  for (const e of supuestos.escenarios) {
    for (const c of CAMPOS_ESCENARIO) {
      sup.push([grupo.escenarios, `${c.label} — ${e.nombre}`, `${e.id}.${c.key}`, e[c.key], c.unidad === 'pct' ? 'fracción' : c.unidad, 'Supuesto propio', e.original ? 'Escenario del Excel' : 'Escenario personalizado']);
    }
  }

  // Hoja de resultados
  const res = [['Escenario', 'Indicador', 'Flujo', 'Valor']];
  for (const e of r.escenarios) {
    for (const ind of e.indicadores) {
      res.push([e.nombre, 'VPN (S/)', ind.nombre, ind.vpn]);
      res.push([e.nombre, 'VAE (S/ por año)', ind.nombre, ind.vae]);
      res.push([e.nombre, 'B/C', ind.nombre, ind.bc ?? 'n.a.']);
      res.push([e.nombre, 'TIR por interpolación', ind.nombre, ind.tirInterp.tir ?? 'No existe']);
      res.push([e.nombre, 'TIR exacta', ind.nombre, ind.tirExacta ?? 'No existe']);
      if (ind.ter) res.push([e.nombre, 'TER', ind.nombre, ind.ter.ter ?? 'No existe']);
      res.push([e.nombre, 'Recuperación descontada (años)', ind.nombre, ind.recuperacion ?? 'No recupera en 5 años']);
    }
  }
  res.push([]);
  res.push(['VPN esperado', 'Fase 1', '', r.resumen.vpn.fase1.esperado]);
  res.push(['VPN esperado', 'Proyecto completo', '', r.resumen.vpn.total.esperado]);
  for (const x of r.incremental.porEscenario) res.push([x.nombre, 'ΔB/C (completo vs. Fase 1)', x.decision, x.dBC ?? 'n.a.']);
  res.push([]);
  res.push(['Tasas', 'TMAR real', '', r.tasas.tmar]);
  res.push(['Tasas', 'CPPC real', '', r.tasas.cppcReal]);
  res.push(['Tasas', 'TMAR inflada', '', r.tasas.tmarInflada]);
  res.push(['Tasas', 'TMAR antes de impuestos', '', r.tasas.tmarAntes]);
  res.push(['Préstamo', 'Cuota mensual (proyecto completo)', '', r.prestamo.completo.cuota]);
  res.push(['Préstamo', 'Cuota mensual (solo Fase 1)', '', r.prestamo.fase1.cuota]);
  res.push(['Equilibrio', 'Ventas de equilibrio con recuperación — Lima', '', r.equilibrio.lima.ventasEq]);
  res.push(['Equilibrio', 'Ventas de equilibrio con recuperación — Arequipa', '', r.equilibrio.aqp.ventasEq]);
  res.push(['Equilibrio', 'Equilibrio económico (VPN = 0) — Lima', '', r.equilibrio.lima.economico]);
  res.push(['Equilibrio', 'Equilibrio económico (VPN = 0) — Arequipa', '', r.equilibrio.aqp.economico]);
  res.push(['Equilibrio', 'Kg online de equilibrio de la Fase 1', '', r.equilibrio.fase1.Q]);
  res.push([]);
  res.push(['Flujos (escenario base)', 'Año 0', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5']);
  for (const ind of r.base.indicadores) res.push([ind.nombre, ...ind.flujos]);

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet(sup);
  ws1['!cols'] = [{ wch: 34 }, { wch: 58 }, { wch: 18 }, { wch: 14 }, { wch: 10 }, { wch: 16 }, { wch: 70 }];
  const ws2 = XLSX.utils.aoa_to_sheet(res);
  ws2['!cols'] = [{ wch: 44 }, { wch: 36 }, { wch: 56 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Supuestos');
  XLSX.utils.book_append_sheet(wb, ws2, 'Resultados');
  const fecha = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Aromas_del_Valle_supuestos_y_resultados_${fecha}.xlsx`);
}
