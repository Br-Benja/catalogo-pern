import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";

const mxn = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

export default function ProductCard({ product }) {
  return (
    <article className="card bg-base-100 shadow-md">
      <figure className="h-48 bg-base-300">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{product.name}</h2>
        <p className="text-lg font-semibold text-primary">{mxn.format(Number(product.price))}</p>
        <div className="card-actions justify-end">
          <Link to={`/product/${product.id}`} className="btn btn-sm btn-outline btn-primary">
            <Pencil className="size-4" /> Editar
          </Link>
        </div>
      </div>
    </article>
  );
}
