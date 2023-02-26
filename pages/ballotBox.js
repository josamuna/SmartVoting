import React from "react";
import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css"; // To handle beautifull React Notification.
import Footer from "@components/Footer";

import BallotBoxDataGrid from "@components/BallotBoxDataGrid";

import { votingaddress } from "../config"; // Contract Address.
import Voting from "./abis/Voting.json"; // ABI.

function ballotBox() {
  const initialFocusRef = useRef(null);
  const [options, setOptions] = useState([]);
  const [formInput, updateFormInput] = useState({
    id: 0,
    voteId: 0,
    candidateId: 0,
    votingOfficeId: 0,
    voterVoteStatus: 0,
    voterId: 0,
    voterVoteStatus: 0,
    voterAddress: "",
  });
  const [dataLoad, setDataLoad] = useState([]); // State trigger returned saved data.

  // Using useEffect to trigger re-rendering after values have been saved.
  useEffect(() => {
    initialFocusRef.current.focus();
    loadBallotBox(); // Load data each time we re-rendering.
    loadVoteType(); // Load voteType ID.
  }, []);

  // Load ballotBox records
  async function loadBallotBox() {
    try {
      const provider = new ethers.providers.JsonRpcProvider();
      const contract = new ethers.Contract(votingaddress, Voting.abi, provider);
      const data = await contract.getBallotBoxes();

      const items = await Promise.all(
        data.map(async (i) => {
          let item = {
            id: i.id.toNumber(), // Convert BigInt to JavaScript Number.
            voteId: i.voteId.toNumber(), // Convert BigInt to JavaScript Number
            candidateId: i.candidateId.toNumber(), // Idem
            votingOfficeId: i.votingOfficeId.toNumber(), // Idem
            voterVoteStatus: i.voterVoteStatus.toNumber(), // Idem
            voterAddress: i.voterAddress,
          };
          return item;
        })
      );
      setDataLoad(items); // Set State data.
    } catch (error) {
      console.error(`loadBallotBox => ${error}`);
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

  // Savae new ballotBox record.
  async function saveBallotBox() {
    const {
      voteId,
      voteTypeId,
      votingOfficeId,
      candidateId,
      voterId,
      voterVoteStatus,
    } = formInput;
    try {
      if (
        voteId == 0 ||
        voteTypeId == 0 ||
        votingOfficeId == 0 ||
        candidateId == 0 ||
        voterId == 0
      ) {
        throw new Error("Please provide valids information.");
      }

      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect(); // Connect to Metamask wallet.
      const provider = new ethers.providers.Web3Provider(connection); // Specify provider.
      const signer = provider.getSigner(); // Get the Signers.

      const contract = new ethers.Contract(votingaddress, Voting.abi, signer); // Get Contract references.
      const transaction = await contract.castVote(
        voteId,
        voteTypeId,
        votingOfficeId,
        candidateId,
        voterId,
        voterVoteStatus
      ); // Call contract function.

      await transaction.wait();
      NotificationManager.success(
        "New record successfully saved.",
        "Save",
        5000
      );
      loadBallotBox();
    } catch (error) {
      NotificationManager.warning(
        "New record can not be saved. Please review your selection. Double vote would not be allowed.",
        "Save",
        8000
      );
      console.error(`saveBallotBox => ${error}`);
    }
  }

  return (
    <section className="flex flex-col justify-center">
      <p className="flex justify-center mt-2 text-xl text-orange-700">
        Cast new vote by voter
      </p>
      <article className="flex flex-row">
        <article className="grow ml-8 mt-2 mr-4">
          <div className="flex flex-col">
            <input
              placeholder="BallotBox ID"
              className="mt-2 border border-orange-100 rounded p-3"
              disabled
              onChange={(e) => {
                updateFormInput({ ...formInput, id: e.target.value });
              }}
            />
            <input
              placeholder="Candidate ID (eg. 10, 230, 50, etc.)"
              type="number"
              className="mt-2 border border-orange-200 rounded p-3"
              onChange={(e) => {
                updateFormInput({ ...formInput, candidateId: e.target.value });
              }}
              ref={initialFocusRef}
            />
            <input
              placeholder="Voter ID (Your personnal Unique ID)"
              type="number"
              className="mt-2 border border-orange-200 rounded p-3"
              onChange={(e) => {
                updateFormInput({ ...formInput, voterId: e.target.value });
              }}
            />
            <input
              placeholder="Voting Office ID (eg.1 for voting from Home or from Internet, 1120, etc.)"
              type="number"
              className="mt-2 border border-orange-200 rounded p-3"
              onChange={(e) => {
                updateFormInput({
                  ...formInput,
                  votingOfficeId: e.target.value,
                });
              }}
            />
            <select
              className="mt-2 border border-orange-200 rounded p-3"
              onChange={(e) => {
                updateFormInput({ ...formInput, voteTypeId: e.target.value });
              }}
            >
              {/* Default Choice */}
              <option>Choose Vote Type ID</option>
              {options.map((option) => {
                return (
                  <option key={option.key} value={option.key}>
                    {option.key}
                  </option>
                );
              })}
            </select>
            <input
              type="number"
              placeholder="Vote ID"
              className="mt-2 border border-orange-200 rounded p-3"
              onChange={(e) => {
                updateFormInput({
                  ...formInput,
                  voteId: e.target.value,
                });
              }}
            />
            <select
              name="status"
              id="status"
              className="mt-2 border border-orange-100 rounded p-3"
              onChange={(e) => {
                updateFormInput({
                  ...formInput,
                  voterVoteStatus: e.target.value,
                });
              }}
            >
              <option>
                The voter vote status (0 = Not voted, 1 = voted and 2 = blank)
              </option>
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
            <button
              onClick={saveBallotBox}
              className="font-bold mt-2 bg-gradient-to-r from-green-400 to to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-white rounded p-4 shadow-lg"
            >
              Save
            </button>
          </div>
        </article>
        <article className="grow mt-4 ml-4 mr-8 border border-orange-200 rounded p-3">
          <div>Candidate Picture</div>
        </article>
      </article>
      <article className="flex flex-col">
        <div className="flex justify-center mx-8 mt-4">
          <BallotBoxDataGrid dataLoad={dataLoad} />
        </div>
      </article>
      <article>
        <Footer />
      </article>
    </section>
  );
}

export default ballotBox;
