import { List, Paper, Typography } from "@mui/material";

type Props = {
 title: string,
 items: string []
}
export const InfoCard = ({ title, items }: Props) => {
    return ( 
       <Paper
    elevation={4}
    sx={{
      height: 320,
      width: 320,
      borderRadius: 12,
      bgcolor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    <Typography variant="h4" fontWeight="500" color="white" pt={8}>
      {title}
    </Typography>
    <List sx={{ p: 4, color: "white" }}>
      {items.map((txt: string, i: number) => (
        <Typography key={i}>● {txt}</Typography>
      ))}
    </List>
  </Paper>
    );
}