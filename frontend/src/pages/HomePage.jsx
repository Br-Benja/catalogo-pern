import { useEffect } from "react";
import { PlusCircle, RefreshCw } from "lucide-react";
import { useProductStore } from "../store/useProductStore.js";
import ProductCard from "../components/ProductCard.jsx";
import AddProductModal, { ADD_MODAL_ID } from "../components/AddProductModal.jsx";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";

export default function HomePage() {
  const { products, loading, error, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Productos disponibles</h1>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-circle" onClick={fetchProducts} aria-label="Recargar">
            <RefreshCw className="size-5" />
          </button>
          <button className="btn btn-primary" onClick={() => document.getElementById(ADD_MODAL_ID)?.showModal()}>
            <PlusCircle className="size-5" />
            Agregar producto
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error mb-6">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : products.length === 0 && !error ? (
        <div className="text-center py-20" data-testid="empty-state">
          <p className="text-xl font-semibold">No hay productos en el catálogo</p>
          <p className="text-base-content/60">Cuando se registren productos aparecerán aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <AddProductModal />
      <ConfirmDeleteModal />
    </main>
  );
}
