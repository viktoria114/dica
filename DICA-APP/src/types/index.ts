export interface Empleado {
  dni: string;
  username: string;
  nombre_completo: string;
  correo: string | null;
  telefono: string | null;
  password: string;
  rol: string;
}

export interface Cliente {
telefono: number | null,
nombre: string,
dieta: string | null,
preferencias: string[] | null,
agentSessionID: string | null,
ultimaCompra: Date,
}