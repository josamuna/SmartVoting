import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";

const columns = [
  {
    field: "id",
    headerName: "ID",
    description: "Vote ID",
    width: 120,
    headerClassName: "header-style",
  },
  {
    field: "voteTypeId",
    headerName: "Vote Type ID",
    description: "Vote Type ID",
    width: 170,
    headerClassName: "header-style",
  },
  {
    field: "timeDuration",
    headerName: "Time duration (Min.)",
    description: "Time duration for the vote",
    width: 230,
    editable: false,
    headerClassName: "header-style",
  },
  {
    field: "initialVotingTimestamp",
    headerName: "Initial Timestamp",
    description:
      "The initial value of Unix timestamp when the vote was started",
    width: 180,
    editable: false,
    headerClassName: "header-style",
  },
  {
    field: "status",
    headerName: "Vote Status",
    description:
      "The current vote status of a vote (0 => Not activated, 1 => Activated and 2 => Closed)",
    width: 150,
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
];

function VoteTypeDataGrid({ dataLoad }) {
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

export default VoteTypeDataGrid;
