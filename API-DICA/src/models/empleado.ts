export class Empleado {
  constructor(
    public  DNI: number,
    public   username: string,
    public nombre_completo: string,
    public correo: string,
    public telefono: number,
    public password: string,
    public rol: string,
    public agentSessionID: string | null,
    public visibilidad: boolean = true,
  ) {
    if (!username || username.trim() === "") {
      throw new Error("Nombre de usuario no puede estar vacío");
    }

    if (!nombre_completo || nombre_completo.trim() === "") {
      throw new Error("Nombre completo no puede estar vacío");
    }

    if (rol !== "agente" && rol !== "admin" && rol !== "cajero" && rol !== "repartidor") {
      throw new Error("Nombre de rol inválido");
    }
  }

  // Método para cambiar la contraseña
  public cambiarPassword(nuevaPassword: string): void {
    if (nuevaPassword === this.password) {
      throw new Error("La nueva contraseña no puede ser igual a la actual.");
    }

    if (nuevaPassword.length < 8) {
      throw new Error("La contraseña debe tener al menos 8 caracteres.");
    }

    const contieneLetra = /[a-zA-Z]/.test(nuevaPassword);
    const contieneNumero = /\d/.test(nuevaPassword);

    if (!contieneLetra || !contieneNumero) {
      throw new Error("La contraseña debe contener al menos una letra y un número.");
    }

    this.password = nuevaPassword;
  }

  // Método para verificar la contraseña actual (opcional si necesitas autenticación)
  public verificarPassword(passwordIngresada: string): boolean {
    return this.password === passwordIngresada;
  }

  //para soft delete
  public desactivar(): void {
    if (!this.visibilidad) {
      throw new Error("El empleado ya está desactivado");
    }
    this.visibilidad = false;
  }

  public reactivar(): void {
    if (this.visibilidad) {
      throw new Error("El empleado ya está activo");
    }
    this.visibilidad = true;
  }
}