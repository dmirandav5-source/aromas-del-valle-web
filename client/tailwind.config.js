/** @type {import('tailwindcss').Config} */
// Los colores apuntan a los tokens CSS de src/styles.css (modo claro y oscuro).
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        fondo: token('fondo'),
        superficie: token('superficie'),
        elevada: token('elevada'),
        borde: token('borde'),
        tinta: token('tinta'),
        suave: token('suave'),
        tenue: token('tenue'),
        cafe: token('cafe'),
        crema: token('crema'),
        andino: token('andino'),
        terracota: token('terracota'),
        bien: token('bien'),
        mal: token('mal'),
        aviso: token('aviso'),
        casoAzul: token('caso-azul'),
        propio: token('propio'),
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: { contenido: '76rem' },
      boxShadow: { tarjeta: '0 1px 2px rgb(0 0 0 / .05), 0 4px 16px -6px rgb(0 0 0 / .10)' },
    },
  },
  plugins: [],
};
