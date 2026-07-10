import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Box, Typography, Button, CircularProgress, LinearProgress, TextField } from "@mui/material";
import { Camera, ArrowRight, ArrowLeft, X, Upload } from "lucide-react";
import { getInspection, getChecklist, saveResponse, uploadPhoto, deletePhoto } from "../../api/operator";
import { useSnackbar } from "../../context/SnackbarContext";
import { API_BASE_URL } from "../../constants/api";
import { CameraCaptureDialog } from "../../components/operator/CameraCaptureDialog";

export const Inspection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [inspection, setInspection] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [resSaving, setResSaving] = useState(false);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef(null);

  const load = async () => {
    try {
      const [ins, chk] = await Promise.all([getInspection(id), getChecklist()]);
      setInspection(ins);
      setQuestions(chk);
      
      // Only set the initial index once on first load
      if (!hasInitialized && chk.length > 0) {
        let targetIdx = Math.max(0, (ins.current_step || 1) - 1);
        const qParam = searchParams.get("q");
        if (qParam && !isNaN(parseInt(qParam))) {
            targetIdx = parseInt(qParam) - 1;
        }
        setCurrentIdx(Math.min(Math.max(0, targetIdx), chk.length - 1));
        setHasInitialized(true);
      }
    } catch (e) {
      showSnackbar("Failed to load inspection.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <Box sx={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center" }}><CircularProgress /></Box>;
  if (!inspection) return <Box sx={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center" }}><Typography>Inspection not found</Typography></Box>;
  if (questions.length === 0) return <Box sx={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center" }}><Typography>No questions found.</Typography></Box>;

  if (inspection.status === "SUBMITTED") {
    return (
      <Box sx={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center", flexDirection:"column", gap: 2 }}>
        <Typography variant="h5" color="success.main" fontWeight="bold">Inspection Submitted</Typography>
        <Typography color="text.secondary">This inspection is read-only.</Typography>
        <Typography variant="body2">Part: {inspection.part_number} | Serial: {inspection.serial_number}</Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    );
  }

  const q = questions[currentIdx];
  const response = inspection.responses.find(r => r.checklist_id === q.checklist_id) || {};
  const progress = ((currentIdx + 1) / questions.length) * 100;

  const handleResult = async (resValue) => {
    setResSaving(true);
    try {
      const desc = response.description || "";
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
    if (!response.result) return;
    try {
      await saveResponse({ inspection_id: parseInt(id), checklist_id: q.checklist_id, result: response.result, description: val });
      await load();
    } catch (err) { /* ignore */ }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await processFileUpload(file);
    e.target.value = "";
  };

  const processFileUpload = async (file) => {
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      showSnackbar("Only JPG/JPEG/PNG allowed.", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showSnackbar("File too large. Max 10MB.", "error");
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

  const canProceed = response.result &&
    !(q.photo_required === 1 && !response.photo_id) &&
    !(response.result === "NOT_OK" && (!response.description || response.description.trim() === ""));

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", bgcolor: "#f5f5f5" }}>

      {/* Top bar */}
      <Box sx={{ bgcolor: "white", px: 2, py: 1, borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <Typography variant="subtitle2" fontWeight="bold">Part: {inspection.part_number}</Typography>
        <Typography variant="caption" color="text.secondary">Serial: {inspection.serial_number}</Typography>
      </Box>

      {/* Progress bar */}
      <Box sx={{ flexShrink: 0 }}>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 4 }} />
        <Typography variant="caption" sx={{ display: "block", textAlign: "center", py: 0.5, color: "text.secondary", bgcolor: "white", borderBottom: "1px solid #e0e0e0" }}>
          Question {currentIdx + 1} of {questions.length}
        </Typography>
      </Box>

      {/* Main content — strictly flex, no scroll */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 700, width: "100%", mx: "auto", px: 2, py: 1.5, gap: 1.5, overflow: "hidden" }}>

        {/* Question */}
        <Typography variant="h6" fontWeight={500} sx={{ lineHeight: 1.3, flexShrink: 0 }}>
          {q.question}
        </Typography>

        {/* OK / NOT OK buttons */}
        <Box sx={{ display: "flex", gap: 1.5, flexShrink: 0 }}>
          <Button
            variant={response.result === "OK" ? "contained" : "outlined"}
            color="success"
            sx={{ flex: 1, py: 1.5, fontSize: "1.1rem", fontWeight: 700 }}
            onClick={() => handleResult("OK")}
            disabled={resSaving}
          >
            {resSaving && response.result !== "OK" ? <CircularProgress size={20} /> : "✓  OK"}
          </Button>
          <Button
            variant={response.result === "NOT_OK" ? "contained" : "outlined"}
            color="error"
            sx={{ flex: 1, py: 1.5, fontSize: "1.1rem", fontWeight: 700 }}
            onClick={() => handleResult("NOT_OK")}
            disabled={resSaving}
          >
            {resSaving && response.result !== "NOT_OK" ? <CircularProgress size={20} /> : "✗  NOT OK"}
          </Button>
        </Box>

        {/* Description */}
        <TextField
          label={response.result === "NOT_OK" ? "Description (Required)" : "Notes (Optional)"}
          required={response.result === "NOT_OK"}
          multiline
          rows={2}
          value={response.description || ""}
          onBlur={handleDescChange}
          onChange={(e) => {
            const updated = { ...inspection };
            const idx = updated.responses.findIndex(r => r.checklist_id === q.checklist_id);
            if (idx >= 0) updated.responses[idx].description = e.target.value;
            else updated.responses.push({ checklist_id: q.checklist_id, description: e.target.value });
            setInspection(updated);
          }}
          size="small"
          sx={{ flexShrink: 0 }}
        />

        {/* Photo row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
          {photoSaving ? (
            <CircularProgress size={22} />
          ) : response.photo_id ? (
            <>
              <img
                src={`${API_BASE_URL}/operator/photos/${response.photo_id}`}
                alt="Attached"
                style={{ height: 48, width: 48, objectFit: "cover", borderRadius: 6, border: "1px solid #e0e0e0" }}
              />
              <Button
                size="small"
                color="error"
                variant="outlined"
                startIcon={<X size={14} />}
                onClick={handlePhotoDelete}
              >
                Remove
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Camera size={16} />}
                onClick={() => setCameraOpen(true)}
              >
                Use Camera{q.photo_required === 1 ? " *" : ""}
              </Button>
              <Button
                variant="text"
                size="small"
                startIcon={<Upload size={16} />}
                onClick={() => fileInputRef.current.click()}
              >
                Upload File
              </Button>
            </>
          )}
          <input type="file" hidden ref={fileInputRef} accept="image/jpeg,image/jpg,image/png" onChange={handlePhotoUpload} />
        </Box>

        {/* Spacer forces navigation to bottom */}
        <Box sx={{ flex: 1, minHeight: 0 }} />

        {/* Navigation */}
        <Box sx={{ display: "flex", gap: 1.5, flexShrink: 0 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={handlePrev}
            disabled={currentIdx === 0}
            startIcon={<ArrowLeft size={18} />}
            sx={{ flex: 1, py: 1.5 }}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={handleNext}
            disabled={!canProceed}
            endIcon={<ArrowRight size={18} />}
            sx={{ flex: 1, py: 1.5 }}
          >
            {currentIdx === questions.length - 1 ? "Review" : "Next"}
          </Button>
        </Box>
      </Box>

      <CameraCaptureDialog 
        open={cameraOpen} 
        onClose={() => setCameraOpen(false)}
        onAccept={(file) => {
          setCameraOpen(false);
          processFileUpload(file);
        }}
      />
    </Box>
  );
};
