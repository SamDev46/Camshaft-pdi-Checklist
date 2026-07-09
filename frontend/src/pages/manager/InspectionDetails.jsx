import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper, CircularProgress, Alert, Divider, Dialog } from "@mui/material";
import { getInspectionDetails, getManagerChecklist } from "../../api/manager";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../constants/api";

export const InspectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inspection, setInspection] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    Promise.all([getInspectionDetails(id), getManagerChecklist()])
      .then(([ins, chk]) => {
        setInspection(ins);
        setChecklist(chk);
      })
      .catch(() => setError("Failed to load details"))
      .finally(() => setLoading(false));
  }, [id]);

  const openPhoto = (pid) => {
    setPhotoUrl(`${API_BASE_URL}/operator/photos/${pid}`);
    setPhotoOpen(true);
  };

  if (loading) return <Box sx={{mt:10, textAlign:"center"}}><CircularProgress/></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4">Inspection Details</Typography>
        {inspection.status === "IN_PROGRESS" && user?.role === "MANAGER" && (
            <Button variant="contained" color="warning" onClick={() => navigate(`/operator/inspection/${id}`)}>
                Switch to Operator Mode
            </Button>
        )}
      </Box>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1">Part: {inspection.part_number}</Typography>
        <Typography variant="subtitle1">Serial: {inspection.serial_number}</Typography>
        <Typography variant="subtitle1">Status: {inspection.status}</Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        {checklist.map((c, idx) => {
            const r = inspection.responses.find(res => res.checklist_id === c.checklist_id) || {};
            return (
                <Box key={c.checklist_id} sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>{idx + 1}. {c.question}</Typography>
                    <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
                        <Typography variant="body1" fontWeight="bold" color={r.result === "NOT_OK" ? "error" : "success.main"}>
                            {r.result || "PENDING"}
                        </Typography>
                        {r.description && <Typography variant="body2" color="textSecondary">"{r.description}"</Typography>}
                        {r.photo_id && (
                            <img 
                                src={`${API_BASE_URL}/operator/photos/${r.photo_id}`} 
                                style={{ width: 60, height: 60, borderRadius: 4, objectFit: "cover", cursor: "pointer" }} 
                                onClick={() => openPhoto(r.photo_id)}
                            />
                        )}
                    </Box>
                    {idx < checklist.length - 1 && <Divider sx={{ mt: 2 }} />}
                </Box>
            );
        })}
      </Paper>

      <Dialog open={photoOpen} onClose={() => setPhotoOpen(false)} maxWidth="md" fullWidth>
        <img src={photoUrl} style={{ width: "100%", height: "auto" }} />
      </Dialog>
    </Box>
  );
};
