import "./App.css";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Message from "./components/Message";
import Voting from "./artifacts/contracts/Voting.sol/Voting.json";

const VotingAddress = "0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf";
const provider = new ethers.providers.JsonRpcProvider();
const contract = new ethers.Contract(VotingAddress, Voting.abi, provider);

let privateKey =
  "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
let wallet = new ethers.Wallet(privateKey, provider);
let contractWithSigner = contract.connect(wallet);

function App() {
  const [party, setParty] = useState("");
  const [listofParties, setListofParties] = useState([]);
  const [name, setName] = useState("");
  const [voters, setVoters] = useState([]);
  const [VoteDetails, setVoteDetails] = useState({}); //{voter:party}
  const [VoteResult, setVoteResult] = useState({});
  const onChangeParty = (e) => {
    setParty(e.target.value);
  };
  useEffect(() => {
    const fun = async () => {
      try {
        const s = await contract.getArray();
        // console.log("list of parties ", s);
        setListofParties(s);
        setParty(s[0]);
      } catch (err) {
        console.log("error is ", err);
      }
    };
    fun();

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
  }, []);

  useEffect(() => {
    let resObj = {};
    listofParties.forEach((party) => (resObj[party] = 0));
    setVoteResult(resObj);
  }, [listofParties]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log(e);
    if (name.length === 0) return;
    let message;
    const isUserVoted = await contract.isVoted(name);
    // console.log(`user ${name} voted ?`, isUserVoted);
    if (!isUserVoted) {
      // console.log(`party is ${party}`);
      const tx = await contractWithSigner.vote(name, party);
      const receipt = await tx.wait();
      // console.log(receipt);
      message = "User Voted Successfully";
    } else {
      message = "User already voted";
    }
    console.log(message);
  };

  return (
    <div className="App">
      <h4>Voting</h4>
      <form onSubmit={handleSubmit}>
        Name : <input onChange={(e) => setName(e.target.value)} />
        Party : <Dropdown onChange={onChangeParty} options={listofParties} />
        <button>Submit Vote</button>
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
