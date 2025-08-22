// models/cliente.ts

export class Cliente {
  constructor(
    public telefono: number | null,
    public nombre: string,
    public dieta: string | null,
    public preferencias: string[] | null,
    public agentSessionID: string | null,
    public ultimaCompra: Date = new Date(),
    public visibilidad: boolean = true,
  ) {

    if (!nombre || nombre.trim() === '') {
      throw new Error("Nombre no puede estar vacío");
    }

    if (!telefono|| telefono <= 0) {
      throw new Error("El teléfono debe ser un número positivo.");
    }

    const longitud = telefono.toString().length;

    if (longitud < 10 || longitud > 15) {
      throw new Error("El teléfono debe tener entre 10 y 15 dígitos.");
    }

    const dietasPermitidas = ["vegano", "vegetariano", "neutra", "sin asignar"]

    if (dieta != null){
      if (dieta.trim() === '') {
        throw new Error("La dieta no puede estar vacía");
      }

      if (!dietasPermitidas.includes(dieta.toLowerCase())){
        throw new Error(`dieta invalida. Las dietas permitidas son: ${dietasPermitidas.join(", ")}`)
      }
    }

    if (preferencias != null){
      // Eliminar espacios y duplicados
      const normalizadas = [...new Set(preferencias.map(p => p.trim().toLowerCase()))];

      if (normalizadas.length > 5) {
          throw new Error("No se permiten más de 5 preferencias.");
      }

      this.preferencias = normalizadas
    }

    }

  public agregarPreferencia(preferencia: string): void {
    if (!preferencia || preferencia.trim() === "") {
        throw new Error("La preferencia no puede ser nula ni vacía.");
    }

    const prefNormalizada = preferencia.trim().toLowerCase();

    // Si es null, inicializamos el array
    if (!this.preferencias) {
        this.preferencias = [];
    }

    if (this.preferencias.includes(prefNormalizada)) {
        throw new Error(`La preferencia '${prefNormalizada}' ya existe.`);
    }

    if (this.preferencias.length >= 5) {
        throw new Error("No se pueden agregar más de 5 preferencias.");
    }

    this.preferencias.push(prefNormalizada);
  }
   //para soft delete
  public desactivar(): void {
    if (!this.visibilidad) {
      throw new Error("El cliente ya está desactivado");
    }
    this.visibilidad = false;
  }

  public reactivar(): void {
    if (this.visibilidad) {
      throw new Error("El cliente ya está activo");
    }
    this.visibilidad = true;
  }
}