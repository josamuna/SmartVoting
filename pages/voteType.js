import React from "react";
import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css"; // To handle beautifull React Notification.
import Footer from "@components/Footer";

import VoteTypeDataGrid from "@components/VoteTypeDataGrid";

import { votingaddress } from "../config"; // Contract Address.
import Voting from "./abis/Voting.json"; // ABI.

function voteType() {
  const initialFocusRef = useRef(null);
  const [formInput, updateFormInput] = useState({
    id: 0,
    designation: "",
    description: "",
  });
  const [dataLoad, setDataLoad] = useState([]); // State trigger returned saved data.

  // Using useEffect to trigger re-rendering after values have been saved.
  useEffect(() => {
    initialFocusRef.current.focus(); // Set the focus.
    loadVoteType(); // Load data each time we re-rendering.
  }, []);

  // Load vote Type records
  async function loadVoteType() {
    try {
      const provider = new ethers.providers.JsonRpcProvider();
      const contract = new ethers.Contract(votingaddress, Voting.abi, provider);
      const data = await contract.getVoteTypes();

      const items = await Promise.all(
        data.map(async (i) => {
          let item = {
            id: i.id.toNumber(), // Convert BigInt to JavaScript Number.
            designation: i.designation,
            description: i.description,
            user: i.user,
          };
          return item;
        })
      );
      setDataLoad(items); // Set State data.
    } catch (error) {
      console.error(`loadVoteType => ${error}`);
    }
  }

  // Savae new vote Type record.
  async function saveVoteType() {
    const { designation, description } = formInput;
    try {
      if (!designation || !description) {
        throw new Error("Please provide valid designation and description.");
      }
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect(); // Connect to Metamask wallet.
      const provider = new ethers.providers.Web3Provider(connection); // Specify provider.
      const signer = provider.getSigner(); // Get the Signers.

      const contract = new ethers.Contract(votingaddress, Voting.abi, signer); // Get Contract references.
      const transaction = await contract.setVoteType(designation, description); // Call contract function.
      // const tx = await transaction.wait();

      // Use event to retreive values inserted
      // const event = tx.events[0];
      // console.log("event emit: ", event);
      // let value = event.args[2];
      // console.log("event values: ", event.args[2]);

      await transaction.wait();
      NotificationManager.success(
        "New record successfully saved.",
        "Save",
        5000
      );
      loadVoteType();
    } catch (error) {
      NotificationManager.warning("New record can not be saved.", "Save", 8000);
      console.error(`saveVoteType => ${error}`);
    }
  }

  return (
    <section className="flex flex-col justify-center">
      <article className="flex justify-center pb-4">
        <div className="w-1/2 flex flex-col justify-center">
          <input
            placeholder="Vote Type ID"
            className="mt-2 border border-orange-100 rounded p-3"
            disabled
            onChange={(e) => {
              updateFormInput({ ...formInput, id: e.target.value });
            }}
          />
          <input
            placeholder="Designation"
            className="mt-2 border border-orange-200 rounded p-3"
            onChange={(e) => {
              updateFormInput({ ...formInput, designation: e.target.value });
            }}
            ref={initialFocusRef}
          />
          <input
            placeholder="Description"
            className="mt-2 border border-orange-200 rounded p-3"
            onChange={(e) => {
              updateFormInput({ ...formInput, description: e.target.value });
            }}
          />
          <button
            onClick={saveVoteType}
            className="font-bold mt-2 bg-gradient-to-r from-green-400 to to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-white rounded p-4 shadow-lg"
          >
            Save
          </button>
        </div>
      </article>
      <article>
        <NotificationContainer />
      </article>
      <article className="flex justify-center mx-16">
        <VoteTypeDataGrid dataLoad={dataLoad} />
      </article>
      <article>
        <Footer />
      </article>
    </section>
  );
}

export default voteType;
