
export class RegistroStock {
    constructor(
        public id: number | null,
        public cantidadInicial: number,
        public cantidadActual: number,
        public fk_stock: number,
        public estado: string,
        public fk_fecha: Date = new Date(),
        public visibilidad: boolean = true
    ){

        if (this.cantidadInicial < 0) {
            throw new Error("La cantidad inicial no puede ser negativa.");
        }
        if (this.cantidadActual < 0) {
            throw new Error("La cantidad actual no puede ser negativa.");
        }
        const estadosPermitidos = ["vencido", "agotado", "disponible"];
        if (!estadosPermitidos.includes(estado.toLowerCase())) {
            throw new Error(`El estado debe ser una de: ${estadosPermitidos.join(", ")}.`);
        }


    }
}