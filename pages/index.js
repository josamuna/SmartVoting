import { ethers } from "ethers";
import { useState, useEffect } from "react";
import axios from "axios";

import { votingaddress } from "../config"; // Contract Address
import Voting from "./abis/Voting.json"; // ABI

export default function Home() {
  const [candidates, setCandidates] = useState([]);
  const [loadingState, setLoadingState] = useState("Not-loaded");
  useEffect(() => {
    loadVotingData();
  }, []);

  // Load candidate for the current active vote
  async function loadVotingData() {
    try {
      const provider = new ethers.providers.JsonRpcProvider(); // Get provider
      const votingContract = new ethers.Contract(
        votingaddress,
        Voting.abi,
        provider
      ); // Get Contract reference
      const data = await votingContract.getCandidates(); // execute contract function

      const items = await Promise.all(
        data.map(async (i) => {
          const candidateUri = await votingContract.pictureURI(i.id); // picture uri
          const meta = await axios.get(candidateUri); // Get candidate Picture
          let item = {
            id: i.id,
            orderNumber: i.orderNumber,
            fullname: i.fullname,
            image: meta.data.image,
            user: i.user,
          };
          console.log(meta);
          return item;
        })
      );
      setCandidates(items);
      setLoadingState("Loaded");
    } catch (error) {
      console.log(`loadVotingData => ${error}`);
    }
  }

  if (loadingState === "Loaded" && !candidates.length) {
    return (
      <section className="h-auto px-10 py-10 text-2xl font-bol flex justify-center bg-gray-100 border-2">
        <p>There is no candidate.</p>
        {/* <footer className="flex  bg-gradient-to-b from-purple-300 to to-orange-100">
          <p className="flex justify-center">2023</p>
        </footer> */}
      </section>
    );
  }
}
