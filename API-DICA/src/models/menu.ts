export class Menu{
    constructor(
        public id: number | null,
        public nombre: string,
        public precio: number,
        public descripcion: string,
        public categoria: string,
        public visibilidad: boolean = true
    ){

        if (!nombre || nombre.trim().length === 0) {
            throw new Error("El nombre no puede estar vacío.");
        }
        if (nombre.length > 100) {
            throw new Error("El nombre no puede superar los 100 caracteres.");
        }

        if (isNaN(precio) || precio <= 0) {
            throw new Error("El precio debe ser un número mayor a cero.");
        }

        if (!descripcion || descripcion.trim().length === 0) {
            throw new Error("La descripción no puede estar vacía.");
        }
        if (descripcion.length > 500) {
            throw new Error("La descripción no puede superar los 500 caracteres.");
        }

        const categoriasPermitidas = ["pizza", "sanguche", "postre", "bebida"];
        if (!categoriasPermitidas.includes(categoria.toLowerCase())) {
            throw new Error(`La categoría debe ser una de: ${categoriasPermitidas.join(", ")}.`);
        }

        if (typeof visibilidad !== "boolean") {
            throw new Error("La visibilidad debe ser un valor booleano.");
        }
    }
}