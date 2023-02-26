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

import CandidateDataGrid from "@components/CandidateDataGrid";

import { create } from "ipfs-http-client"; // Usefull for accessing IPFS (eg. Infura).

import { votingaddress } from "../config"; // Contract Address.
import Voting from "./abis/Voting.json"; // ABI.
import axios from "axios";

// Getting secret key for the project from .env file | Not work properly
// const ProjectID = process.env.REACT_APP_INFURA_PROJECT_ID;
// const ProjectSecret = process.env.REACT_APP_INFURA_PROJECT_SECRET;
const ProjectID = "2M5FapgcNJ1jta8dwYnF7BiG33z";
const ProjectSecret = "fccd21c83c191ac4b5c3c27faae320ec";

// Required parameters from Infura Documentation
const auth =
  "Basic " + Buffer.from(ProjectID + ":" + ProjectSecret).toString("base64");
const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

function candidate() {
  const initialFocusRef = useRef(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    id: 0,
    orderNumber: 0,
    fullname: "",
    pictureURI: "",
  });

  const [dataLoad, setDataLoad] = useState([]); // State trigger returned saved data.

  // Using useEffect to trigger re-rendering after values have been saved.
  useEffect(() => {
    initialFocusRef.current.focus(); // Set the focus.
    loadCandidate(); // Load data each time we re-rendering.
  }, []);

  // Manage file loading for candidate
  async function onChange(e) {
    const file = e.target.files[0];

    try {
      const added = await client.add(file, {
        progress: (progress) => console.log(`received:${progress}`),
      });
      // add farmated selected file path to the infura path (From ou project inside infura).
      const url = `https://smartvoting.infura-ipfs.io/ipfs/${added.path}`;
      // console.log("CandidateOnlyPictureUri =>", url);
      setFileUrl(url);
    } catch (error) {
      console.error(`onChange-FileLoading => ${error}`);
    }
  }

  // Load candidate records
  async function loadCandidate() {
    try {
      const provider = new ethers.providers.JsonRpcProvider();
      const contract = new ethers.Contract(votingaddress, Voting.abi, provider);
      const data = await contract.getCandidates();

      const items = await Promise.all(
        data.map(async (i) => {
          const meta = await axios.get(i.pictureURI);
          let item = {
            id: i.id.toNumber(), // Convert BigInt to JavaScript Number.
            orderNumber: i.orderNumber.toNumber(), // Convert BigInt to JavaScript Number
            fullname: i.fullname,
            pictureURI: i.pictureURI,
            image: meta.data.image, // Fetch Candidate picture from the IPFS URI
            user: i.user,
          };
          return item;
        })
      );
      setDataLoad(items); // Set State data.
    } catch (error) {
      console.error(`loadCandidate => ${error}`);
    }
  }

  // Savae new candidate record.
  async function saveCandidate() {
    const { orderNumber, fullname } = formInput;
    try {
      if (!orderNumber || !fullname) {
        throw new Error(
          "Please provide valid order number, fullname and candidate's picture."
        );
      }
      // Format candidate picture to have the finale URL
      const data = JSON.stringify({
        fullname,
        orderNumber,
        image: fileUrl,
      });

      // Format candidate picture to have the finale URL (By adding his fullname and ordernumber)
      const added = await client.add(data);
      const url = `https://smartvoting.infura-ipfs.io/ipfs/${added.path}`;
      console.log(`saveCandidate => CandidateUrlPictureMetaData: ${url}`);

      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect(); // Connect to Metamask wallet.
      const provider = new ethers.providers.Web3Provider(connection); // Specify provider.
      const signer = provider.getSigner(); // Get the Signers.

      const contract = new ethers.Contract(votingaddress, Voting.abi, signer); // Get Contract references.
      const transaction = await contract.setCandidate(
        orderNumber,
        fullname,
        url
      ); // Call contract function.

      await transaction.wait();
      NotificationManager.success(
        "New record successfully saved.",
        "Save",
        5000
      );
      loadCandidate();
    } catch (error) {
      NotificationManager.warning(
        "New record can not be saved. Make sure candidate's infos are properly filled included his picture.",
        "Save",
        12000
      );
      console.error(`saveCandidate => ${error}`);
    }
  }

  return (
    <section>
      <article className="flex flex-col">
        <p className="flex justify-center mt-2 text-xl text-orange-700">
          Register Candidates
        </p>
      </article>
      <article className="flex flex-row">
        <article className="grow ml-8 mr-4 mt-2">
          <div className="flex flex-col">
            <input
              placeholder="Candidate ID"
              className="mt-2 border border-orange-100 rounded p-3"
              disabled
              onChange={(e) => {
                updateFormInput({ ...formInput, id: e.target.value });
              }}
            />
            <input
              placeholder="Order Number"
              type="number"
              className="mt-2 border border-orange-200 rounded p-3"
              onChange={(e) => {
                updateFormInput({
                  ...formInput,
                  orderNumber: e.target.value,
                });
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
            <input
              type="file"
              name="asset"
              placeholder="Candidate picture file"
              className="mt-2 border border-orange-200 rounded p-3"
              onChange={onChange}
            />
            {/* {fileUrl && (
              <img
                className="rounded mt-2"
                // src={fileUrl}
                alt="Candidate picture"
                width={150}
                height={150}
              />
            )} */}
            <button
              onClick={saveCandidate}
              className="font-bold mt-2 bg-gradient-to-r from-green-400 to to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-white rounded p-4 shadow-lg"
            >
              Save
            </button>
          </div>
        </article>
        <div className="grow flex justify-center mr-8 ml-4 mt-4 p-0 border border-orange-200 rounded">
          <div className="flex justify-center w-72 h-72 my-2">
            {fileUrl && <img src={fileUrl} alt="Candidate Picture" />}
          </div>
        </div>
      </article>
      <article className="flex flex-col">
        <article>
          <NotificationContainer />
        </article>
        <article className="flex justify-center mx-8 mt-4">
          <CandidateDataGrid dataLoad={dataLoad} />
        </article>
      </article>
      <article className="mt-4">
        <Footer />
      </article>
    </section>
  );
}

export default candidate;
