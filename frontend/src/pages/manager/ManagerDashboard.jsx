import { useState, useEffect } from "react";
import { Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableHead, TableRow, Button } from "@mui/material";
import { FileText, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDashboardStats, getInspections } from "../../api/manager";
import { TableSkeleton } from "../../components/common/TableSkeleton";
import { ErrorState } from "../../components/common/ErrorState";

export const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [recentInspections, setRecentInspections] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [s, inspections] = await Promise.all([getDashboardStats(), getInspections()]);
      setStats(s);
      setRecentInspections(inspections.slice(0, 5));
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  
  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>Manager Dashboard</Typography>
      
      {loading ? <TableSkeleton rows={1} columns={3} /> : (
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: "primary.light", color: "primary.contrastText", borderRadius: 2 }}>
                <FileText size={32} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Inspections</Typography>
                <Typography variant="h4">{stats.total}</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: "#ff9800", color: "white", borderRadius: 2 }}>
                <Clock size={32} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">In Progress</Typography>
                <Typography variant="h4">{stats.in_progress}</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: "#4caf50", color: "white", borderRadius: 2 }}>
                <CheckCircle size={32} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Submitted</Typography>
                <Typography variant="h4">{stats.submitted}</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Recent Inspections</Typography>
      {loading ? <TableSkeleton columns={4} rows={5} /> : (
        <Paper sx={{ overflow: "hidden" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Inspection ID</TableCell>
                <TableCell>Part Number</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentInspections.map(row => (
                <TableRow key={row.inspection_id} hover>
                  <TableCell>{row.inspection_id}</TableCell>
                  <TableCell>{row.part_number}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell align="right">
                    <Button variant="outlined" size="small" onClick={() => navigate(`/monitor/inspection/${row.inspection_id}`)}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
              {recentInspections.length === 0 && (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}>No recent inspections.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};
