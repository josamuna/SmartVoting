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
    id: 0,
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

  // Load vote results records.
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
        data.map(async (i, key) => {
          let item = {
            id: key + 1, // Use map inde as a key ID.
            voteId: i.voteId.toNumber(), // Convert BigInt to JavaScript Number.
            candidateId: i.candidateId.toNumber(),
            candidateNumber: i.candidateNumber.toNumber(),
            candidateFullName: i.candidateFullName,
            votesCast: i.votesCast.toNumber(),
            votesBlank: i.votesBlank.toNumber(),
            candidatePercentage: i.candidatePercentage.toNumber().toFixed(2),
            blankPercentage: i.blankPercentage.toNumber().toFixed(2),
          };
          return item;
        })
      );
      // Set the winner according to current vote
      const max = items.map((x) => Math.max(x));
      console.log("x = ", max);
      const tb = items.filter((h) => Math.max(h.votesCast));
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
    <section>
      <article className="flex flex-col">
        <p className="flex justify-center mt-2 mb-2 text-xl text-orange-700">
          Results of the election
        </p>
      </article>
      <article className="flex flex-row">
        <div className="grow mr-2 ml-8 mt-4">
          <input
            placeholder="Vote ID"
            type="number"
            className="w-full border border-orange-200 rounded p-3"
            onChange={(e) => {
              updateFormInput({ ...formInput, voteId: e.target.value });
            }}
            ref={initialFocusRef}
          />
        </div>
        <div className="grow mx-2 mt-4">
          <input
            placeholder="Winner's Candidate fullname"
            className="w-full border border-orange-100 rounded p-3"
            disabled
          />
        </div>
        <div className="grow mx-2 mt-4">
          <input
            placeholder="Number of Blank votes"
            type="number"
            className="w-full border border-orange-100 rounded p-3"
            disabled
          />
        </div>
        <div className="grow mx-2 mt-4">
          <input
            placeholder="Percentage of Blank votes"
            type="number"
            className="w-full border border-orange-100 rounded p-3"
            disabled
          />
        </div>
        <div className="grow mx-2 mt-4">
          <input
            placeholder="Winner's Percentage of vote"
            type="number"
            className="w-full border border-orange-100 rounded p-3"
            disabled
          />
        </div>
        <div className="grow ml-2 mt-4 mr-8">
          <button
            onClick={() => loadVoteResults(formInput.voteId)}
            className="w-full font-bold bg-gradient-to-r from-green-400 to to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-white rounded p-3 shadow-lg"
          >
            Load Results
          </button>
        </div>
      </article>
      <article className="flex flex-col">
        <div className="flex justify-center border mx-8 mt-4">
          <VoteResultsDataGrid dataLoad={dataLoad} />
        </div>
      </article>
      <article>
        <NotificationContainer />
      </article>
      <article className="mt-8">
        <Footer />
      </article>
    </section>
  );
}

export default voteResults;
