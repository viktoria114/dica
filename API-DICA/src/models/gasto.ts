export class Gasto {
  constructor(
    public id: number | null,
    public fk_stock: number,
    public monto: number,
    public cantidad: number,
    public categoria: string,
    public descripcion: string = "", //default
    public fecha: Date = new Date() //default 
  ) {

    if (id !== null && (!Number.isInteger(id) || id <= 0)) {
      throw new Error("El id debe ser un número entero positivo o null.");
    }

    if (!Number.isInteger(fk_stock) || fk_stock <= 0) {
      throw new Error("El fk_stock debe ser un entero positivo.");
    }

    if (typeof monto !== "number" || monto <= 0) {
      throw new Error("El monto debe ser un número mayor que 0.");
    }

    if (monto > 1_000_000) {
      throw new Error("El monto supera el límite permitido.");
    }
    if (!/^\d+(\.\d{1,3})?$/.test(monto.toString())) {
      throw new Error("El monto debe tener máximo tres decimales.");
    }

    if (typeof cantidad !== "number" || cantidad <= 0) {
      throw new Error("La cantidad debe ser un número mayor que 0.");
    }

    const categoriasPermitidas = [
      "insumos",
      "mantenimiento",
      "transporte",
      "impuestos",
      "otros",
    ];
    if (!categoriasPermitidas.includes(categoria.toLowerCase())) {
      throw new Error(
        `Categoría inválida. Las categorías permitidas son: ${categoriasPermitidas.join(
          ", "
        )}.`
      );
    }

    if (this.descripcion == null){
        this.descripcion = ""
    }

    if (
        descripcion.trim().length < 5 ||
        descripcion.trim().length > 255
        ) {
        throw new Error(
            "La descripción debe tener entre 5 y 255 caracteres y no ser vacía."
        );
    }

    if (!(fecha instanceof Date) || isNaN(fecha.getTime())) {
      throw new Error("La fecha no es válida.");
    }
    const hoy = new Date();
    if (fecha > hoy) {
      throw new Error("La fecha no puede ser futura.");
    }
 }
}