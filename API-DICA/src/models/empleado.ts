export class Empleado {
  constructor(
    public id: number,
    public nombreUsuario: string,
    public nombreCompleto: string,
    public email: string,
    public telefono: string,
    public password: string,
    public rol: string,
  ) {
    if (!nombreUsuario || nombreUsuario.trim() === "") {
      throw new Error("Nombre de usuario no puede estar vacío");
    }

    if (!nombreCompleto || nombreCompleto.trim() === "") {
      throw new Error("Nombre completo no puede estar vacío");
    }

    if (rol != "admin" || "cajero" || "repartidor"){
        throw new Error("Nombre de rol invalido")
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
}