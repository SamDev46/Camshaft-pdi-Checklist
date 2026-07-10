import { useState, useEffect } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, TablePagination, TextField, InputAdornment, TableContainer } from "@mui/material";
import { Search } from "lucide-react";
import { getAuditLogs } from "../../api/admin";
import { TableSkeleton } from "../../components/common/TableSkeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";

export const AuditLog = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 20;

  const load = () => {
    setLoading(true);
    getAuditLogs().then(data => {
      setLogs(data);
      setError("");
    }).catch(() => setError("Failed to load audit logs"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = logs.filter(l => (l.employee_id + l.action + l.description).toLowerCase().includes(search.toLowerCase()));

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>Audit Log</Typography>
      <TextField 
          placeholder="Search Logs..." 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          sx={{ mb: 3, width: 300 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={20}/></InputAdornment> } }}
      />
      {loading ? <TableSkeleton columns={5} rows={10} /> : (
        <Paper sx={{ overflow: "hidden" }}>
          {filtered.length === 0 ? <EmptyState message="No audit logs found" /> : (
            <>
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Entity</TableCell>
                      <TableCell>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                      <TableRow key={row.audit_id} hover>
                        <TableCell>{new Date(row.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{row.employee_id} ({row.full_name})</TableCell>
                        <TableCell>{row.action}</TableCell>
                        <TableCell>{row.entity}</TableCell>
                        <TableCell>{row.description}</TableCell>
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
    </Box>
  );
};
