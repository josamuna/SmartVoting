import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";

const columns = [
  {
    field: "id",
    headerName: "ID",
    description: "Candidate ID",
    width: 100,
    headerClassName: "header-style",
  },
  {
    field: "orderNumber",
    headerName: "Order Number",
    description: "Candidate order number during voting process",
    width: 140,
    headerClassName: "header-style",
  },
  {
    field: "fullname",
    headerName: "Fullname",
    description: "Candidate fullname",
    width: 240,
    editable: false,
    headerClassName: "header-style",
  },
  {
    field: "user",
    headerName: "User Address",
    description: "User's address who save the record in the Blockchain",
    width: 400,
    editable: false,
    headerClassName: "header-style",
  },
  {
    field: "image",
    headerName: "User picture",
    description: "Candidate's picture",
    width: 750,
    editable: false,
    headerClassName: "header-style",
  },
];

function CandidateDataGrid({ dataLoad }) {
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
        pageSize={25}
        rowsPerPageOptions={[25]}
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

export default CandidateDataGrid;
