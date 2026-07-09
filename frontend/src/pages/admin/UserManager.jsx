import { useState, useEffect } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Button, Drawer, TextField, CircularProgress, MenuItem, Dialog, TablePagination, InputAdornment, TableContainer } from "@mui/material";
import { Search } from "lucide-react";
import { getUsers, createUser, updateUser, activateUser, deactivateUser, resetPassword, getPassword } from "../../api/admin";
import { useSnackbar } from "../../context/SnackbarContext";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { TableSkeleton } from "../../components/common/TableSkeleton";

export const UserManager = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const { showSnackbar } = useSnackbar();
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ employee_id: "", full_name: "", password: "", role: "OPERATOR", is_active: 1 });
  const [saving, setSaving] = useState(false);
  
  const [pwdDialog, setPwdDialog] = useState({ open: false, password: "", employee_id: "" });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 20;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (e) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const openDrawer = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData({ employee_id: item.employee_id, full_name: item.full_name, password: "", role: item.role, is_active: item.is_active });
    } else {
      setEditItem(null);
      setFormData({ employee_id: "", full_name: "", password: "", role: "OPERATOR", is_active: 1 });
    }
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!formData.full_name.trim() || !formData.role) {
        showSnackbar("Missing required fields", "error"); 
        setSaving(false); return;
      }
      if (editItem) {
        await updateUser(editItem.user_id, { full_name: formData.full_name, role: formData.role, is_active: formData.is_active });
        if (formData.password) await resetPassword(editItem.user_id, formData.password);
        showSnackbar("User updated successfully", "success");
      } else {
        if (!formData.password || !formData.employee_id) {
          showSnackbar("Password and Employee ID required", "error"); 
          setSaving(false); return;
        }
        await createUser(formData);
        showSnackbar("User created successfully", "success");
      }
      setDrawerOpen(false);
      await load();
    } catch (e) {
      showSnackbar(e.response?.data?.detail || "Failed to save user", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      if (currentStatus === 1) await deactivateUser(id);
      else await activateUser(id);
      showSnackbar(currentStatus === 1 ? "User deactivated" : "User activated", "success");
      await load();
    } catch (e) {
      showSnackbar(e.response?.data?.detail || "Failed to toggle status", "error");
    }
  };

  const handleViewPassword = async (id, emp_id) => {
    try {
      const res = await getPassword(id);
      setPwdDialog({ open: true, password: res.password, employee_id: emp_id });
    } catch (e) {
      showSnackbar("Failed to view password", "error");
    }
  };

  const filtered = users.filter(u => (u.employee_id + u.full_name).toLowerCase().includes(search.toLowerCase()));

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ display:"flex", justifyContent:"space-between", mb: 4, alignItems: "center" }}>
        <Typography variant="h4">User Management</Typography>
        <Button variant="contained" onClick={() => openDrawer()}>Create User</Button>
      </Box>
      <TextField 
          placeholder="Search Users..." 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          sx={{ mb: 3, width: 300 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search size={20}/></InputAdornment> }}
      />
      
      {loading ? <TableSkeleton columns={5} rows={10} /> : (
        <Paper sx={{ overflow: 'hidden' }}>
          {filtered.length === 0 ? <EmptyState message="No users found" /> : (
            <>
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee ID</TableCell>
                      <TableCell>Full Name</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                      <TableRow key={row.user_id} hover>
                        <TableCell>{row.employee_id}</TableCell>
                        <TableCell>{row.full_name}</TableCell>
                        <TableCell>{row.role}</TableCell>
                        <TableCell>{row.is_active === 1 ? "Active" : "Inactive"}</TableCell>
                        <TableCell align="right">
                          <Button size="small" onClick={() => openDrawer(row)}>Edit</Button>
                          <Button size="small" onClick={() => handleToggleActive(row.user_id, row.is_active)}>
                              {row.is_active === 1 ? "Deactivate" : "Activate"}
                          </Button>
                          <Button size="small" onClick={() => handleViewPassword(row.user_id, row.employee_id)}>View Pwd</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination 
                component="div" 
                count={filtered.length} 
                page={page} 
                onPageChange={(e, newPage) => setPage(newPage)} 
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[20]}
              />
            </>
          )}
        </Paper>
      )}

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 400, p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
          <Typography variant="h6" gutterBottom>{editItem ? "Edit User" : "Create User"}</Typography>
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px", flexGrow: 1 }}>
            <TextField label="Employee ID" required={!editItem} disabled={!!editItem} value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})} />
            <TextField label="Full Name" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
            <TextField select label="Role" required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <MenuItem value="OPERATOR">OPERATOR</MenuItem>
              <MenuItem value="MANAGER">MANAGER</MenuItem>
              <MenuItem value="ADMIN">ADMIN</MenuItem>
            </TextField>
            <TextField 
                label={editItem ? "Reset Password (Optional)" : "Password"} 
                required={!editItem} 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
            />
            <Box sx={{ mt: "auto", pt: 2, display: "flex", gap: 2 }}>
              <Button onClick={() => setDrawerOpen(false)} variant="outlined" sx={{ flex: 1 }}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={saving} sx={{ flex: 1 }}>
                {saving ? <CircularProgress size={24} color="inherit" /> : "Save"}
              </Button>
            </Box>
          </form>
        </Box>
      </Drawer>

      <Dialog open={pwdDialog.open} onClose={() => setPwdDialog({ open: false, password: "", employee_id: "" })} maxWidth="xs" fullWidth>
          <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>Password for {pwdDialog.employee_id}</Typography>
              <Typography variant="h4" sx={{ my: 3, letterSpacing: 2, fontFamily: "monospace", bgcolor: "background.paper", p: 2, borderRadius: 1 }}>
                  {pwdDialog.password}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                <Button variant="outlined" onClick={() => {
                  navigator.clipboard.writeText(pwdDialog.password);
                  showSnackbar("Password copied", "info");
                }}>Copy</Button>
                <Button variant="text" onClick={() => setPwdDialog({ open: false, password: "", employee_id: "" })}>Close</Button>
              </Box>
          </Box>
      </Dialog>
    </Box>
  );
};
