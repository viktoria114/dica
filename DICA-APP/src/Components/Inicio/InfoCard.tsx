import { List, Paper, Typography, CircularProgress, Box } from "@mui/material";

type Props = {
  title: string;
  items: string[];
  isActive?: boolean;
  isToggling?: boolean;
};

export const InfoCard = ({ title, items, isActive, isToggling }: Props) => {
  return (
    <Paper
      elevation={4}
      sx={{
        height: 320,
        width: 320,
        borderRadius: 12,
        bgcolor: isActive ? "#8B1D1D" : "rgba(0, 0, 0, 0.5)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
    >
      {isToggling && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderRadius: 12,
          }}
        >
          <CircularProgress color="inherit" />
        </Box>
      )}
      <Typography variant="h4" fontWeight="500" color="white" pt={8}>
        {title}
      </Typography>
      <List sx={{ p: 4, color: "white" }}>
        {items.map((txt: string, i: number) => (
          <Typography key={i}>● {txt}</Typography>
        ))}
      </List>
      {isActive !== undefined && (
        <Typography variant="body2" color="white" sx={{ mt: 2 }}>
          {isActive ? "Agente Activo" : "Agente Inactivo"}
        </Typography>
      )}
    </Paper>
  );
};