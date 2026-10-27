// Formato numérico peruano: separador de miles «,», decimales «.», negativos con «−».
const cache = new Map();
function nf(dec) {
  const k = `${dec}`;
  if (!cache.has(k)) {
    cache.set(k, new Intl.NumberFormat('es-PE', { minimumFractionDigits: dec, maximumFractionDigits: dec }));
  }
  return cache.get(k);
}

const MENOS = '−';
const valido = (v) => typeof v === 'number' && Number.isFinite(v);

// 117320.4 → "117,320"; −77358 → "−77,358"
export function num(v, dec = 0) {
  if (!valido(v)) return '—';
  const r = nf(dec).format(Math.abs(v));
  const esCero = Number(r.replace(/,/g, '')) === 0;
  return v < 0 && !esCero ? `${MENOS}${r}` : r;
}

// Con signo explícito: "+117,320"
export function numSigno(v, dec = 0) {
  if (!valido(v)) return '—';
  return v > 0 ? `+${num(v, dec)}` : num(v, dec);
}

// "S/ 117,320"; "−S/ 77,358"
export function soles(v, dec = 0) {
  if (!valido(v)) return '—';
  const s = `S/ ${num(Math.abs(v), dec)}`;
  return v < 0 && num(v, dec).startsWith(MENOS) ? `${MENOS}${s}` : s;
}

export function solesSigno(v, dec = 0) {
  if (!valido(v)) return '—';
  return v > 0 ? `+${soles(v, dec)}` : soles(v, dec);
}

// 0.276 → "27.6 %"
export function pct(v, dec = 1) {
  if (!valido(v)) return '—';
  return `${num(v * 100, dec)} %`;
}

// Abrevia para ejes: 1,250,000 → "1.25 M"; 117,320 → "117 mil"
export function corto(v) {
  if (!valido(v)) return '';
  const a = Math.abs(v);
  const signo = v < 0 ? MENOS : '';
  if (a >= 1e6) return `${signo}${num(a / 1e6, 2)} M`;
  if (a >= 1e3) return `${signo}${num(a / 1e3, 0)} mil`;
  return num(v, 0);
}

// Indicador de TIR/TER/B/C que puede «no existir»
export function tasaONo(v, dec = 1, texto = 'No existe') {
  return valido(v) ? pct(v, dec) : texto;
}

export function anios(v) {
  return valido(v) ? `${num(v, 2)} años` : 'No recupera en 5 años';
}

// Para KaTeX: 117320 → "117{,}320"
export function tex(v, dec = 0) {
  return num(v, dec).replace(/,/g, '{,}').replace(MENOS, '-');
}
export function texPct(v, dec = 2) {
  return `${tex(v * 100, dec)}\\%`;
}
