// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

pragma solidity 0.8.6;

// Errors
error WitnessNotFound();

contract WitnessUser is Ownable {
    // State variables
    // witnessId => witnessStruct
    mapping(uint256 => Witness) public witnessInfo;

    // Counter to handle IDs
    using Counters for Counters.Counter;

    Counters.Counter private _witnessIds;

    // Represent a witness who acts as observator.
    struct Witness {
        uint256 id;
        string fullname;
        string organization;
        address user;
    }

    // Events
    event NewWitness(
        uint256 indexed witnessId,
        string indexed fullname,
        string organization,
        address indexed user
    );
    event UpdateWitness(
        uint256 indexed witnessId,
        string indexed fullname,
        string indexed organization,
        address user
    );

    // Array to hold data.
    Witness[] private s_witness;

    // Modifiers
    // Check wheter witness exist before update related infos.
    modifier witnessExist(uint256 _witnessId) {
        if (witnessInfo[_witnessId].id != _witnessId) {
            revert WitnessNotFound();
        }
        _;
    }

    // Add new witness.
    function setWitness(
        string calldata _organization,
        string calldata _fullname
    ) public {
        // Check than the string is not null.
        require(
            bytes(_fullname).length != 0 && bytes(_organization).length != 0,
            "Please provide a valid organization and fullname."
        );

        // Creating new witness ID from Counters.
        _witnessIds.increment();
        uint256 _witnessId = _witnessIds.current();

        witnessInfo[_witnessId] = Witness({
            id: _witnessId,
            fullname: _fullname,
            organization: _organization,
            user: msg.sender
        });

        // Populate the witness array to hold all valides values.
        s_witness.push(witnessInfo[_witnessId]);

        emit NewWitness(_witnessId, _fullname, _organization, msg.sender);
    }

    // Update witness details.
    function updateWitness(
        uint256 _witnessId,
        string calldata _organization,
        string calldata _fullname
    ) public onlyOwner witnessExist(_witnessId) {
        // Check than the string is not null.
        require(
            bytes(_fullname).length != 0 || bytes(_organization).length != 0,
            "Please provide a valid organization and fullname."
        );

        // Update the mapping record.
        witnessInfo[_witnessId] = Witness({
            id: _witnessId,
            fullname: _fullname,
            organization: _organization,
            user: msg.sender
        });

        // Update the witness array record to hold all valides values.
        s_witness[_witnessId - 1] = witnessInfo[_witnessId];

        emit UpdateWitness(_witnessId, _fullname, _organization, msg.sender);
    }

    // Get All witness inside a single array of struct.
    function getWitnesses() public view returns (Witness[] memory) {
        return s_witness;
    }
}
