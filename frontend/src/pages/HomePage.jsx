import { useEffect } from "react";
import { useProductStore } from "../store/useProductStore.js";
import ProductCard from "../components/ProductCard.jsx";

export default function HomePage() {
  const { products, loading, error, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Productos disponibles</h1>

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
    </main>
  );
}
