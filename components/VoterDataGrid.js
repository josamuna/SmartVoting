import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";

const columns = [
  {
    field: "id",
    headerName: "ID",
    description: "Voter ID",
    width: 300,
    headerClassName: "header-style",
  },
  {
    field: "voter",
    headerName: "Adress",
    description: "Voter address",
    width: 500,
    editable: false,
    headerClassName: "header-style",
  },
];

function VoterDataGrid({ dataLoad }) {
  const [select, setSelection] = React.useState([]);
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
        pageSize={50}
        rowsPerPageOptions={[50]}
        disableSelectionOnClick
        experimentalFeatures={{ newEditingApi: true }}
        onSelectionChange={(newSelection) => {
          setSelection(newSelection.rows);
        }}
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

export default VoterDataGrid;
