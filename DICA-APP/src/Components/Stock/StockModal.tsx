// src/Components/Stock/StockModal.tsx - CÓDIGO FINAL

import * as React from "react";
// Importamos Box para aplicar los estilos de centrado y separación
import { Box } from "@mui/material";
import { ModalBase } from "../common/ModalBase";
import { RegistroStockManager } from "./RegistroStockManager";
import type { Stock } from "../../types";
import { type FieldConfig } from "../common/FormBase";

interface ModalStockProps {
  open: boolean;
  handleClose: () => void;
  editValues: Stock;
  editFields: FieldConfig<Stock>[];
  formErrorsEdit: Partial<Record<keyof Stock, string>>;
  handleChangeEdit: (field: keyof Stock, value: string) => void;
  handleGuardarEdit: (values: Stock) => void;
  isSavingEdit: boolean;
  modoPapelera: boolean;
  borrar: (id: number) => void;
  restaurar: (id: number) => void;
  isDeleting: boolean;
  isRestoring: boolean;
}

export const ModalStock = ({
  open,
  handleClose,
  editValues,
  editFields,
  formErrorsEdit,
  handleChangeEdit,
  handleGuardarEdit,
  isSavingEdit,
  modoPapelera,
  borrar,
  restaurar,
  isDeleting,
  isRestoring,
}: ModalStockProps) => {
  const registroStockComponente = React.useMemo(() => {
    if (editValues.id && !modoPapelera) {
      return (
        <Box
          sx={{
            marginTop: "30px",
            paddingTop: "10px",
            display: "flex",
            justifyContent: "center", // Centrado horizontal
          }}
        >
          <RegistroStockManager
            stockId={editValues.id}
            stockNombre={editValues.nombre}
          />
        </Box>
      );
    }
    return null;
  }, [editValues.id, editValues.nombre, modoPapelera]);

  const displayFields = [
    { label: "Nombre", value: editValues.nombre },
    {
      label: "Stock Actual",
      value: `${editValues.stock_actual} ${editValues.medida}`,
    },
    ...(editValues.tipo === "PERECEDERO"
      ? [
          {
            label: "Días para vencimiento",
            value: editValues.vencimiento,
          },
        ]
      : []),
    { label: "Tipo", value: editValues.tipo },
    {
      label: "Stock Mínimo",
      value: `${editValues.stock_minimo} ${editValues.medida}`,
    },
  ];

  return (
    <ModalBase<Stock>
      open={open}
      entityName="Stock"
      modo="editar"
      fields={editFields}
      values={editValues}
      formErrors={formErrorsEdit}
      handleChange={handleChangeEdit}
      handleGuardar={handleGuardarEdit}
      handleClose={handleClose}
      isSaving={isSavingEdit}
      idField="id"
      modoPapelera={modoPapelera}
      borrar={(id) => borrar(Number(id))}
      restaurar={(id) => restaurar(Number(id))}
      isDeleting={isDeleting}
      isRestoring={isRestoring}
      displayFields={displayFields}
      //USAMOS detailsChildren para inyectar el componente con estilos
      detailsChildren={registroStockComponente}
      width={600}
    />
  );
};
