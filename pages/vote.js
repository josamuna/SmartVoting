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

import VoteDataGrid from "@components/VoteDataGrid";

import { votingaddress } from "../config"; // Contract Address.
import Voting from "./abis/Voting.json"; // ABI.

function vote() {
  const initialFocusRef = useRef(null);
  const [options, setOptions] = useState([]); // To be loaded on Select
  const [formInput, updateFormInput] = useState({
    id: 0,
    designation: "",
    voteTypeId: 0,
    timeDuration: 0,
    initialVotingTimestamp: 0,
    status: 0,
  });
  const [dataLoad, setDataLoad] = useState([]); // State trigger returned saved data.

  // Using useEffect to trigger re-rendering after values have been saved.
  useEffect(() => {
    initialFocusRef.current.focus(); // Set the focus.
    loadVote(); // Load data each time we re-rendering.
    loadVoteType(); // Load votetype ID.
  }, []);

  // Load vote records
  async function loadVote() {
    try {
      const provider = new ethers.providers.JsonRpcProvider();
      const contract = new ethers.Contract(votingaddress, Voting.abi, provider);
      const data = await contract.getVotes();

      const items = await Promise.all(
        data.map(async (i) => {
          let item = {
            id: i.id.toNumber(), // Convert BigInt to JavaScript Number.
            voteTypeId: i.voteTypeId.toNumber(), // Convert BigInt to JavaScript Number
            timeDuration: i.timeDuration.toNumber(), // Idem
            initialVotingTimestamp: i.initialVotingTimestamp.toNumber(), // Idem
            status: i.status.toNumber(), // Idem
            user: i.user,
          };
          return item;
        })
      );
      setDataLoad(items); // Set State data.
    } catch (error) {
      console.error(`loadVote => ${error}`);
    }
  }

  // Load VoteType to be shown in the select option
  async function loadVoteType() {
    try {
      const provider = new ethers.providers.JsonRpcProvider();
      const contract = new ethers.Contract(votingaddress, Voting.abi, provider);
      const data = await contract.getVoteTypes();

      let values = []; // Will contain all options
      await Promise.all(
        data.map(async (i) => {
          values.push({
            key: i.id.toNumber(), // Get id to be the key
            value: i.designation, // Value to be shown
          });
        })
      );

      setOptions(values); // Set State data.
    } catch (error) {
      console.error(`loadVoteType => ${error}`);
    }
  }

  // Save new vote record.
  async function saveVote() {
    const { voteTypeId, timeDuration } = formInput;
    try {
      if (timeDuration == 0) {
        throw new Error(
          "Please provide valid time duration (eg.24, 12, 48, etc.)."
        );
      } else if (voteTypeId == 0) {
        throw new Error("Invalid vote Type ID provided.");
      }

      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect(); // Connect to Metamask wallet.
      const provider = new ethers.providers.Web3Provider(connection); // Specify provider.
      const signer = provider.getSigner(); // Get the Signers.

      const contract = new ethers.Contract(votingaddress, Voting.abi, signer); // Get Contract references.
      const transaction = await contract.setVote(voteTypeId, timeDuration); // Call contract function.

      await transaction.wait();
      NotificationManager.success(
        "New record successfully saved.",
        "Save",
        5000
      );
      loadVote();
    } catch (error) {
      NotificationManager.warning(
        "New record can not be saved. Make sure vote type is properly selected.",
        "Save",
        10000
      );
      console.error(`saveVote => ${error}`);
    }
  }

  return (
    <section className="flex flex-col justify-center">
      <article className="flex justify-center pb-4">
        <div className="w-1/2 flex flex-col justify-center">
          <input
            placeholder="Vote ID"
            className="mt-2 border border-orange-100 rounded p-3"
            disabled
            onChange={(e) => {
              updateFormInput({ ...formInput, id: e.target.value });
            }}
          />
          <select
            className="mt-2 border border-orange-100 rounded p-3"
            onChange={(e) => {
              updateFormInput({
                ...formInput,
                voteTypeId: e.target.value,
              });
            }}
          >
            {/* Default Choice */}
            <option>Choose Vote Type ID</option>
            {options.map((option) => {
              return <option key={option.key}>{option.key}</option>;
            })}
          </select>
          <input
            placeholder="Time duration"
            type="number"
            className="mt-2 border border-orange-200 rounded p-3"
            onChange={(e) => {
              updateFormInput({ ...formInput, timeDuration: e.target.value });
            }}
            ref={initialFocusRef}
          />
          <input
            type="number"
            placeholder="Initial unix timestamp of vote"
            className="mt-2 border border-orange-100 rounded p-3"
            disabled
            onChange={(e) => {
              updateFormInput({
                ...formInput,
                initialVotingTimestamp: e.target.value,
              });
            }}
          />
          <input
            type="number"
            placeholder="Vote status"
            className="mt-2 border border-orange-100 rounded p-3"
            disabled
            onChange={(e) => {
              updateFormInput({
                ...formInput,
                status: e.target.value,
              });
            }}
          />
          <button
            onClick={saveVote}
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
        <VoteDataGrid dataLoad={dataLoad} />
      </article>
      <article>
        <Footer />
      </article>
    </section>
  );
}

export default vote;
