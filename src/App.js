import "./App.css";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Voting from "./artifacts/contracts/Voting.sol/Voting.json";

const VotingAddress = "0x108669E38f1AF26C99DeD6374487E00d726024AD";
var provider, contract;

function App() {
  const [party, setParty] = useState("");
  const [listofParties, setListofParties] = useState([]);
  const [voters, setVoters] = useState([]);
  const [VoteDetails, setVoteDetails] = useState({}); //{voter:party}
  const [VoteResult, setVoteResult] = useState({});
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const onChangeParty = (e) => {
    setParty(e.target.value);
  };

  const initializeEvents = () => {
    //event for voting

    contract.on("Vote", (voterName, partyName) => {
      const obj = VoteDetails;

      console.log(voterName, partyName);
      // if (typeof obj[voterName] !== "undefined") return;

      //add votername to voters state
      setVoters((prevState) => [...prevState, voterName]);

      //update the VoteDetails state
      obj[voterName] = partyName;
      setVoteDetails(obj);

      //update the party count (VoteResult state)
      setVoteResult((previousResultState) => {
        previousResultState[partyName] = previousResultState[partyName] + 1;
        return previousResultState;
      });
    });

    //event for account changing

    window.ethereum.on("accountsChanged", function (accounts) {
      // Time to reload your interface with accounts[0]!
      setAddress(accounts[0]);
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage("");
    }, 1500);

    const fun = async () => {
      try {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        const address = await provider.getCode(VotingAddress);
        // console.log("address is ", address);
        const response = await provider.send("eth_requestAccounts", []);
        // console.log("res ", response);
        setAddress(response[0]);
        contract = new ethers.Contract(VotingAddress, Voting.abi, provider);
        initializeEvents();
        const s = await contract.getArray();

        console.log("list of parties ", s);
        setListofParties(s);
        setParty(s[0]);
      } catch (err) {
        console.log("error is ", err);
      }
    };
    fun();

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let resObj = {};
    listofParties.forEach((party) => (resObj[party] = 0));
    setVoteResult(resObj);
  }, [listofParties]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log(e);
    let message;
    const isUserVoted = await contract.isVoted(address);
    // console.log(`user ${name} voted ?`, isUserVoted);
    if (!isUserVoted) {
      // console.log(`party is ${party}`);

      const signer = provider.getSigner();

      const contract = new ethers.Contract(VotingAddress, Voting.abi, signer);

      const tx = await contract.vote(address, party);
      const receipt = await tx.wait();
      // console.log(receipt);
      message = "User Voted Successfully";
    } else {
      message = "User already voted";
    }
    // console.log(message);
    setMessage(message);
  };

  return (
    <div className="App">
      <h4>Voting</h4>
      <form onSubmit={handleSubmit}>
        {/* Name : <input onChange={(e) => setName(e.target.value)} /> */}
        <h3> Current User: {address} </h3>
        Party : <Dropdown onChange={onChangeParty} options={listofParties} />
        <button>Submit Vote</button>
        {message}
      </form>

      <h3>Vote Details</h3>
      {voters.map((VoterName, index) => {
        // console.log("hello");
        return (
          <div key={index}>
            {VoterName}: {VoteDetails[VoterName]}
          </div>
        );
      })}

      <h3>Results</h3>
      {listofParties.map((party) => {
        return (
          <div key={party}>
            {party}: {VoteResult[party]}
          </div>
        );
      })}
    </div>
  );
}
const Dropdown = ({ options, onChange }) => {
  return (
    <label>
      <select onChange={onChange}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
};

export default App;
