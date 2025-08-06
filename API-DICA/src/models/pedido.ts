export class Pedido {
    public hora: string;
    public estado: string;

    constructor(
        public id: number | null,
        public fk_fecha: Date = new Date(),
        hora: string | null = null,
        estado: string | null = null,
        public fk_empleado: number | null,
        public fk_cliente: number | null,
        public ubicacion: string,
        public observacion: string,
    ) {
        // Hora por defecto
        this.hora = hora ?? Pedido.obtenerHoraActual();

        // Estado por defecto
        this.estado = estado ?? "pendiente";

        // Validación de la hora
        const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!horaRegex.test(this.hora)) {
            throw new Error("La hora debe tener el formato HH:MM.");
        }

        // Validación de estado
        const estadosPermitidos = ["pendiente", "en preparación", "listo", "entregado", "cancelado"];
        if (!estadosPermitidos.includes(this.estado.toLowerCase())) {
            throw new Error(`El estado debe ser uno de: ${estadosPermitidos.join(", ")}.`);
        }

        // Validación de cliente
        if (fk_cliente === null || isNaN(fk_cliente)) {
            throw new Error("Debe asignarse un cliente válido al pedido.");
        }

        // Validación de ubicación
        if (!ubicacion || ubicacion.trim().length === 0) {
            throw new Error("La ubicación no puede estar vacía.");
        }
        if (ubicacion.length > 200) {
            throw new Error("La ubicación no puede superar los 200 caracteres.");
        }

        // Validación de observación
        if (observacion && observacion.length > 500) {
            throw new Error("La observación no puede superar los 500 caracteres.");
        }
    }

    private static obtenerHoraActual(): string {
        const ahora = new Date();
        const horas = ahora.getHours().toString().padStart(2, '0');
        const minutos = ahora.getMinutes().toString().padStart(2, '0');
        return `${horas}:${minutos}`;
    }
}
