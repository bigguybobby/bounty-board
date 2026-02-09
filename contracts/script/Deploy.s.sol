// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/BountyBoard.sol";

contract DeployBountyBoard is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        uint256 platformFee = 100; // 1% = 100 bps

        vm.startBroadcast(deployerPrivateKey);
        BountyBoard bb = new BountyBoard(platformFee);
        vm.stopBroadcast();

        console.log("BountyBoard deployed at:", address(bb));
        console.log("Platform fee:", platformFee, "bps");
        console.log("Owner:", msg.sender);
    }
}
