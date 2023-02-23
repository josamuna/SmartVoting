import React from "react";
import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css"; // To handle beautifull React Notification.
import Footer from "@components/Footer";

import VoteResultsDataGrid from "@components/VoteResultsDataGrid";

import { votingaddress } from "../config"; // Contract Address.
import Voting from "./abis/Voting.json"; // ABI.

function voteResults() {
  const initialFocusRef = useRef(null);
  const [formInput, updateFormInput] = useState({
    voteId: 0,
    // candidateId: 0,
    // candidateNumber: 0,
    // candidateFullName: "",
    // votesCast: 0,
    // votesBlank: 0,
    // candidatePercentage: 0,
    // blankPercentage: 0,
  });
  const [winner, setWinner] = useState({
    voteId: 0,
    candidateId: 0,
    candidateNumber: 0,
    candidateFullName: "",
    votesCast: 0,
    votesBlank: 0,
    candidatePercentage: 0,
    blankPercentage: 0,
  });
  const [dataLoad, setDataLoad] = useState([]); // State trigger returned saved data.

  // Using useEffect to trigger re-rendering after values have been saved.
  useEffect(() => {
    initialFocusRef.current.focus(); // Set the focus.
  }, []);

  // Load vote results records
  async function loadVoteResults(voteId) {
    // const { voteId } = formInput;
    try {
      if (voteId == 0) {
        throw new Error("Invalid Vote ID provided.");
      }

      const provider = new ethers.providers.JsonRpcProvider();
      const contract = new ethers.Contract(votingaddress, Voting.abi, provider);
      const data = await contract.getVoteResults(voteId);

      const items = await Promise.all(
        data.map(async (i) => {
          let item = {
            voteId: i.voteId.toNumber(), // Convert BigInt to JavaScript Number.
            candidateId: i.candidateId.toNumber(),
            candidateFullName: i.candidateFullName,
            votesCast: i.votesCast.toNumber(),
            votesBlank: i.votesBlank.toNumber(),
            candidatePercentage: i.candidatePercentage.toNumber(),
            blankPercentage: i.blankPercentage.toNumber(),
          };
          return item;
        })
      );
      // Set the winner according to current vote
      setWinner(items.filter((results) => Math.max(results.votesCast)));
      console.log(winner);
      setDataLoad(items); // Set State data.
      if (items.length === 0) {
        NotificationManager.info(
          "There is no results to show for this vote ID.",
          "Vote Results",
          8000
        );
      }
    } catch (error) {
      NotificationManager.warning(
        "Something went wrong. Make sure your are selecting the proper vote.",
        "Vote Results",
        8000
      );
      console.error(`loadVoteResults => ${error}`);
    }
  }

  return (
    <section className="flex flex-col justify-center">
      <article className="flex justify-center pb-4">
        <div className="w-1/2 flex flex-col justify-center">
          <input
            placeholder="The fullname of winner Candidate will appear here"
            className="mt-2 border border-orange-100 rounded p-3"
            disabled
          />
          <input
            placeholder="Vote ID"
            type="number"
            className="mt-2 border border-orange-200 rounded p-3"
            onChange={(e) => {
              updateFormInput({ ...formInput, voteId: e.target.value });
            }}
            ref={initialFocusRef}
          />
          <input
            placeholder="Total amount of Blank votes"
            type="number"
            className="mt-2 border border-orange-100 rounded p-3"
            disabled
          />
          <input
            placeholder="Total percentage of Blank votes"
            type="number"
            className="mt-2 border border-orange-100 rounded p-3"
            disabled
          />
          <input
            placeholder="Percentage of the winner"
            type="number"
            className="mt-2 border border-orange-100 rounded p-3"
            disabled
          />
          <button
            onClick={() => loadVoteResults(formInput.voteId)}
            className="font-bold mt-2 bg-gradient-to-r from-green-400 to to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-white rounded p-4 shadow-lg"
          >
            Load Results
          </button>
        </div>
      </article>
      <article>
        <NotificationContainer />
      </article>
      <article className="flex justify-center mx-4">
        <VoteResultsDataGrid dataLoad={dataLoad} />
      </article>
      <article>
        <Footer />
      </article>
    </section>
  );
}

export default voteResults;
