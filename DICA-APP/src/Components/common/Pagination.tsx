import React from "react";
import { TablePagination } from "@mui/material";

type Props = {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  rowsPerPage: number;
  setRowsPerPage: React.Dispatch<React.SetStateAction<number>>;
  count: number;
  /** Opcional: personalizar opciones de filas por página */
  rowsPerPageOptions?: number[];
};

export const Pagination: React.FC<Props> = ({
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  count,
  rowsPerPageOptions,
}) => {
  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      onPageChange={handleChangePage}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      rowsPerPageOptions={rowsPerPageOptions}
      labelRowsPerPage="Filas por página"
    />
  );
};
