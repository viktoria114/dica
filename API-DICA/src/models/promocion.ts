export class Promocion {
  constructor(
    public id: number | null,
    public nombre: string,
    public tipo: 'MONTO_FIJO' | 'DESCUENTO',
    public precio: number, // interpreta según tipo
    public visibilidad: boolean = true, // activa o no para mostrar en UI
  ) {
    if (!nombre || nombre.trim().length === 0) {
      throw new Error('El nombre no puede estar vacío.');
    }
    if (nombre.length > 100) {
      throw new Error('El nombre no puede superar los 100 caracteres.');
    }

    const tiposPermitidos = ['MONTO_FIJO', 'DESCUENTO'] as const;
    if (!tiposPermitidos.includes(tipo)) {
      throw new Error(
        `El tipo debe ser uno de: ${tiposPermitidos.join(', ')}.`,
      );
    }

    if (isNaN(precio) || precio <= 0) {
      throw new Error('El precio debe ser un número mayor a cero.');
    }

    if (tipo === 'DESCUENTO' && precio > 100) {
      throw new Error('El descuento no puede ser mayor al 100%.');
    }

    if (typeof visibilidad !== 'boolean') {
      throw new Error('La visibilidad debe ser un valor booleano.');
    }
  }
}
