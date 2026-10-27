// Aplica el tema guardado antes de pintar la página (evita el destello claro/oscuro).
// Es un archivo aparte, no un script en línea, para respetar la CSP de helmet.
(function () {
  try {
    var t = localStorage.getItem('tema');
    if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
