import { useEffect, useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getEmpleados,
  getEmpleadosInvisibles,
} from "../store/slices/empleadosSlice";


export const useEmpleados = () => {
  const dispatch = useAppDispatch();
  const { data: empleados, loading, error } = useAppSelector(
    (state) => state.empleados
  );

  // Estado local para manejar si estamos en modo papelera
  const [modoPapelera, setModoPapelera] = useState(false);

  // Cargar empleados visibles (usa Redux thunk)
  const cargarEmpleados = useCallback(() => {
    dispatch(getEmpleados());
  }, [dispatch]);

  // Cargar empleados invisibles (usa Redux thunk también)
  const cargarInvisibles = useCallback(() => {
    dispatch(getEmpleadosInvisibles());
  }, [dispatch]);

  // Alternar entre visibles/invisibles
  const toggleInvisibles = useCallback(() => {
    if (!modoPapelera) {
      cargarInvisibles();
      setModoPapelera(true);
    } else {
      cargarEmpleados();
      setModoPapelera(false);
    }
  }, [modoPapelera, cargarEmpleados, cargarInvisibles]);

  // Cargar empleados por defecto al montar
  useEffect(() => {
    cargarEmpleados();
  }, [cargarEmpleados]);

  return {
    empleados,
    modoPapelera,
    toggleInvisibles,
    loading,
    error,
    refetch: cargarEmpleados,
  };
};

