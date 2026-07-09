import { Typography, Box } from "@mui/material";
import { BaseButton } from "../../components/common/BaseButton";
import { useNavigate } from "react-router-dom";

export const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ textAlign: "center", mt: 10 }}>
      <Typography variant="h3" gutterBottom>403 - Unauthorized</Typography>
      <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
        You do not have permission to access this page.
      </Typography>
      <BaseButton variant="contained" onClick={() => navigate(-1)}>Go Back</BaseButton>
    </Box>
  );
};
