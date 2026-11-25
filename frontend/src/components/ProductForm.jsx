/**
 * Formulario reutilizable para alta (HU02) y edición (HU03).
 * Muestra debajo de cada campo el error que devolvió la validación de la API.
 */
export default function ProductForm({ values, errors = {}, onChange, onSubmit, submitting, submitLabel, children }) {
  const field = (key) => ({
    value: values[key],
    onChange: (e) => onChange({ ...values, [key]: e.target.value }),
    className: `input input-bordered w-full ${errors[key] ? "input-error" : ""}`,
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <label className="form-control w-full">
        <span className="label-text font-medium mb-1 block">Nombre</span>
        <input type="text" placeholder="Ej. Teclado mecánico" {...field("name")} />
        {errors.name && <span className="text-error text-sm mt-1 block">{errors.name}</span>}
      </label>

      <label className="form-control w-full">
        <span className="label-text font-medium mb-1 block">Precio (MXN)</span>
        <input type="text" inputMode="decimal" placeholder="Ej. 1299.90" {...field("price")} />
        {errors.price && <span className="text-error text-sm mt-1 block">{errors.price}</span>}
      </label>

      <label className="form-control w-full">
        <span className="label-text font-medium mb-1 block">URL de la imagen</span>
        <input type="text" placeholder="https://..." {...field("image")} />
        {errors.image && <span className="text-error text-sm mt-1 block">{errors.image}</span>}
      </label>

      <div className="flex justify-end gap-2 pt-2">
        {children}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting && <span className="loading loading-spinner loading-sm" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
