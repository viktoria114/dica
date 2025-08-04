export class Stock {
    constructor(
        public id: number | null,
        public nombre: string,
        public stock_actual: number,
        public vencimiento: number,
        public tipo: string,
        public stock_minimo: number,
        public visibilidad: boolean = true,

    ){

    if (!nombre || nombre.trim() === ''){
        throw new Error("El nombre no puede estar vacío");
    }

    if (!stock_actual || stock_actual < 0){
        throw new Error("El campo de stock actual no puede estar vacío o ser negativo")
    }

    if (!vencimiento || vencimiento < 0){
        throw new Error("El campo de vencimiento no puede estar vacío o ser negativo")
    }

    if (!tipo || tipo.trim() === ''){
        throw new Error("El campo tipo no puede estar vacío");
    }

    if (!stock_minimo || stock_minimo <= 0){
        throw new Error("El campo de stock mínimo no puede estar vacío, ni ser negativo o cero")
    }
       
    }
    //Métodos

    //Para soft delete
      public desactivar(): void {
    if (!this.visibilidad) {
      throw new Error("El producto ya está desactivado");
    }
    this.visibilidad = false;
  }

  public reactivar(): void {
    if (this.visibilidad) {
      throw new Error("El producto ya está activo");
    }
    this.visibilidad = true;
  }
}