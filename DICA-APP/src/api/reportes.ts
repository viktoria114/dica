import api from "./api";

export const getIngresosDiarios = async (params?: any) => {
  const response = await api.get("/reportes/ingresos-diarios", { params });
  return response.data;
};

export const getVentasDiarias = async (params?: any) => {
  const response = await api.get("/reportes/ventas-diarias", { params });
  return response.data;
};

export const getProductosMasVendidos = async (params?: any) => {
  const response = await api.get("/reportes/productos-mas-vendidos", { params });
  return response.data;
};

export const getRendimientoEmpleados = async (params?: any) => {
  const response = await api.get("/reportes/rendimiento-empleados", { params });
  return response.data;
};

export const getReporteGastos = async (params?: any) => {
  const response = await api.get("/reportes/reporte-gastos", { params });
  return response.data;
};
