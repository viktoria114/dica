import { Box, Typography } from "@mui/material";

type Props = {
 label: string,
 value: number | string,
 color: string
}
export const DashboardCard = ({ label, value, color }: Props) => {
    return ( 
        <Box textAlign="center" display="flex" flexDirection="column" alignItems="center">
    <Typography fontWeight="500">{label}</Typography>
    <Box
      sx={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        bgcolor: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mt: 1,
      }}
    >
      <Typography variant="h6" color="white" fontWeight="700">
        {value}
      </Typography>
    </Box>
  </Box>
    );
}