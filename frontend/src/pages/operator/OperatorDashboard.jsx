import { useState } from "react";
import { Typography, Box, CircularProgress, Paper, TextField, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { startInspection } from "../../api/operator";
import { ROUTES } from "../../constants/routes";

import { useSnackbar } from "../../context/SnackbarContext";

export const OperatorDashboard = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [qrText, setQrText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Quick Frontend QR Validation
    const parts = qrText.split(";");
    if (parts.length !== 3 || parts.some(p => !p.trim())) {
        showSnackbar("Invalid QR format. Must be PART_NUMBER;SERIAL_NUMBER;VENDOR_CODE", "error");
        return;
    }

    setLoading(true);
    try {
      const res = await startInspection(qrText);
      navigate(`/operator/inspection/${res.inspection_id}`);
    } catch (err) {
      showSnackbar(err.response?.data?.detail || "Failed to start inspection.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 10 }}>
      <Paper sx={{ p: 4, display: "flex", flexDirection: "column", gap: 3 }}>
        <Typography variant="h5" align="center">Scan Part QR Code</Typography>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <TextField
            label="Scan or Paste QR"
            placeholder="P3979506;SB26006009;VTCJSR"
            value={qrText}
            onChange={(e) => setQrText(e.target.value)}
            required
            autoFocus
            fullWidth
          />
          <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.5 }}>
            {loading ? <CircularProgress size={24} /> : "Start Inspection"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};
