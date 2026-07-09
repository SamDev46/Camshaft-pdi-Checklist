import { useState, useEffect } from "react";
import { Box, Typography, Paper, Grid, CircularProgress } from "@mui/material";
import { Users, UserCheck, Shield, Key } from "lucide-react";
import { getAdminDashboard } from "../../api/admin";
import { ErrorState } from "../../components/common/ErrorState";

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ total_users: 0, operators: 0, managers: 0, admins: 0 });

  const load = () => {
    setLoading(true);
    getAdminDashboard()
      .then(setStats)
      .catch(() => setError("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <Box sx={{mt: 10, textAlign:"center"}}><CircularProgress/></Box>;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>Admin Dashboard</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: "primary.light", color: "primary.contrastText", borderRadius: 2 }}>
                <Users size={32} />
            </Box>
            <Box>
                <Typography variant="body2" color="text.secondary">Total Users</Typography>
                <Typography variant="h4">{stats.total_users}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: "#4caf50", color: "white", borderRadius: 2 }}>
                <UserCheck size={32} />
            </Box>
            <Box>
                <Typography variant="body2" color="text.secondary">Operators</Typography>
                <Typography variant="h4">{stats.operators}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: "#ff9800", color: "white", borderRadius: 2 }}>
                <Shield size={32} />
            </Box>
            <Box>
                <Typography variant="body2" color="text.secondary">Managers</Typography>
                <Typography variant="h4">{stats.managers}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: "#f44336", color: "white", borderRadius: 2 }}>
                <Key size={32} />
            </Box>
            <Box>
                <Typography variant="body2" color="text.secondary">Admins</Typography>
                <Typography variant="h4">{stats.admins}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
