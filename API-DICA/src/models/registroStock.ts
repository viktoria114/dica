
export class RegistroStock {
    constructor(
        public id: number | null,
        public cantidad: number,
        public fk_stock: number,
        public fk_fecha: Date = new Date()
    ){

        if (this.cantidad < 0) {
            throw new Error("La cantidad no puede ser negativa.");
        }

    }
}