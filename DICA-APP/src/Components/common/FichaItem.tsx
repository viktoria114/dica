import { Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { useState } from "react";

interface Campo<T> {
  label: string;
  value: (item: T) => string | undefined;
}

interface FichaItemProps<T> {
  item: T;
  titulo: (item: T) => string;
  campos: Campo<T>[];
  ModalComponent: React.ComponentType<{
    open: boolean;
    handleClose: () => void;
    item: T;
    modoPapelera?: boolean;
  }>;
  modoPapelera?: boolean;
}

export function FichaItem<T>({
  item,
  titulo,
  campos,
  ModalComponent,
  modoPapelera,
}: FichaItemProps<T>) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Card>
        <CardActionArea onClick={handleOpen}>
          <CardContent>
            <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
              {titulo(item)}
            </Typography>
            {campos.map((campo, i) => {
              const value = campo.value(item);
              return value ? (
                <Typography
                  key={i}
                  variant="body2"
                  sx={{ color: "primary.main", fontWeight: 500 }}
                >
                  {campo.label}: {value}
                </Typography>
              ) : null;
            })}
          </CardContent>
        </CardActionArea>
      </Card>

      <ModalComponent
        open={open}
        handleClose={handleClose}
        item={item}
        modoPapelera={modoPapelera}
      />
    </>
  );
}
