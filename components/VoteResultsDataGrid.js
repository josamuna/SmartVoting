import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";

const columns = [
  {
    field: "id",
    headerName: "ID",
    description: "Row ID",
    width: 80,
    headerClassName: "header-style",
  },
  {
    field: "voteId",
    headerName: "Vote ID",
    description: "Vote ID",
    width: 100,
    headerClassName: "header-style",
  },
  {
    field: "candidateId",
    headerName: "Candidate ID",
    description: "Candidate ID",
    width: 160,
    editable: false,
    headerClassName: "header-style",
  },
  {
    field: "candidateFullName",
    headerName: "Candidate fullname",
    description: "Candidate fullname",
    width: 200,
    editable: false,
    headerClassName: "header-style",
  },
  {
    field: "candidateNumber",
    headerName: "Candidate Number",
    description: "Candidate Order Number",
    width: 170,
    editable: false,
    headerClassName: "header-style",
  },
  {
    field: "votesCast",
    headerName: "Votes candidate",
    description: "Total number of votes received by the candidate",
    width: 150,
    editable: false,
    headerClassName: "header-style",
  },
  {
    field: "candidatePercentage",
    headerName: "% Vote Candidate",
    description: "Percentage of current vote received by candidate",
    width: 180,
    editable: false,
    headerClassName: "header-style",
  },
  {
    field: "votesBlank",
    headerName: "Blank votes",
    description: "Total number of blank votes",
    width: 110,
    editable: false,
    headerClassName: "header-style",
  },
  {
    field: "blankPercentage",
    headerName: "% Blank Votes",
    description: "Percentage of blank vote for the entire voting process",
    width: 150,
    editable: false,
    headerClassName: "header-style",
  },
];

function VotingOfficeDataGrid({ dataLoad }) {
  return (
    <Box
      sx={{
        height: 400,
        width: "100%",
        "& .header-style": {
          fontSize: "large",
          color: "rgb(164,65,12)",
        },
      }}
    >
      <DataGrid
        rows={dataLoad}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        disableSelectionOnClick
        experimentalFeatures={{ newEditingApi: true }}
        sx={{
          boxShadow: 2,
          border: 2,
          borderColor: "primary.light",
          "& .MuiDataGrid-cell:hover": {
            color: "primary.main",
          },
        }}
      />
    </Box>
  );
}

export default VotingOfficeDataGrid;
