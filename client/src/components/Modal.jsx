// Modal accesible basado en <dialog>
import { useEffect, useRef } from 'react';

export default function Modal({ abierto, onCerrar, titulo, children, acciones }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) d.showModal();
    if (!abierto && d.open) d.close();
  }, [abierto]);
  return (
    <dialog
      ref={ref}
      onClose={onCerrar}
      onCancel={onCerrar}
      className="w-[min(34rem,calc(100%-2rem))] rounded-2xl border border-borde bg-superficie p-0 text-tinta shadow-tarjeta backdrop:bg-black/50"
    >
      {abierto && (
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold">{titulo}</h2>
            <button type="button" onClick={onCerrar} className="text-suave hover:text-tinta" aria-label="Cerrar">
              ✕
            </button>
          </div>
          <div className="mt-4">{children}</div>
          {acciones && <div className="mt-6 flex flex-wrap justify-end gap-2">{acciones}</div>}
        </div>
      )}
    </dialog>
  );
}
