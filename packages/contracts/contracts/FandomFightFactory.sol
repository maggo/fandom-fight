// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {StorageSlot} from "@openzeppelin/contracts/utils/StorageSlot.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {FandomFight} from "./FandomFight.sol";

contract FandomFightFactory is UUPSUpgradeable, AccessControlUpgradeable {
    using StorageSlot for bytes32;

    // keccak256("com.fandomfight.master_copy");
    bytes32 public constant FANDOMFIGHT_MASTER_COPY_SLOT =
        0x8b2d9f54c1aa8b2db671d198d956833c48d829617aebbf2f92fa43d4ad98e1f8;
    // keccak256("com.fandomfight.nonce");
    bytes32 public constant NONCE_SLOT =
        0x344d6e7af2c83053b6c1f2a1ad8d44a1ea3802bca13e7095f351c4cbad8d5b8b;

    address public feeRecipient;
    uint256 public feeBps;

    event FandomFightCreated(
        address indexed fandomFightProxy,
        address indexed fandomFightImplementation,
        address indexed deployer
    );

    constructor() {
        _disableInitializers();
    }

    function init(
        address fandomFightMasterCopy,
        address feeRecipient_,
        uint256 feeBps_
    ) public initializer {
        __UUPSUpgradeable_init();
        __AccessControl_init();

        FANDOMFIGHT_MASTER_COPY_SLOT
            .getAddressSlot()
            .value = fandomFightMasterCopy;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        feeRecipient = feeRecipient_;
        feeBps = feeBps_;
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal virtual override onlyRole(DEFAULT_ADMIN_ROLE) {}

    function computeSalt(uint256 nonce) internal pure returns (bytes32) {
        return keccak256(abi.encode(nonce, "fandomFight"));
    }

    function computeNextAddress() external view returns (address) {
        uint256 nonce = NONCE_SLOT.getUint256Slot().value;
        bytes32 salt = computeSalt(nonce);
        return
            Clones.predictDeterministicAddress(
                FANDOMFIGHT_MASTER_COPY_SLOT.getAddressSlot().value,
                salt
            );
    }

    function create(
        FandomFight.Choice[] calldata choices_,
        uint256 minimumPrice_,
        uint256 minimumPriceIncreaseBps_,
        uint bidDelay_,
        uint falloffDelay_,
        uint falloffDuration_,
        address beneficiary_
    ) external returns (address) {
        uint256 nonce = NONCE_SLOT.getUint256Slot().value++;
        bytes32 salt = computeSalt(nonce);
        address fandomFightMasterCopy = FANDOMFIGHT_MASTER_COPY_SLOT
            .getAddressSlot()
            .value;
        // Deploy & init proxy
        address payable fandomFightProxy = payable(
            Clones.cloneDeterministic(fandomFightMasterCopy, salt)
        );
        FandomFight(fandomFightProxy).init({
            owner_: msg.sender,
            choices_: choices_,
            minimumPrice_: minimumPrice_,
            minimumPriceIncreaseBps_: minimumPriceIncreaseBps_,
            bidDelay_: bidDelay_,
            falloffDelay_: falloffDelay_,
            falloffDuration_: falloffDuration_,
            beneficiary_: beneficiary_,
            feeRecipient_: feeRecipient,
            feeBps_: feeBps
        });
        emit FandomFightCreated(
            fandomFightProxy,
            fandomFightMasterCopy,
            msg.sender
        );
        return fandomFightProxy;
    }

    function setFeeRecipient(
        address feeRecipient_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        feeRecipient = feeRecipient_;
    }

    function setFeeBps(uint256 feeBps_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        feeBps = feeBps_;
    }
}
