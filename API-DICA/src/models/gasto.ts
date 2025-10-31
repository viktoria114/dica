export class Gasto {
  constructor(
    public id: number | null,
    public monto: number,
    public categoria: string,
    public metodoDePago: string,
    public descripcion: string | null,
    public fk_registro_stock: number | null,
    public fecha: Date = new Date() //default 
  ) {

    if (id !== null && (!Number.isInteger(id) || id <= 0)) {
      throw new Error("El id debe ser un número entero positivo o null.")
    }

    if (fk_registro_stock !== null){
      if (!Number.isInteger(fk_registro_stock) || fk_registro_stock <= 0) {
        throw new Error("El fk_stock debe ser un entero positivo.")
      }
    }

   if (typeof monto !== "number" || monto <= 0) {
      throw new Error("El monto debe ser un número mayor que 0.")
    }

    if (monto > 1_000_000) {
      throw new Error("El monto supera el límite permitido.")
    }
    if (!/^\d+(\.\d{1,3})?$/.test(monto.toString())) {
      throw new Error("El monto debe tener máximo tres decimales.")
    }

    const metodosPagoPermitidos = ["efectivo", "tarjeta", "transferencia"]
    this.metodoDePago = this.metodoDePago.toLowerCase()

    if (!metodosPagoPermitidos.includes(this.metodoDePago)){
      throw new Error(`Metodo de pago invalido. Los metodos permitidos son: ${metodosPagoPermitidos.join(", ")}`)
    }

    const categoriasPermitidas = [
      "insumos",
      "salarios",
      "alquiler",
      "mantenimiento",
      "equipamiento",
      "transporte",
      "marketing",
      "impuestos",
      "otros",
    ]

    if (!categoriasPermitidas.includes(categoria.toLowerCase())) {
      throw new Error(
        `Categoría inválida. Las categorías permitidas son: ${categoriasPermitidas.join(", ")}`
      )
    }

    if (this.categoria.toLowerCase() === "insumos" && !this.fk_registro_stock){
      throw new Error("La categoria insumos debe estar asociada a un registro de stock")
    }

  if (this.descripcion != null && this.descripcion != ""){
   if (
        this.descripcion.trim().length < 5 ||
        this.descripcion.trim().length > 255
        ) {
        throw new Error(
            "La descripción debe tener entre 5 y 255 caracteres."
        )
    }
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