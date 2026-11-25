/**
 * Valida req[source] con un esquema de Zod.
 * Si es válido, reemplaza los datos por la versión limpia (p. ej. nombre sin espacios).
 * Si no, responde 400 con el detalle de cada campo y no llega al controlador.
 */
export const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source] ?? {});
  if (!result.success) {
    const errors = {};
    for (const issue of result.error.issues) {
      const field =
        issue.code === "unrecognized_keys" ? issue.keys.join(", ") : issue.path.join(".") || "body";
      if (!errors[field]) {
        errors[field] = issue.code === "unrecognized_keys" ? "Campo no permitido" : issue.message;
      }
    }
    return res.status(400).json({ success: false, message: "Datos inválidos", errors });
  }
  req.validated = { ...(req.validated || {}), [source]: result.data };
  next();
};
