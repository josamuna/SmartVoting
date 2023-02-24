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

import RegisterCandidateDataGrid from "@components/RegisterCandidateDataGrid";

import { votingaddress } from "../config"; // Contract Address.
import Voting from "./abis/Voting.json"; // ABI.

function registerCandidate() {
  const initialFocusRef = useRef(null);
  const [formInput, updateFormInput] = useState({
    voteId: 0,
    candidateIds: [],
  });
  const [dataLoad, setDataLoad] = useState([]); // State trigger returned saved data.

  // Using useEffect to trigger re-rendering after values have been saved.
  useEffect(() => {
    initialFocusRef.current.focus(); // Set the focus.
    loadRegisterCandidate(4); // Load data each time we re-rendering.formInput.voteId
  }, []);

  // Load vote Type records
  async function loadRegisterCandidate(voteId) {
    try {
      console.log("voteId => ", voteId);

      const provider = new ethers.providers.JsonRpcProvider();
      const contract = new ethers.Contract(votingaddress, Voting.abi, provider);
      const data = await contract.getRegisterCandidateForVote(voteId);

      //   console.log("Length =>", data1.length, data2.length);
      //   console.log("data2", data2, typeof data2);
      //   const items = await Promise.resolve({
      //     voteId: data1.toNumber(),
      //     candidateIds: data2.toNumber(),
      //   });
      const items = Promise.all(
        data.map(async (i) => {
          let item = {
            voteId: i.voteId.toNumber(), // Convert BigInt to JavaScript Number.
            candidateIds: i.candidateIds.toNumber(), // Array of all candidate ID to be registered
          };
          return item;
        })
      );
      console.log("items => ", items);
      setDataLoad(items); // Set State data.
    } catch (error) {
      console.error(`loadRegisterCandidate => ${error}`);
    }
  }

  // Save new candidate for the vote.
  async function saveRegisterCandidate() {
    const { voteId, candidateIds } = formInput;
    try {
      if (!candidateIds) {
        throw new Error(
          "Please provide valid candidate IDs like 45,20,2, 578,.... with comma."
        );
      } else if (voteId == 0) {
        throw new Error("Invalid vote ID provided.");
      }

      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect(); // Connect to Metamask wallet.
      const provider = new ethers.providers.Web3Provider(connection); // Specify provider.
      const signer = provider.getSigner(); // Get the Signers.

      const contract = new ethers.Contract(votingaddress, Voting.abi, signer); // Get Contract references.
      const candidateArr = candidateIds.split(",");
      const transaction = await contract.registerCandidateForVote(
        voteId,
        candidateArr
      ); // Call contract function.

      await transaction.wait();
      NotificationManager.success(
        "New record successfully saved.",
        "Save",
        5000
      );
      loadRegisterCandidate(voteId);
    } catch (error) {
      NotificationManager.warning(
        "New record can not be saved. Please provide valid candidate IDs like 45,20,2, 578,.... with comma and valid vote ID",
        "Save",
        8000
      );
      console.error(`loadRegisterCandidate => ${error}`);
    }
  }

  return (
    <section className="flex flex-col justify-center">
      <article className="flex justify-center pb-4">
        <div className="w-1/2 flex flex-col justify-center">
          <input
            disabled
            className="mt-1 border border-orange-100 rounded p-1"
          />
          <input
            placeholder="Vote ID"
            type="number"
            className="mt-2 border border-orange-100 rounded p-3"
            onChange={(e) => {
              updateFormInput({ ...formInput, voteId: e.target.value });
            }}
            ref={initialFocusRef}
          />
          <textarea
            placeholder="Candidates IDs. Accepted format is like 45,20,2, 578,.... with comma."
            className="mt-2 h-32 border border-orange-200 rounded p-3"
            style={{ resize: "none" }}
            onChange={(e) => {
              updateFormInput({ ...formInput, candidateIds: e.target.value });
            }}
          ></textarea>
          <button
            onClick={saveRegisterCandidate}
            className="font-bold mt-2 bg-gradient-to-r from-green-400 to to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-white rounded p-4 shadow-lg"
          >
            Save
          </button>
          {console.log("formInput.voteId => ", formInput.voteId)}
          <button
            onClick={() => loadRegisterCandidate(formInput.voteId)}
            className="font-bold mt-4 bg-gradient-to-r from-blue-400 to to-green-500 hover:from-yellow-500 hover:to-pink-500 text-white rounded p-4 shadow-lg"
          >
            Show register candidates
          </button>
        </div>
      </article>
      <article>
        <NotificationContainer />
      </article>
      {/* <article className="flex justify-center mx-64">
        <RegisterCandidateDataGrid dataLoad={dataLoad} />
      </article> */}
      <article>
        <Footer />
      </article>
    </section>
  );
}

export default registerCandidate;
