// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FandomFight is Initializable, OwnableUpgradeable, ReentrancyGuard {
    struct Choice {
        string imageURI;
        string title;
        string url;
    }

    struct LastBid {
        address bidder;
        uint256 price;
        uint16 choice;
        uint timestamp;
    }

    LastBid public lastBid;

    Choice[] public choices;
    uint256 public minimumPrice;
    uint256 public minimumPriceIncreaseBps;
    uint public bidDelay;
    uint public falloffDelay;
    uint public falloffDuration;
    address public beneficiary;
    address public feeRecipient;
    uint256 public feeBps;

    event NewBid(address indexed bidder, uint256 price, uint16 choice);

    constructor() {
        _disableInitializers();
    }

    function init(
        address owner_,
        Choice[] calldata choices_,
        uint256 minimumPrice_,
        uint256 minimumPriceIncreaseBps_,
        uint bidDelay_,
        uint falloffDelay_,
        uint falloffDuration_,
        address beneficiary_,
        address feeRecipient_,
        uint256 feeBps_
    ) public initializer {
        __Ownable_init(owner_);

        require(choices_.length > 1, "Must have at least two choices");

        choices = choices_;
        minimumPrice = minimumPrice_;
        minimumPriceIncreaseBps = minimumPriceIncreaseBps_;
        bidDelay = bidDelay_;
        falloffDelay = falloffDelay_;
        falloffDuration = falloffDuration_;
        beneficiary = beneficiary_;
        feeRecipient = feeRecipient_;
        feeBps = feeBps_;
    }

    function getCurrentMinimumPrice() public view returns (uint256) {
        // First price is minimum price
        if (lastBid.price == 0) {
            return minimumPrice;
        }

        // Get minimum price, lastBid.price + x%
        uint256 minimumPriceIncrement = (lastBid.price *
            minimumPriceIncreaseBps) / 10000;

        uint falloffStartTimestamp = lastBid.timestamp + falloffDelay;
        uint256 currentMinimumPrice = lastBid.price + minimumPriceIncrement;

        // Return minimum price if we haven't reached falloff yet
        if (block.timestamp < falloffStartTimestamp) {
            return currentMinimumPrice;
        }

        // Calculate discount
        uint falloffEndTimestamp = falloffStartTimestamp + falloffDuration;

        // Return minimum price if we've reached the end of the falloff
        if (block.timestamp > falloffEndTimestamp) {
            return minimumPrice;
        }

        // Map discounted price
        uint256 currentDiscountedPrice = _mapRange({
            x: block.timestamp,
            min_x: falloffStartTimestamp,
            max_x: falloffEndTimestamp,
            a: currentMinimumPrice,
            b: minimumPrice
        });

        return currentDiscountedPrice;
    }

    function bid(uint16 choice) external payable nonReentrant {
        require(choice >= 0 && choice < choices.length, "Invalid choice");

        require(
            block.timestamp >= lastBid.timestamp + bidDelay,
            "Can only bid after delay has passed"
        );

        uint256 currentMinimumPrice = getCurrentMinimumPrice();

        require(
            msg.value >= currentMinimumPrice,
            "Bid must be greater than or equal to current minimum price"
        );

        // Send fee to feeRecipient
        uint256 fee = (msg.value * feeBps) / 10000;
        (bool feeSent, ) = feeRecipient.call{value: fee}("");
        require(feeSent, "Failed to send fee");

        // Send 10% cashback to last bidder
        if (lastBid.bidder != address(0)) {
            uint256 cashback = (msg.value * 1000) / 10000;
            (bool cashbackSent, ) = lastBid.bidder.call{value: cashback}("");
            require(cashbackSent, "Failed to send cashback");
        }

        // Send remainder to beneficiary
        (bool bidSent, ) = beneficiary.call{value: address(this).balance}("");
        require(bidSent, "Failed to send bid amount");

        lastBid = LastBid({
            bidder: msg.sender,
            price: msg.value,
            choice: choice,
            timestamp: block.timestamp
        });

        emit NewBid({bidder: msg.sender, price: msg.value, choice: choice});
    }

    function getAllChoices() external view returns (Choice[] memory) {
        return choices;
    }

    function _mapRange(
        uint256 x,
        uint256 min_x,
        uint256 max_x,
        uint256 a,
        uint256 b
    ) public pure returns (uint256) {
        require(min_x < max_x, "Invalid input range");

        if (a <= b) {
            return ((b - a) * (x - min_x)) / (max_x - min_x) + a;
        } else {
            return ((a - b) * (max_x - x)) / (max_x - min_x) + b;
        }
    }
}
