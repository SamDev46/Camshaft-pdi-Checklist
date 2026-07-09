import { Table, TableBody, TableCell, TableHead, TableRow, Skeleton, Paper } from "@mui/material";

export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            {Array.from(new Array(columns)).map((_, i) => (
              <TableCell key={i}><Skeleton width="60%" height={24} /></TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from(new Array(rows)).map((_, i) => (
            <TableRow key={i}>
              {Array.from(new Array(columns)).map((_, j) => (
                <TableCell key={j}><Skeleton width="80%" height={20} /></TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};
