import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";

const columns = [
  {
    field: "id",
    headerName: "ID",
    description: "Ballot Box ID",
    width: 150,
    headerClassName: "header-style",
  },
  {
    field: "voteId",
    headerName: "Vote ID",
    description: "Vote Type ID",
    width: 180,
    headerClassName: "header-style",
  },
  {
    field: "candidateId",
    headerName: "Candidate ID",
    description: "Candidate ID",
    width: 180,
    editable: false,
    headerClassName: "header-style",
  },
  {
    field: "votingOfficeId",
    headerName: "Voting Office ID",
    description: "The voting Officed ID where the voter cast his vote",
    width: 170,
    editable: false,
    headerClassName: "header-style",
  },

  {
    field: "voterVoteStatus",
    headerName: "Status",
    description:
      "The voter vote status (0 = Not voted, 1 = voted and 2 = blank)",
    width: 110,
    editable: false,
    headerClassName: "header-style",
  },
  {
    field: "voterAddress",
    headerName: "Voter Address",
    description: "Voter Address",
    width: 450,
    editable: false,
    headerClassName: "header-style",
  },
];

function BallotBoxDataGrid({ dataLoad }) {
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

export default BallotBoxDataGrid;
