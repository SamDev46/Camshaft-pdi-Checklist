import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, CircularProgress, LinearProgress, Paper, TextField } from "@mui/material";
import { Camera, ArrowRight, ArrowLeft } from "lucide-react";
import { getInspection, getChecklist, saveResponse, uploadPhoto, deletePhoto } from "../../api/operator";
import { useSnackbar } from "../../context/SnackbarContext";
import { API_BASE_URL } from "../../constants/api";

export const Inspection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [inspection, setInspection] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [resSaving, setResSaving] = useState(false);
  const [photoSaving, setPhotoSaving] = useState(false);
  const fileInputRef = useRef(null);
  const descRef = useRef("");

  const load = async () => {
    try {
      const [ins, chk] = await Promise.all([getInspection(id), getChecklist()]);
      setInspection(ins);
      setQuestions(chk);
    } catch (e) {
      showSnackbar("Failed to load inspection.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <Box sx={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center" }}><CircularProgress /></Box>;
  if (!inspection) return <Box sx={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center" }}><Typography>Inspection not found</Typography></Box>;

  if (questions.length === 0) return <Box sx={{ p: 4 }}><Typography>No questions found.</Typography></Box>;

  const q = questions[currentIdx];
  const response = inspection.responses.find(r => r.checklist_id === q.checklist_id) || {};

  const handleResult = async (resValue) => {
    setResSaving(true);
    try {
      const desc = descRef.current || response.description || "";
      await saveResponse({ inspection_id: parseInt(id), checklist_id: q.checklist_id, result: resValue, description: desc });
      await load();
    } catch (e) {
      showSnackbar("Failed to save result.", "error");
    } finally {
      setResSaving(false);
    }
  };

  const handleDescChange = async (e) => {
    const val = e.target.value;
    descRef.current = val;
    try {
      await saveResponse({ inspection_id: parseInt(id), checklist_id: q.checklist_id, result: response.result || "", description: val });
      await load();
    } catch (err) {
      /* ignore temp err */
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      showSnackbar("Only JPG/JPEG/PNG files are allowed.", "error");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showSnackbar("File too large. Maximum size is 10MB.", "error");
      e.target.value = "";
      return;
    }

    setPhotoSaving(true);
    try {
      await uploadPhoto(id, q.checklist_id, file);
      await load();
    } catch (err) {
      showSnackbar("Failed to upload photo.", "error");
    } finally {
      setPhotoSaving(false);
      e.target.value = "";
    }
  };

  const handlePhotoDelete = async () => {
    if (!response.photo_id) return;
    setPhotoSaving(true);
    try {
      await deletePhoto(response.photo_id);
      await load();
    } catch (err) {
      showSnackbar("Failed to delete photo.", "error");
    } finally {
      setPhotoSaving(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) setCurrentIdx(currentIdx + 1);
    else navigate(`/operator/review/${id}`);
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f5f5f5" }}>
      {/* Top Bar */}
      <Box sx={{ bgcolor: "white", p: 2, boxShadow: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" fontWeight="bold">Part: {inspection.part_number}</Typography>
        <Typography variant="subtitle1" color="text.secondary">Serial: {inspection.serial_number}</Typography>
      </Box>

      {/* Progress */}
      <LinearProgress variant="determinate" value={progress} sx={{ height: 8 }} />
      <Typography variant="caption" sx={{ p: 1, textAlign: "center", color: "text.secondary" }}>
        Question {currentIdx + 1} of {questions.length}
      </Typography>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, p: 3, display: "flex", flexDirection: "column", maxWidth: 800, mx: "auto", width: "100%", gap: 3, overflowY: "auto" }}>
        <Paper sx={{ p: 4, display: "flex", flexDirection: "column", gap: 4, flexGrow: 1 }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 500 }}>{q.question}</Typography>
          
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button 
                variant={response.result === "OK" ? "contained" : "outlined"} 
                color="success" 
                sx={{ flex: 1, py: 3, fontSize: "1.2rem" }} 
                onClick={() => handleResult("OK")} 
                disabled={resSaving}
            >
                OK
            </Button>
            <Button 
                variant={response.result === "NOT_OK" ? "contained" : "outlined"} 
                color="error" 
                sx={{ flex: 1, py: 3, fontSize: "1.2rem" }} 
                onClick={() => handleResult("NOT_OK")} 
                disabled={resSaving}
            >
                NOT OK
            </Button>
          </Box>

          <TextField 
            label={response.result === "NOT_OK" ? "Description (Required for NOT OK)" : "Additional Notes (Optional)"} 
            required={response.result === "NOT_OK"}
            multiline 
            rows={3} 
            value={response.description || ""} 
            onBlur={handleDescChange} 
            onChange={(e) => {
              descRef.current = e.target.value;
              const newInspection = {...inspection};
              const rIdx = newInspection.responses.findIndex(r => r.checklist_id === q.checklist_id);
              if (rIdx >= 0) newInspection.responses[rIdx].description = e.target.value;
              else newInspection.responses.push({ checklist_id: q.checklist_id, description: e.target.value });
              setInspection(newInspection);
            }} 
          />

          <Box sx={{ mt: "auto", pt: 2, borderTop: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
                {photoSaving ? <CircularProgress size={24} /> : (
                    response.photo_id ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <img src={`${API_BASE_URL}/operator/photos/${response.photo_id}`} alt="Attached" style={{ height: 60, width: 60, objectFit: "cover", borderRadius: 8 }} />
                            <Button size="small" color="error" onClick={handlePhotoDelete}>Remove Photo</Button>
                        </Box>
                    ) : (
                        <Button variant="outlined" startIcon={<Camera />} onClick={() => fileInputRef.current.click()}>
                            Add Photo {q.photo_required === 1 && "*"}
                        </Button>
                    )
                )}
                <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handlePhotoUpload} />
            </Box>
          </Box>
        </Paper>

        {/* Footer Navigation */}
        <Box sx={{ display: "flex", gap: 2, pt: 1 }}>
          <Button variant="outlined" size="large" onClick={handlePrev} disabled={currentIdx === 0} startIcon={<ArrowLeft />} sx={{ flex: 1, py: 2 }}>
            Previous
          </Button>
          <Button variant="contained" size="large" onClick={handleNext} disabled={!response.result || (q.photo_required === 1 && !response.photo_id) || (response.result === "NOT_OK" && !response.description)} endIcon={<ArrowRight />} sx={{ flex: 1, py: 2 }}>
            {currentIdx === questions.length - 1 ? "Review" : "Next"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
