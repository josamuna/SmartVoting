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

import VotingOfficeDataGrid from "@components/VotingOfficeDataGrid";

import { votingofficeuseraddress } from "../config"; // Contract Address.
import VotingOffice from "./abis/VotingOfficeUser.json"; // ABI.

function votingOffice() {
  const initialFocusRef = useRef(null);
  const [formInput, updateFormInput] = useState({
    id: 0,
    designation: "",
  });
  const [dataLoad, setDataLoad] = useState([]); // State trigger returned saved data.

  // Using useEffect to trigger re-rendering after values have been saved.
  useEffect(() => {
    initialFocusRef.current.focus(); // Set the focus.
    loadVotingOffice(); // Load data each time we re-rendering.
  }, []);

  // Load voting office records
  async function loadVotingOffice() {
    try {
      const provider = new ethers.providers.JsonRpcProvider();
      const contract = new ethers.Contract(
        votingofficeuseraddress,
        VotingOffice.abi,
        provider
      );
      const data = await contract.getVotingOffices();

      const items = await Promise.all(
        data.map(async (i) => {
          let item = {
            id: i.id.toNumber(), // Convert BigInt to JavaScript Number.
            designation: i.designation,
            user: i.user,
          };
          return item;
        })
      );
      setDataLoad(items); // Set State data.
    } catch (error) {
      console.error(`loadVotingOffice => ${error}`);
    }
  }

  // Save new Voting Office record.
  async function saveVotingOffice() {
    const { designation, description } = formInput;
    try {
      if (!designation) {
        throw new Error("Please provide valid designation.");
      }
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect(); // Connect to Metamask wallet.
      const provider = new ethers.providers.Web3Provider(connection); // Specify provider.
      const signer = provider.getSigner(); // Get the Signers.

      const contract = new ethers.Contract(
        votingofficeuseraddress,
        VotingOffice.abi,
        signer
      ); // Get Contract references.
      const transaction = await contract.setVotingOffice(designation); // Call contract function.

      await transaction.wait();
      NotificationManager.success(
        "New record successfully saved.",
        "Save",
        5000
      );
      loadVotingOffice();
    } catch (error) {
      NotificationManager.warning("New record can not be saved.", "Save", 8000);
      console.error(`saveVotingOffice => ${error}`);
    }
  }

  return (
    <section>
      <article className="flex flex-col">
        <p className="flex justify-center mt-2 mb-2 text-xl text-orange-700">
          Register Voting office for the voting process
        </p>
      </article>
      <article className="flex flex-col justify-center">
        <article className="flex justify-center pb-4">
          <div className="w-1/2 flex flex-col justify-center">
            <input
              placeholder="Voting Office ID"
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
            <button
              onClick={saveVotingOffice}
              className="font-bold mt-2 bg-gradient-to-r from-green-400 to to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-white rounded p-4 shadow-lg"
            >
              Save
            </button>
          </div>
        </article>
        <article>
          <NotificationContainer />
        </article>
        <article className="flex justify-center mx-36">
          <VotingOfficeDataGrid dataLoad={dataLoad} />
        </article>
        <article>
          <Footer />
        </article>
      </article>
    </section>
  );
}

export default votingOffice;
