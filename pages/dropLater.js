import React from "react";
import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css"; // To handle beautifull React Notification
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import Footer from "@components/Footer";

import { votingaddress } from "../config"; // Contract Address
import Voting from "./abis/Voting.json"; // ABI

function voteType() {
  const initialFocusRef = useRef(null);
  const [formInput, updateFormInput] = useState({
    id: 0,
    designation: "",
    description: "",
  });
  const [dataVoteType, setDataVoteType] = useState([]);

  // // Using useEffect to trigger re-rendering after values have been saved.
  useEffect(() => {
    initialFocusRef.current.focus(); // Set the focus.
    loadVoteType();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "designation",
      headerName: "Designation",
      description: "Vote Type designation",
      width: 200,
      editable: false,
    },
    {
      field: "description",
      headerName: "Description",
      description: "Vote Type description",
      width: 250,
      editable: false,
    },
    {
      field: "user",
      headerName: "User Address",
      description: "User's address who save the record in the Blockchain",
      width: 620,
      editable: false,
    },
  ];

  async function loadVoteType() {
    try {
      const provider = new ethers.providers.JsonRpcProvider();
      const votingContract = new ethers.Contract(
        votingaddress,
        Voting.abi,
        provider
      );
      const data = await votingContract.getVoteTypes();

      const items = await Promise.all(
        data.map(async (i) => {
          let item = {
            id: i.id.toNumber(),
            designation: i.designation,
            description: i.description,
            user: i.user,
          };

          return item;
        })
      );
      setDataVoteType(items);
      console.log("Items =>", items);
      //   console.log("Data2=>", dataVoteType);
      return items;
    } catch (error) {
      console.log(`loadVoteType => ${error}`);
    }
  }

  return (
    <section className="flex flex-col justify-center">
      <article className="flex justify-center pb-4">
        <div className="w-1/2 flex flex-col justify-center">
          <input
            placeholder="Vote Type ID"
            className="mt-2 border-orange-100 rounded p-3"
            disabled
            onChange={(e) => {
              updateFormInput({ ...formInput, id: e.target.value });
            }}
          />
          <input
            placeholder="Designation"
            className="mt-2 border-orange-600 rounded p-3"
            onChange={(e) => {
              updateFormInput({ ...formInput, designation: e.target.value });
            }}
            ref={initialFocusRef}
          />
          <input
            placeholder="Description"
            className="mt-2 border-orange-600 rounded p-3"
            onChange={(e) => {
              updateFormInput({ ...formInput, description: e.target.value });
            }}
          />
          <button
            onClick={console.log("ok")}
            className="font-bold mt-2 bg-gradient-to-r from-green-400 to to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-white rounded p-4 shadow-lg"
          >
            Save
          </button>
        </div>
      </article>
      <article>
        <NotificationContainer />
      </article>
      <article className="flex justify-center mx-4">
        <h1>SHOW VALUES</h1>
        <br />
        {/* {dataVoteType.map((val, index) => {
          return (
            <div key={index}>
              <h3>Id: {val.id}</h3>
              <h3>Designation: {val.designation}</h3>
              <h3>Description: {val.description}</h3>
              <h3>Address: {val.user}</h3>
            </div>
          );
        })} */}
        <Box sx={{ height: 250, width: "100%" }}>
          <DataGrid
            rows={dataVoteType}
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
      </article>
      <article>
        <Footer />
      </article>
    </section>
  );
}

export default voteType;
