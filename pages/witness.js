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

import WitnessDataGrid from "@components/WitnessDataGrid";

import { witnessuseradress } from "config"; // Contract Address.
import Witness from "./abis/WitnessUser.json"; // ABI.

function witness() {
  const initialFocusRef = useRef(null);
  const [formInput, updateFormInput] = useState({
    id: 0,
    fullname: "",
    organization: "",
  });
  const [dataLoad, setDataLoad] = useState([]); // State trigger returned saved data.

  // Using useEffect to trigger re-rendering after values have been saved.
  useEffect(() => {
    initialFocusRef.current.focus(); // Set the focus.
    loadWitness(); // Load data each time we re-rendering.
  }, []);

  // Load witness records
  async function loadWitness() {
    try {
      const provider = new ethers.providers.JsonRpcProvider();
      const contract = new ethers.Contract(
        witnessuseradress,
        Witness.abi,
        provider
      );
      const data = await contract.getWitnesses();

      const items = await Promise.all(
        data.map(async (i) => {
          let item = {
            id: i.id.toNumber(), // Convert BigInt to JavaScript Number.
            fullname: i.fullname,
            organization: i.organization,
            user: i.user,
          };
          return item;
        })
      );
      setDataLoad(items); // Set State data.
    } catch (error) {
      console.error(`loadWitnesses => ${error}`);
    }
  }

  // Savae new Witness record.
  async function saveWitness() {
    const { fullname, organization } = formInput;
    try {
      if (!fullname || !organization) {
        throw new Error("Please provide valid fullname and organization.");
      }
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect(); // Connect to Metamask wallet.
      const provider = new ethers.providers.Web3Provider(connection); // Specify provider.
      const signer = provider.getSigner(); // Get the Signers.

      const contract = new ethers.Contract(
        witnessuseradress,
        Witness.abi,
        signer
      ); // Get Contract references.
      const transaction = await contract.setWitness(organization, fullname); // Call contract function.

      await transaction.wait();
      NotificationManager.success(
        "New record successfully saved.",
        "Save",
        5000
      );
      loadWitness();
    } catch (error) {
      NotificationManager.warning("New record can not be saved.", "Save", 8000);
      console.error(`saveWitness => ${error}`);
    }
  }

  return (
    <section>
      <article className="flex flex-col">
        <p className="flex justify-center mt-2 mb-2 text-xl text-orange-700">
          Register witnesses for the voting process
        </p>
      </article>
      <article className="flex flex-col justify-center">
        <article className="flex justify-center pb-4">
          <div className="w-1/2 flex flex-col justify-center">
            <input
              placeholder="Witness ID"
              className="mt-2 border border-orange-100 rounded p-3"
              disabled
              onChange={(e) => {
                updateFormInput({ ...formInput, id: e.target.value });
              }}
            />
            <input
              placeholder="Organization"
              className="mt-2 border border-orange-200 rounded p-3"
              onChange={(e) => {
                updateFormInput({ ...formInput, organization: e.target.value });
              }}
              ref={initialFocusRef}
            />
            <input
              placeholder="Fullname"
              className="mt-2 border border-orange-200 rounded p-3"
              onChange={(e) => {
                updateFormInput({ ...formInput, fullname: e.target.value });
              }}
            />
            <button
              onClick={saveWitness}
              className="font-bold mt-2 bg-gradient-to-r from-green-400 to to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-white rounded p-4 shadow-lg"
            >
              Save
            </button>
          </div>
        </article>
        <article>
          <NotificationContainer />
        </article>
        <article className="flex justify-center mx-24">
          <WitnessDataGrid dataLoad={dataLoad} />
        </article>
        <article>
          <Footer />
        </article>
      </article>
    </section>
  );
}

export default witness;
