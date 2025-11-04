export class Pago {
    public hora: string;

    constructor(
        public id: number | null,
        public monto: number,
        public metodoDePago: string,
        public comprobantePago: string | null = null,
        public validado: boolean,
        public fk_pedido: number | null,
        public fk_fecha: Date | null = new Date(),
        hora: string | null = null, 

    ){

      //Hora por defecto
    this.hora = hora ?? Pago.obtenerHoraActual();
    
    //Validación del id
    if (id !== null && (!Number.isInteger(id) || id <= 0)) {
      throw new Error("El id debe ser un número entero positivo o null.")
    }

    // Validación de la hora
    const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!horaRegex.test(this.hora)) {
         throw new Error("La hora debe tener el formato HH:MM.");
    }    

    // Validación del campo 'validado'
    if (typeof validado !== "boolean") {
        throw new Error("El campo 'validado' debe ser de tipo booleano (true o false).");
    }

    //Validaciones del monto
    if (typeof monto !== "number" || monto <= 0) {
      throw new Error("El monto debe ser un número mayor que 0.")
    }

    if (monto > 1_000_000) {
      throw new Error("El monto supera el límite permitido.")
    }
    if (!/^\d+(\.\d{1,3})?$/.test(monto.toString())) {
      throw new Error("El monto debe tener máximo tres decimales.")
    }

    //Validación del método
    const metodosPagoPermitidos = ["efectivo", "transferencia"]

    if (!metodosPagoPermitidos.includes(this.metodoDePago.toLowerCase())){
      throw new Error(`Metodo de pago invalido. Los metodos permitidos son: ${metodosPagoPermitidos.join(", ")}`)
    }

    //Validación del comprobante

    if (comprobantePago == ""){
      comprobantePago = null
    }
    if (comprobantePago !== null) {
      if (typeof comprobantePago !== "string" || comprobantePago.trim() === "") {
      throw new Error("El comprobante de pago debe ser una cadena de texto válida o null.");
  }
}

    //Validación del pedido?
    if (fk_pedido !== null && (!Number.isInteger(fk_pedido) || fk_pedido <= 0)) {
      throw new Error("El id del pedido debe ser un número entero positivo o null.")
    }
    //Validaciones de la fecha
    if (!(fk_fecha instanceof Date) || isNaN(fk_fecha.getTime())) {
      throw new Error("La fecha no es válida.");
    }
    const hoy = new Date();
    if (fk_fecha > hoy) {
      throw new Error("La fecha no puede ser futura.");
    }

    }

    private static obtenerHoraActual(): string {
        const ahora = new Date();
        const horas = ahora.getHours().toString().padStart(2, '0');
        const minutos = ahora.getMinutes().toString().padStart(2, '0');
        return `${horas}:${minutos}`;
    }

}