import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";

const columns = [
  {
    field: "id",
    headerName: "ID",
    description: "Voting Office ID",
    width: 150,
    headerClassName: "header-style",
  },
  {
    field: "designation",
    headerName: "Designation",
    description: "Voting Office designation",
    width: 350,
    editable: false,
    headerClassName: "header-style",
  },
  {
    field: "user",
    headerName: "User Address",
    description: "User's address who save the record in the Blockchain",
    width: 500,
    editable: false,
    headerClassName: "header-style",
  },
];

function VotingOfficeDataGrid({ dataLoad }) {
  return (
    <Box
      sx={{
        height: 310,
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
