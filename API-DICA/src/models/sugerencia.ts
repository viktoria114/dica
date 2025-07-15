export class Sugerencia {
    constructor(
        public id: number | null,
        public descripcion: string,
        public fecha: Date,
        public fk_cliente: number
    ){
        if(!descripcion || descripcion.trim() === ""){
            throw new Error("La descripción no puede estar vacía");
        }

        if (!fecha || !(fecha instanceof Date) || isNaN(fecha.getTime())) {
            throw new Error("Fecha inválida");
        }

        if(!fk_cliente){
            throw new Error("La sugerencia debe tener un cliente asociado");
        }
    }

    //Métodos
}
