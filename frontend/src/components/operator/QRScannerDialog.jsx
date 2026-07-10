import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Alert } from "@mui/material";
import { useZxing } from "react-zxing";
import { SwitchCamera } from "lucide-react";

export const QRScannerDialog = ({ open, onClose, onScan }) => {
  const [error, setError] = useState("");
  const [facingMode, setFacingMode] = useState("environment");

  const { ref } = useZxing({
    constraints: { video: { facingMode } },
    onDecodeResult(result) {
      const text = result.getText();
      const parts = text.split(";");
      if (parts.length === 3 && parts.every(p => p.trim() !== "")) {
        onScan(text);
      } else {
        setError("Invalid QR Format. Must be Part;Serial;Vendor");
      }
    },
    onError(err) {
      if (err.name === "NotFoundException") return;
      
      if (err.name === "NotAllowedError") {
        setError("Camera permission denied. Please allow camera access.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else if (err.message && err.message.includes("Permission denied")) {
        setError("Camera permission denied.");
      }
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Scan QR Code</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ width: "100%", borderRadius: 2, overflow: "hidden", bgcolor: "#000", display: "flex", justifyContent: "center" }}>
          {/* Key ensures the hook is refreshed if constraints change */}
          <video key={facingMode} ref={ref} style={{ width: "100%", maxHeight: 400, objectFit: "cover" }} />
        </Box>
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
          Align the QR code within the camera view.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Button onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')} startIcon={<SwitchCamera size={18}/>}>
          Flip Camera
        </Button>
        <Button onClick={onClose} size="large">Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
