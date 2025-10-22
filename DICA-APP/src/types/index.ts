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
  telefono: number | null;
  nombre: string;
  dieta: string | null;
  preferencias: string[] | null;
  agentSessionID: string | null;
  ultimaCompra: Date;
}

export interface ItemsMenu {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  categoria: string;
  visibilidad: boolean;
}

export interface Stock {
  id: number | null;
  nombre: string;
  stock_actual: number;
  vencimiento: number;
  tipo: string;
  stock_minimo: number;
  medida: string;
  visibilidad: boolean;
}
