import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";

const columns = [
  {
    field: "voteId",
    headerName: "ID",
    description: "Vote ID",
    width: 150,
    headerClassName: "header-style",
  },
  {
    field: "candidateIds",
    headerName: "All Candidates IDs",
    description: "All candidates IDs register for a specific vote",
    width: 500,
    height: 100,
    editable: false,
    headerClassName: "header-style",
  },
];

function RegisterCandidateDataGrid({ dataLoad }) {
  return (
    <Box
      sx={{
        height: 250,
        width: "100%",
        "& .header-style": {
          fontSize: "large",
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

export default RegisterCandidateDataGrid;
