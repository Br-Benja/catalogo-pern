import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { useProductStore } from "../store/useProductStore.js";
import { useIsAdmin } from "../store/useAuthStore.js";

const mxn = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

export default function ProductCard({ product }) {
  const askDelete = useProductStore((s) => s.askDelete);
  const isAdmin = useIsAdmin();

  return (
    <article className="card bg-base-100 shadow-md">
      <figure className="h-48 bg-base-300">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{product.name}</h2>
        <p className="text-lg font-semibold text-primary">{mxn.format(Number(product.price))}</p>
        {/* Los botones solo se muestran al administrador; la API además lo exige (401/403) */}
        {isAdmin && (
          <div className="card-actions justify-end">
            <Link to={`/product/${product.id}`} className="btn btn-sm btn-outline btn-primary">
              <Pencil className="size-4" /> Editar
            </Link>
            <button className="btn btn-sm btn-outline btn-error" onClick={() => askDelete(product)}>
              <Trash2 className="size-4" /> Eliminar
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
