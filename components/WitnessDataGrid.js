import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";

const columns = [
  {
    field: "id",
    headerName: "ID",
    description: "Witness ID",
    width: 100,
    headerClassName: "header-style",
  },
  {
    field: "organization",
    headerName: "Organization",
    description: "The organization that witness represent",
    width: 350,
    editable: false,
    headerClassName: "header-style",
  },
  {
    field: "fullname",
    headerName: "Fullname",
    description: "Witness fullname",
    width: 250,
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

function WitnessesDataGrid({ dataLoad }) {
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

export default WitnessesDataGrid;
