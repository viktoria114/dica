export class Stock {
  constructor(
    public id: number | null,
    public nombre: string,
    public stock_actual: number = 0,
    public vencimiento: number = 0,
    public tipo: string,
    public stock_minimo: number = 0,
    public medida: string,
    public visibilidad: boolean = true,
  ) {
    if (!nombre || nombre.trim() === '') {
      throw new Error('El nombre no puede estar vacío');
    }

    if (vencimiento === null || vencimiento === undefined || vencimiento < 0) {
      throw new Error(
        'El campo de vencimiento no puede estar vacío o ser negativo',
      );
    }

    const tiposPermitidos = ['PERECEDERO', 'NO PERECEDERO'];
    if (!tiposPermitidos.includes(tipo.toUpperCase())) {
      throw new Error(
        `El tipo debe ser uno de: ${tiposPermitidos.join(', ')}.`,
      );
    }

    if (
      stock_minimo === null ||
      stock_minimo === undefined ||
      stock_minimo < 0
    ) {
      throw new Error(
        'El campo de stock mínimo no puede estar vacío, ni ser negativo',
      );
    }

    const medidasPermitidas = ['G', 'KG', 'L', 'ML', 'U'];
    if (!medidasPermitidas.includes(medida.toUpperCase())) {
      throw new Error(
        `La medida debe ser una de: ${medidasPermitidas.join(', ')}.`,
      );
    }
  }
  //Métodos

  //Para soft delete
  public desactivar(): void {
    if (!this.visibilidad) {
      throw new Error('El producto ya está desactivado');
    }
    this.visibilidad = false;
  }

  public reactivar(): void {
    if (this.visibilidad) {
      throw new Error('El producto ya está activo');
    }
    this.visibilidad = true;
  }
}
