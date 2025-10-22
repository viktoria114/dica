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
agent_session_id: string | null,
ultima_compra: string | null,
}

export interface ItemsMenu {
 id: number,
  nombre: string;
  precio: number,
  descripcion: string,
  categoria: string,
  visibilidad: boolean,
  stocks: { id_stock: number; cantidad_necesaria: number }[];
}

export interface Pedido {
id: number | null,
id_fecha: Date | null,
hora: string | null,
id_cliente: number | null,
 ubicacion: string,
 observacion: string,
 visibilidad: boolean,
 id_estado: number,
}
