
export class RegistroStock {
    constructor(
        public id: number | null,
        public cantidad: number,
        public fk_stock: number,
        public estado: string,
        public modificado: boolean = false,
        public fk_fecha: Date = new Date()
    ){

        if (this.cantidad < 0) {
            throw new Error("La cantidad no puede ser negativa.");
        }

        const estadosPermitidos = ["vencido", "agotado", "disponible"];
        if (!estadosPermitidos.includes(estado.toLowerCase())) {
            throw new Error(`El estado debe ser una de: ${estadosPermitidos.join(", ")}.`);
        }


    }
}