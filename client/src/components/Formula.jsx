// Fórmulas con KaTeX
import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export function Formula({ tex, bloque = true, etiqueta }) {
  const html = useMemo(
    () => katex.renderToString(tex, { displayMode: bloque, throwOnError: false, strict: false }),
    [tex, bloque],
  );
  const Tag = bloque ? 'div' : 'span';
  return (
    <Tag
      className={bloque ? 'my-2 max-w-full overflow-x-auto overflow-y-hidden' : ''}
      tabIndex={bloque ? 0 : undefined}
      aria-label={etiqueta}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export const F = ({ children }) => <Formula tex={children} bloque={false} />;
