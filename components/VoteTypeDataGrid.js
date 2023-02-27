import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";

const columns = [
  {
    field: "id",
    headerName: "ID",
    description: "Vote Type ID",
    width: 150,
    headerClassName: "header-style",
  },
  {
    field: "designation",
    headerName: "Designation",
    description: "Vote Type designation",
    width: 240,
    editable: false,
    headerClassName: "header-style",
  },
  {
    field: "description",
    headerName: "Description",
    description: "Vote Type description",
    width: 340,
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

function VoteTypeDataGrid({ dataLoad }) {
  return (
    <Box
      sx={{
        height: 250,
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

export default VoteTypeDataGrid;
