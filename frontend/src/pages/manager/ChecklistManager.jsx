import { useState, useEffect } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Button, Drawer, TextField, MenuItem, CircularProgress, Switch } from "@mui/material";
import { getManagerChecklist, createChecklist, updateChecklist, deleteChecklist } from "../../api/manager";
import { useSnackbar } from "../../context/SnackbarContext";
import { ErrorState } from "../../components/common/ErrorState";
import { TableSkeleton } from "../../components/common/TableSkeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { Edit, Trash2 } from "lucide-react";

export const ChecklistManager = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checklist, setChecklist] = useState([]);
  const { showSnackbar } = useSnackbar();
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ question: "", sequence_no: 1, photo_required: 1 });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const data = await getManagerChecklist();
      setChecklist(data);
    } catch (e) {
      setError("Failed to load checklist");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const openDrawer = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData({ question: item.question, sequence_no: item.sequence_no, photo_required: item.photo_required });
    } else {
      setEditItem(null);
      setFormData({ question: "", sequence_no: checklist.length + 1, photo_required: 1 });
    }
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!formData.question.trim()) {
        showSnackbar("Question text required", "error"); setSaving(false); return;
      }
      if (editItem) {
        await updateChecklist(editItem.checklist_id, formData);
        showSnackbar("Question updated", "success");
      } else {
        await createChecklist(formData);
        showSnackbar("Question added", "success");
      }
      setDrawerOpen(false);
      await load();
    } catch (e) {
      showSnackbar(e.response?.data?.detail || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to disable this question?")) return;
    try {
      await deleteChecklist(id);
      showSnackbar("Question removed", "success");
      await load();
    } catch (e) {
      showSnackbar("Failed to delete", "error");
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ display:"flex", justifyContent:"space-between", mb: 4, alignItems: "center" }}>
        <Typography variant="h4">Checklist Manager</Typography>
        <Button variant="contained" onClick={() => openDrawer()}>Add Question</Button>
      </Box>

      {loading ? <TableSkeleton columns={4} rows={7} /> : (
        <Paper sx={{ overflow: "hidden" }}>
          {checklist.length === 0 ? <EmptyState message="No checklist questions found" /> : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="10%">Seq</TableCell>
                  <TableCell width="60%">Question</TableCell>
                  <TableCell width="15%">Photo Req</TableCell>
                  <TableCell align="right" width="15%">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {checklist.map((row) => (
                  <TableRow key={row.checklist_id} hover>
                    <TableCell>{row.sequence_no}</TableCell>
                    <TableCell>{row.question}</TableCell>
                    <TableCell>{row.photo_required === 1 ? "Yes" : "No"}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => openDrawer(row)} sx={{ minWidth: "auto", px: 1 }}><Edit size={18} /></Button>
                      <Button size="small" color="error" onClick={() => handleDelete(row.checklist_id)} sx={{ minWidth: "auto", px: 1 }}><Trash2 size={18} /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      )}

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 400, p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
          <Typography variant="h6" gutterBottom>{editItem ? "Edit Question" : "Add Question"}</Typography>
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px", flexGrow: 1 }}>
            <TextField label="Question" required multiline rows={3} value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} />
            <TextField label="Sequence No" type="number" required inputProps={{ min: 1 }} value={formData.sequence_no} onChange={e => setFormData({...formData, sequence_no: parseInt(e.target.value) || 1})} />
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1, border: "1px solid #e0e0e0", borderRadius: 1 }}>
              <Typography>Photo Required</Typography>
              <Switch checked={formData.photo_required === 1} onChange={e => setFormData({...formData, photo_required: e.target.checked ? 1 : 0})} />
            </Box>
            <Box sx={{ mt: "auto", pt: 2, display: "flex", gap: 2 }}>
              <Button onClick={() => setDrawerOpen(false)} variant="outlined" sx={{ flex: 1 }}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={saving} sx={{ flex: 1 }}>
                {saving ? <CircularProgress size={24} color="inherit" /> : "Save"}
              </Button>
            </Box>
          </form>
        </Box>
      </Drawer>
    </Box>
  );
};
