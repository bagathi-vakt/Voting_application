// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Voting {
    string[] public parties = ["BJP", "AAP", "INC"];
    mapping(string => uint256) public voteMap;
    mapping(string => bool) public userVoted;
    mapping(string => string) public voter_party;

    event Vote(string voter, string party);

    function getArray() public view returns (string[] memory) {
        return parties;
    }

    function add(string memory s) public {
        parties.push(s);
    }

    function getVotes(string memory party) public view returns (uint256) {
        return voteMap[party];
    }

    function isVoted(string memory voter) public view returns (bool) {
        return userVoted[voter];
    }

    function vote(string memory voter, string memory party) public {
        voteMap[party] += 1;
        userVoted[voter] = true;
        voter_party[voter] = party;
        emit Vote(voter, party);
    }
}
