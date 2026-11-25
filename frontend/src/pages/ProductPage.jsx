import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useProductStore } from "../store/useProductStore.js";
import ProductForm from "../components/ProductForm.jsx";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";

const mxn = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

export default function ProductPage() {
  const { id } = useParams();
  const {
    currentProduct, productLoading, productError,
    editForm, editErrors, saving, setEditForm, fetchProduct, updateProduct, askDelete,
  } = useProductStore();
  const navigate = useNavigate();
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    setSaveError(null);
    fetchProduct(id);
  }, [id, fetchProduct]);

  const handleSave = async () => {
    const { ok, message } = await updateProduct(id);
    if (ok) {
      setSaveError(null);
      toast.success(message);
    } else {
      setSaveError(message);
      toast.error(message);
    }
  };

  if (productLoading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (productError) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="alert alert-error mb-4">{productError}</div>
        <Link to="/" className="btn btn-ghost">
          <ArrowLeft className="size-4" /> Volver al catálogo
        </Link>
      </main>
    );
  }

  if (!currentProduct) return null;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/" className="btn btn-ghost btn-sm mb-4">
        <ArrowLeft className="size-4" /> Volver al catálogo
      </Link>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Último dato confirmado por la API */}
        <section className="card bg-base-100 shadow-md" data-testid="saved-product">
          <figure className="h-56 bg-base-300">
            <img src={currentProduct.image} alt={currentProduct.name} className="h-full w-full object-cover" />
          </figure>
          <div className="card-body">
            <span className="badge badge-ghost">Último dato guardado</span>
            <h2 className="card-title">{currentProduct.name}</h2>
            <p className="text-lg font-semibold text-primary">{mxn.format(currentProduct.price)}</p>
          </div>
        </section>

        <section className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h1 className="card-title text-xl mb-2">Editar producto #{currentProduct.id}</h1>
            {saveError && (
              <div role="alert" className="alert alert-error text-sm py-2">
                {saveError}. Se conserva el último dato guardado.
              </div>
            )}
            <ProductForm
              values={editForm}
              errors={editErrors}
              onChange={setEditForm}
              onSubmit={handleSave}
              submitting={saving}
              submitLabel="Guardar cambios"
            >
              <button type="button" className="btn btn-outline btn-error" onClick={() => askDelete(currentProduct)}>
                <Trash2 className="size-4" /> Eliminar
              </button>
            </ProductForm>
          </div>
        </section>
      </div>
      <ConfirmDeleteModal onDeleted={() => navigate("/")} />
    </main>
  );
}
