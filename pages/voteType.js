import React from "react";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

import { votingaddress } from "../config"; // Contract Address
import Voting from "../constants/Voting.json"; // ABI

function voteType() {
  const [formInput, updateFormInput] = useState({
    id: 0,
    designation: "",
    description: "",
  });

  async function loadVoteType() {
    try {
      const provider = new ethers.providers.JsonRpcProvider();
      const votingContract = new ethers.Contract(
        votingaddress,
        Voting.abi,
        provider
      );
      const data = await votingContract.getVoteTypes();

      const item = await Promise.all(
        data.map(async (i) => {
          let item = {
            id: i.id,
            designation: i.designation,
            description: i.description,
            user: i.user,
          };
          console.log(item);
          return item;
        })
      );
    } catch (error) {
      console.log(error);
    }
  }

  async function saveVoteType() {
    const { designation, description } = formInput;
    try {
      if (!designation || !description) {
        return;
      }
      console.log("inside");
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect(); // Connect to Metamask wallet
      const provider = new ethers.providers.Web3Provider(connection); // Specify provider
      const signer = provider.getSigner(); // Get the Signers

      let votingContrat = ethers.Contract(votingaddress, Voting.abi, signer); // Get Contract references
      const transaction = await votingContrat.setVoteType(
        designation,
        description
      );
      const tx = await transaction.wait();

      // Use event to retreive values inserted
      const event = tx.events[0];
      console.log("event emit: ", event);
      let value = event.args[2];

      await transaction.wait();
      console.log("voteType saved successfully");
      loadVoteType();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <section className="flex justify-center">
      <article className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Vote Type ID"
          className="mt-8 border-orange-100 rounded p-4"
          disabled
          onChange={(e) => {
            updateFormInput({ ...formInput, id: e.target.value });
          }}
        />
        <input
          placeholder="Designation"
          className="mt-2 border-orange-600 rounded p-4"
          onChange={(e) => {
            updateFormInput({ ...formInput, description: e.target.value });
          }}
        />
        <input
          placeholder="Description"
          className="mt-2 border-orange-600 rounded p-4"
          onChange={(e) => {
            updateFormInput({ ...formInput, description: e.target.value });
          }}
        />
        <button
          onClick={console.log("Yes")}
          className="font-bold mt-4 bg-gradient-to-r from-green-400 to to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-white rounded p-4 shadow-lg"
        >
          Save
        </button>
      </article>
    </section>
  );
}

export default voteType;
