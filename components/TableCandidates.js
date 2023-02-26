import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

function createData(voteId, candidateIds) {
  return { voteId, candidateIds };
}

function TableCandidates({ dataLoad }) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="Candidate Table">
        <TableHead>
          <TableRow>
            <TableCell className="text-lg font-bold text-orange-700">
              Vote&nbsp;ID
            </TableCell>
            <TableCell className="text-lg font-bold text-orange-700">
              Candidates&nbsp;IDs
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            <TableRow>
              <TableCell align="left">{dataLoad.voteId}</TableCell>
              <TableCell align="left">{dataLoad.candidateIds}</TableCell>
            </TableRow>
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default TableCandidates;
