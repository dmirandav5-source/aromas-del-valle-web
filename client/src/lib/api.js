// Cliente de la API REST. Lanza un Error con la lista de mensajes del servidor.
let pin = '';
try {
  pin = sessionStorage.getItem('adminPin') ?? '';
} catch {
  pin = '';
}

export function setPin(valor) {
  pin = valor;
  try {
    sessionStorage.setItem('adminPin', valor);
  } catch {
    /* almacenamiento no disponible */
  }
}

export async function api(ruta, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${ruta}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(pin ? { 'x-admin-pin': pin } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let datos = null;
  try {
    datos = await res.json();
  } catch {
    datos = null;
  }
  if (!res.ok) {
    const err = new Error(datos?.errores?.join(' ') || `Error ${res.status}`);
    err.status = res.status;
    err.errores = datos?.errores ?? [err.message];
    throw err;
  }
  return datos;
}
