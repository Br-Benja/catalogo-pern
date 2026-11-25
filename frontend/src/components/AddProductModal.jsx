import toast from "react-hot-toast";
import { useProductStore } from "../store/useProductStore.js";
import ProductForm from "./ProductForm.jsx";

export const ADD_MODAL_ID = "add-product-modal";

export default function AddProductModal() {
  const { formData, formErrors, submitting, setFormData, resetForm, addProduct } = useProductStore();

  const close = () => {
    resetForm();
    document.getElementById(ADD_MODAL_ID)?.close();
  };

  const handleSubmit = async () => {
    const { ok, message } = await addProduct();
    if (ok) {
      toast.success(message);
      document.getElementById(ADD_MODAL_ID)?.close();
    } else {
      toast.error(message);
    }
  };

  return (
    <dialog id={ADD_MODAL_ID} className="modal" onClose={resetForm}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Agregar producto</h3>
        <ProductForm
          values={formData}
          errors={formErrors}
          onChange={setFormData}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Registrar"
        >
          <button type="button" className="btn btn-ghost" onClick={close}>
            Cancelar
          </button>
        </ProductForm>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={resetForm}>cerrar</button>
      </form>
    </dialog>
  );
}
