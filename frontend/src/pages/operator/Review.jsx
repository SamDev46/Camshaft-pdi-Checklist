import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper, CircularProgress, Alert, Divider } from "@mui/material";
import { getChecklist, getInspection, submitInspection } from "../../api/operator";
import { useSnackbar } from "../../context/SnackbarContext";
import { ROUTES } from "../../constants/routes";
import { API_BASE_URL } from "../../constants/api";

export const Review = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checklist, setChecklist] = useState([]);
  const [inspection, setInspection] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const [chk, ins] = await Promise.all([getChecklist(), getInspection(id)]);
        setChecklist(chk);
        setInspection(ins);
      } catch (err) {
        setError("Failed to load review data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleSubmit = async () => {
      setSubmitting(true);
      try {
          await submitInspection(id);
          showSnackbar("Inspection Submitted Successfully!", "success");
          navigate(ROUTES.OPERATOR);
      } catch (err) {
          const errMsg = err.response?.data?.detail || "Submission failed. Please ensure all questions are answered.";
          const match = errMsg.match(/question (\d+)/i);
          if (match) {
              showSnackbar(errMsg, "error");
              navigate(`/operator/inspection/${id}?q=${match[1]}`);
          } else {
              setError(errMsg);
          }
      } finally {
          setSubmitting(false);
      }
  };

  if (loading) return <Box sx={{mt: 10, textAlign:"center"}}><CircularProgress/></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  const isSubmitted = inspection.status === "SUBMITTED";

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>Inspection Review</Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Part: {inspection.part_number} | Serial: {inspection.serial_number} | Status: {inspection.status}
      </Typography>

      <Paper sx={{ mt: 4, p: 3 }}>
        {checklist.map((c, idx) => {
            const r = inspection.responses.find(res => res.checklist_id === c.checklist_id) || {};
            return (
                <Box key={c.checklist_id} sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Typography variant="h6">{idx + 1}. {c.question}</Typography>
                        {!isSubmitted && (
                            <Button size="small" onClick={() => navigate(`/operator/inspection/${id}?q=${c.sequence_no}`)}>
                                Edit
                            </Button>
                        )}
                    </Box>
                    <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
                        <Typography variant="body1" fontWeight="bold" color={r.result === "NOT_OK" ? "error" : "success.main"}>
                            {r.result || "PENDING"}
                        </Typography>
                        {r.description && <Typography variant="body2" color="textSecondary">"{r.description}"</Typography>}
                        {r.photo_id && <img src={`${API_BASE_URL}/operator/photos/${r.photo_id}`} style={{ width: 60, height: 60, borderRadius: 4, objectFit: "cover" }} />}
                    </Box>
                    {idx < checklist.length - 1 && <Divider sx={{ mt: 2 }} />}
                </Box>
            );
        })}
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button variant="outlined" size="large" onClick={() => navigate(ROUTES.OPERATOR)}>Back to Dashboard</Button>
        {!isSubmitted && (
            <Button variant="contained" size="large" color="primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <CircularProgress size={24} /> : "Submit Inspection"}
            </Button>
        )}
      </Box>
    </Box>
  );
};
