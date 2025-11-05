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
  agent_session_id: string | null;
  ultima_compra: string | null;
}

export interface ItemsMenu {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  categoria: string;
  visibilidad: boolean;
  stocks: { id_stock: number; cantidad_necesaria: number }[];
}

export interface Ticket {
  nombre: string;
  cantidad: number;
  subtotal: number;
  precio_unitario: number;
}

export interface ItemsYPromociones {
  id_menu?: number;
  id_promocion?: number;
  cantidad: number;
  nombre: string;
  precio_unitario: number;
  [key: string]: unknown;
}

export interface Pedido {
  pedido_id: number | null;
  fecha: string | null;
  hora: string | null;
  id_cliente: number | null;
  ubicacion: string;
  observaciones: string;
  visibilidad: boolean;
  fk_estado: number;
  items?: ItemsYPromociones[];
  precio_por_items?: number | null;
  precio_por_promociones?: number | null;
  precio_total?: number | null;
  promociones?: ItemsYPromociones[];
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

export interface Promocion {
  id: number;
  nombre: string;
  tipo: "DESCUENTO" | "MONTO_FIJO";
  precio: number;
  visibilidad: boolean;
  items: { id: number; nombre: string; precio: number; cantidad: number }[];
}

export interface Gasto {
  id: number | null;
  monto: number;
  categoria: string;
  metodo_de_pago: string;
  descripcion: string;
  fk_registro_stock: number | null;
  fecha: Date | string;
  stockItems: { id_stock: number; cantidad: number }[];
}

export interface Pago {
  id: number | null;
  monto: number;
  metodo_pago: string;
  comprobante_pago: string;
  validado: boolean;
  fk_pedido: number | null;
  fk_fecha: Date | string;
  hora: string;
}

export interface RegistroStock {
  id: number | null;
  cantidad_inicial: number;
  cantidad_actual: number;
  fk_stock: number;
  estado: string;
  fk_fecha: Date | string;
  visibilidad: boolean;
}
