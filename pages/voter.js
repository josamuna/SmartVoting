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

import VoterDataGrid from "@components/VoterDataGrid";

import { votingaddress } from "config"; // Contract Address.
import Voting from "./abis/Voting.json"; // ABI.

function voter() {
  const initialFocusRef = useRef(null);
  const [isIdExist, setIsIdExist] = useState(false);
  const [formInput, updateFormInput] = useState({
    id: 0,
    address: "",
  });
  const [dataLoad, setDataLoad] = useState([]); // State trigger returned saved data.

  // Using useEffect to trigger re-rendering after values have been saved.
  useEffect(() => {
    initialFocusRef.current.focus(); // Set the focus.
    loadVoter(); // Load data each time we re-rendering.
  }, []);

  // Load Voter records
  async function loadVoter() {
    try {
      const provider = new ethers.providers.JsonRpcProvider();
      const contract = new ethers.Contract(votingaddress, Voting.abi, provider);
      const data = await contract.getVoters();

      const items = await Promise.all(
        data.map(async (i) => {
          let item = {
            id: i.id.toNumber(), // Convert BigInt to JavaScript Number.
            voter: i.voter,
          };
          return item;
        })
      );
      setDataLoad(items); // Set State data.
    } catch (error) {
      console.error(`loadVoters => ${error}`);
    }
  }

  // Savae new Voter record.
  async function saveVoter() {
    const { address } = formInput;
    try {
      if (!address) {
        throw new Error(
          "Please provide valid address (In format of 0xf3c3...)."
        );
      }
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect(); // Connect to Metamask wallet.
      const provider = new ethers.providers.Web3Provider(connection); // Specify provider.
      const signer = provider.getSigner(); // Get the Signers.

      const contract = new ethers.Contract(votingaddress, Voting.abi, signer); // Get Contract references.
      const transaction = await contract.setVoter(address); // Call contract function.

      await transaction.wait();
      NotificationManager.success(
        "New record successfully saved.",
        "Save",
        5000
      );
      loadVoter();
    } catch (error) {
      NotificationManager.warning("New record can not be saved.", "Save", 8000);
      console.error(`saveVoters => ${error}`);
    }
  }

  return (
    <section className="flex flex-col justify-center">
      <article className="flex justify-center pb-4">
        <div className="w-1/2 flex flex-col justify-center">
          <input
            placeholder="Voter Unique ID"
            className="mt-2 border border-orange-100 rounded p-3"
            disabled
            onChange={(e) => {
              updateFormInput({ ...formInput, id: e.target.value });
            }}
          />
          <input
            placeholder="Address (Like: 0xe7f1725e7734ce288f8367e1bb143e90bb3f0512)"
            className="mt-2 border border-orange-200 rounded p-3"
            onChange={(e) => {
              updateFormInput({ ...formInput, address: e.target.value });
            }}
            ref={initialFocusRef}
          />
          <button
            onClick={saveVoter}
            className="font-bold mt-2 bg-gradient-to-r from-green-400 to to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-white rounded p-4 shadow-lg"
          >
            {(() => {
              if (isIdExist) {
                return "Update";
              } else {
                return "Save";
              }
            })()}
          </button>
        </div>
      </article>
      <article>
        <NotificationContainer />
      </article>
      <article className="flex justify-center mx-64">
        <VoterDataGrid dataLoad={dataLoad} />
      </article>
      <article>
        <Footer />
      </article>
    </section>
  );
}

export default voter;
