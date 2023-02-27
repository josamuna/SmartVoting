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
  const [voterRows, setVoterRows] = useState(0);
  const [formInput, updateFormInput] = useState({
    id: 0,
    address: "",
    oldAddress: "",
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
      setVoterRows(items.length); // Update state
      setDataLoad(items); // Set State data.
    } catch (error) {
      console.error(`loadVoters => ${error}`);
    }
  }

  async function updateVoterAddress() {
    try {
      const { oldAddress, address } = formInput;
      if (!oldAddress || !address) {
        throw new Error(
          "Please provide valids old and new addresses (In format of 0xf3c3...)."
        );
      }

      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(votingaddress, Voting.abi, signer);
      const transaction = await contract.updateVoter(oldAddress, address);

      await transaction.wait();
      NotificationManager.success(
        "Voter's Address successfully updated.",
        "Update Voter's Address",
        5000
      );
      loadVoter();
    } catch (error) {
      NotificationManager.warning(
        "Update voter's address has failed.",
        "Update Voter's Address",
        8000
      );
      console.error(`updateVoterAddress => ${error}`);
    }
  }

  // Save new Voter record.
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

  if (voterRows > 0) {
    return (
      <section>
        <article className="flex flex-col">
          <p className="flex justify-center mt-2 mb-2 text-xl text-orange-700">
            Register a voter
          </p>
        </article>
        <article className="flex flex-col justify-center">
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
                placeholder="Old Address (Like: 0xe7f1725e7734ce288f8367e1bb143e90bb3f0512)"
                className="mt-2 border border-orange-200 rounded p-3"
                onChange={(e) => {
                  updateFormInput({ ...formInput, oldAddress: e.target.value });
                }}
              />
              <input
                placeholder="New Address / Address (Like: 0x5fbdb2315678afecb367f032d93f642f64180aa3)"
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
                Save
              </button>
              <button
                onClick={updateVoterAddress}
                className="font-bold mt-2 bg-gradient-to-r from-blue-400 to to-green-500 hover:from-yellow-500 hover:to-pink-500 text-white rounded p-4 shadow-lg"
              >
                Update Voter Address
              </button>
            </div>
          </article>
          <article>
            <NotificationContainer />
          </article>
          <article className="flex justify-center mx-64 my-4">
            <VoterDataGrid dataLoad={dataLoad} />
          </article>
          {/* <article>
            <Footer />
          </article> */}
        </article>
      </section>
    );
  }

  return (
    <section>
      <article className="flex flex-col">
        <p className="flex justify-center mt-2 mb-2 text-xl text-orange-700">
          Register a voter
        </p>
      </article>
      <article className="flex flex-col justify-center">
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
              Save
            </button>
          </div>
        </article>
        <article>
          <NotificationContainer />
        </article>
        <article className="flex justify-center mx-64 my-4">
          <VoterDataGrid dataLoad={dataLoad} />
        </article>
        {/* <article>
          <Footer />
        </article> */}
      </article>
    </section>
  );
}

export default voter;
