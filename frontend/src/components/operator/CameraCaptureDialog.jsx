import { useRef, useCallback, useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Alert, IconButton } from "@mui/material";
import Webcam from "react-webcam";
import { SwitchCamera } from "lucide-react";

export const CameraCaptureDialog = ({ open, onClose, onAccept }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [error, setError] = useState("");
  const [facingMode, setFacingMode] = useState("environment");

  // Clean up states when dialog opens/closes
  useEffect(() => {
    if (open) {
      setImgSrc(null);
      setError("");
    }
  }, [open]);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setImgSrc(imageSrc);
      } else {
        setError("Failed to capture image. Please try again.");
      }
    }
  }, [webcamRef]);

  const handleAccept = async () => {
    if (!imgSrc) return;
    
    try {
      // Convert Base64 string to a Blob
      const res = await fetch(imgSrc);
      const blob = await res.blob();
      
      // Convert Blob to File object
      const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
      
      // Release Base64 memory immediately from state
      setImgSrc(null); 
      
      // Pass to parent
      onAccept(file);
    } catch (err) {
      setError("Failed to process image.");
    }
  };

  const handleUserMediaError = (err) => {
    setError("Camera permission denied or camera not found on this device.");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Capture Photo
        {!imgSrc && (
           <IconButton onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')} title="Flip Camera">
             <SwitchCamera size={20} />
           </IconButton>
        )}
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {error && <Alert severity="error" sx={{ mb: 2, width: "100%" }}>{error}</Alert>}
        
        <Box sx={{ width: "100%", borderRadius: 2, overflow: "hidden", bgcolor: "#000", position: "relative" }}>
          {imgSrc ? (
            <img src={imgSrc} alt="Preview" style={{ width: "100%", maxHeight: 400, objectFit: "contain", display: "block" }} />
          ) : (
            open && (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode }}
                onUserMediaError={handleUserMediaError}
                style={{ width: "100%", maxHeight: 400, objectFit: "contain", display: "block" }}
              />
            )
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: "center", pb: 3, gap: 2 }}>
        {imgSrc ? (
          <>
            <Button variant="outlined" size="large" onClick={() => setImgSrc(null)} sx={{ flex: 1, ml: 2 }}>
              Retake
            </Button>
            <Button variant="contained" size="large" onClick={handleAccept} sx={{ flex: 1, mr: 2 }}>
              Accept
            </Button>
          </>
        ) : (
          <>
            <Button variant="outlined" size="large" onClick={onClose} sx={{ flex: 1, ml: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" size="large" onClick={capture} disabled={!!error} sx={{ flex: 1, mr: 2 }}>
              Capture
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
