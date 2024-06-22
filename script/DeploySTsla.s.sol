// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script } from "forge-std/Script.sol";
import { HelperConfig } from "./HelperConfig.sol";
import { sTSLA } from "../src/sTSLA.sol";

contract DeploySTsla is Script {
    function run() external {
        // Initialize HelperConfig
        HelperConfig helperConfig = new HelperConfig();

        // Get parameters
        (address tslaFeed, address ethFeed) = getdTslaRequirements(helperConfig);

        // Ensure parameters are valid
        require(tslaFeed != address(0), "Invalid tslaFeed address");
        require(ethFeed != address(0), "Invalid ethFeed address");

        // Start broadcasting transactions
        vm.startBroadcast();
        deploySTSLA(tslaFeed, ethFeed);
        vm.stopBroadcast();
    }

    function getdTslaRequirements(HelperConfig helperConfig) public view returns (address, address) {
        (address tslaFeed, , address ethFeed, , , , , , , , , ) = helperConfig.activeNetworkConfig();

        // Log the feed addresses for debugging
        emit log_named_address("TSLA Feed Address", tslaFeed);
        emit log_named_address("ETH Feed Address", ethFeed);

        return (tslaFeed, ethFeed);
    }

    function deploySTSLA(address tslaFeed, address ethFeed) public returns (sTSLA) {
        sTSLA stsla = new sTSLA(tslaFeed, ethFeed);
        emit log_named_address
    }
}