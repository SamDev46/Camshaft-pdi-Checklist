import { Box, Typography } from "@mui/material";
import { Inbox } from "lucide-react";

export const EmptyState = ({ message = "No data available", icon: Icon = Inbox }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 6, color: "text.secondary" }}>
      <Icon size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
      <Typography variant="h6">{message}</Typography>
    </Box>
  );
};
