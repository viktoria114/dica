// models/cliente.ts

export class Cliente {
  constructor(
    public id: number | null,
    public nombre: string,
    public telefono: string,
    public preferencia: string,
    public agentSessionID: string | null,
    public ultimaCompra: Date = new Date(),
    public visibilidad: boolean = true,
  ) {

    if (!nombre || nombre.trim() === '') {
      throw new Error("Nombre no puede estar vacío");
    }

    if (!telefono || !/^\d{6,15}$/.test(telefono)) {
      throw new Error("Teléfono inválido (debe contener solo números, mínimo 6 dígitos)");
    }

    if (!preferencia || preferencia.trim() === '') {
      throw new Error("Preferencia no puede estar vacía");
    }
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