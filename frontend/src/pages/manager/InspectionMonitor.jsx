import { useState, useEffect } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, InputAdornment, TablePagination, Button, TableContainer } from "@mui/material";
import { Search, Download, FileText, FileSpreadsheet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getInspections } from "../../api/manager";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { TableSkeleton } from "../../components/common/TableSkeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";

export const InspectionMonitor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inspections, setInspections] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 20;

  const load = () => {
    setLoading(true); setError("");
    getInspections().then(setInspections)
      .catch(() => setError("Failed to load inspections"))
      .finally(() => setLoading(false));
  };
  
  useEffect(() => { load(); }, []);

  const filtered = inspections.filter(i => 
    (i.part_number + i.serial_number + i.vendor_code + i.operator_name + i.status).toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = Object.keys(filtered[0]).join(",");
    const rows = filtered.map(row => 
      Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
    saveAs(blob, "inspections.csv");
  };

  const exportExcel = async () => {
    if (filtered.length === 0) return;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Inspections");
    sheet.columns = Object.keys(filtered[0]).map(key => ({ header: key, key: key }));
    filtered.forEach(row => sheet.addRow(row));
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "inspections.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Inspection Report", 14, 15);
    const body = filtered.map(i => [i.inspection_id, i.part_number, i.serial_number, i.operator_name, i.status, new Date(i.started_at).toLocaleString()]);
    doc.autoTable({
      head: [["ID", "Part", "Serial", "Operator", "Status", "Started"]],
      body,
      startY: 20
    });
    doc.save("inspections.pdf");
  };

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4">Inspection Monitor</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="outlined" startIcon={<Download size={18} />} onClick={exportCSV}>CSV</Button>
            <Button variant="outlined" startIcon={<FileSpreadsheet size={18} />} onClick={exportExcel}>Excel</Button>
            <Button variant="outlined" startIcon={<FileText size={18} />} onClick={exportPDF}>PDF</Button>
        </Box>
      </Box>

      <TextField 
          placeholder="Search inspections..." 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          sx={{ mb: 3, width: 300 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={20}/></InputAdornment> } }}
      />
      
      {loading ? <TableSkeleton columns={6} rows={10} /> : (
        <Paper sx={{ overflow: "hidden" }}>
          {filtered.length === 0 ? <EmptyState message="No inspections found" /> : (
            <>
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Part Number</TableCell>
                      <TableCell>Serial</TableCell>
                      <TableCell>Operator</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                      <TableRow key={row.inspection_id} hover>
                        <TableCell>{row.inspection_id}</TableCell>
                        <TableCell>{row.part_number}</TableCell>
                        <TableCell>{row.serial_number}</TableCell>
                        <TableCell>{row.operator_name}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell align="right">
                          <Button size="small" variant="outlined" onClick={() => navigate(`/monitor/inspection/${row.inspection_id}`)}>View</Button>
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
    </Box>
  );
};
