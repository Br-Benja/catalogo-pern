import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useProductStore } from "../store/useProductStore.js";

/**
 * Confirmación de baja (HU04). Cancelar no envía ninguna petición.
 * onDeleted se llama después de una baja exitosa (p. ej. para volver al catálogo).
 */
export default function ConfirmDeleteModal({ onDeleted }) {
  const { toDelete, deleting, cancelDelete, deleteProduct } = useProductStore();
  const ref = useRef(null);

  useEffect(() => {
    if (toDelete) ref.current?.showModal();
    else ref.current?.close();
  }, [toDelete]);

  const confirm = async () => {
    const { ok, message } = await deleteProduct();
    if (ok) {
      toast.success(message);
      onDeleted?.();
    } else {
      toast.error(message);
    }
  };

  return (
    <dialog ref={ref} className="modal" onClose={cancelDelete}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">¿Eliminar producto?</h3>
        <p className="py-4">
          Se eliminará <strong>{toDelete?.name}</strong> del catálogo. Esta acción no se puede deshacer.
        </p>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={cancelDelete} disabled={deleting}>
            Cancelar
          </button>
          <button className="btn btn-error" onClick={confirm} disabled={deleting}>
            {deleting && <span className="loading loading-spinner loading-sm" />}
            Eliminar
          </button>
        </div>
      </div>
    </dialog>
  );
}
