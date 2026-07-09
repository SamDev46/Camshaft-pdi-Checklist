import { Box, Typography, Button } from "@mui/material";
import { AlertTriangle } from "lucide-react";

export const ErrorState = ({ message = "An error occurred", onRetry }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 6, color: "error.main" }}>
      <AlertTriangle size={48} style={{ marginBottom: 16 }} />
      <Typography variant="h6" gutterBottom>{message}</Typography>
      {onRetry && <Button variant="outlined" color="error" onClick={onRetry} sx={{ mt: 2 }}>Retry</Button>}
    </Box>
  );
};
