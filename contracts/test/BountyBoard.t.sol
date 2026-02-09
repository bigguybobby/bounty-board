// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/BountyBoard.sol";

contract BountyBoardTest is Test {
    BountyBoard bb;
    address creator = makeAddr("creator");
    address hunter = makeAddr("hunter");
    address alice = makeAddr("alice");

    function setUp() public {
        vm.warp(10000);
        bb = new BountyBoard(100); // 1% fee
        vm.deal(creator, 100 ether);
        vm.deal(alice, 10 ether);
    }

    function _create() internal returns (uint256) {
        vm.prank(creator);
        return bb.create{value: 1 ether}(block.timestamp + 30 days, "Fix bug");
    }

    // ─── Constructor ─────────────────────────────────────────────────
    function test_constructor() public view { assertEq(bb.platformFee(), 100); }
    function test_constructor_highFee() public { vm.expectRevert("fee too high"); new BountyBoard(501); }

    // ─── Create ──────────────────────────────────────────────────────
    function test_create() public { uint256 id = _create(); assertEq(id, 0); assertEq(bb.bountyCount(), 1); }
    function test_create_noReward() public { vm.prank(creator); vm.expectRevert("no reward"); bb.create(block.timestamp+1, "x"); }
    function test_create_pastDeadline() public { vm.prank(creator); vm.expectRevert("past deadline"); bb.create{value: 1 ether}(block.timestamp-1, "x"); }
    function test_create_emptyDesc() public { vm.prank(creator); vm.expectRevert("empty desc"); bb.create{value: 1 ether}(block.timestamp+1, ""); }

    // ─── Submit ──────────────────────────────────────────────────────
    function test_submit() public {
        _create();
        vm.prank(hunter); bb.submit(0, "PR #123");
        (,,, BountyBoard.Status s, address h) = bb.getBounty(0);
        assertEq(uint8(s), uint8(BountyBoard.Status.Submitted));
        assertEq(h, hunter);
    }
    function test_submit_notOpen() public { _create(); vm.prank(hunter); bb.submit(0, "x"); vm.prank(alice); vm.expectRevert("not open"); bb.submit(0, "y"); }
    function test_submit_expired() public { _create(); vm.warp(block.timestamp + 31 days); vm.prank(hunter); vm.expectRevert("expired"); bb.submit(0, "x"); }
    function test_submit_creator() public { _create(); vm.prank(creator); vm.expectRevert("creator cant submit"); bb.submit(0, "x"); }
    function test_submit_emptyWork() public { _create(); vm.prank(hunter); vm.expectRevert("empty work"); bb.submit(0, ""); }

    // ─── Approve ─────────────────────────────────────────────────────
    function test_approve() public {
        _create();
        vm.prank(hunter); bb.submit(0, "done");
        uint256 bal = hunter.balance;
        vm.prank(creator); bb.approve(0);
        assertEq(hunter.balance, bal + 0.99 ether); // 1% fee
        assertEq(bb.feesCollected(), 0.01 ether);
    }
    function test_approve_notCreator() public { _create(); vm.prank(hunter); bb.submit(0, "done"); vm.prank(alice); vm.expectRevert("not creator"); bb.approve(0); }
    function test_approve_notSubmitted() public { _create(); vm.prank(creator); vm.expectRevert("not submitted"); bb.approve(0); }

    // ─── Reject ──────────────────────────────────────────────────────
    function test_reject() public {
        _create();
        vm.prank(hunter); bb.submit(0, "bad work");
        vm.prank(creator); bb.reject(0);
        (,,, BountyBoard.Status s,) = bb.getBounty(0);
        assertEq(uint8(s), uint8(BountyBoard.Status.Open));
    }
    function test_reject_notCreator() public { _create(); vm.prank(hunter); bb.submit(0, "x"); vm.prank(alice); vm.expectRevert("not creator"); bb.reject(0); }

    // ─── Cancel ──────────────────────────────────────────────────────
    function test_cancel() public {
        _create();
        uint256 bal = creator.balance;
        vm.prank(creator); bb.cancel(0);
        assertEq(creator.balance, bal + 1 ether);
    }
    function test_cancel_notCreator() public { _create(); vm.prank(alice); vm.expectRevert("not creator"); bb.cancel(0); }
    function test_cancel_notOpen() public { _create(); vm.prank(creator); bb.cancel(0); vm.prank(creator); vm.expectRevert("not open"); bb.cancel(0); }

    // ─── Fees ────────────────────────────────────────────────────────
    function test_withdrawFees() public {
        _create();
        vm.prank(hunter); bb.submit(0, "done");
        vm.prank(creator); bb.approve(0);
        uint256 bal = address(this).balance;
        bb.withdrawFees();
        assertEq(address(this).balance, bal + 0.01 ether);
    }
    function test_withdrawFees_none() public { vm.expectRevert("no fees"); bb.withdrawFees(); }

    receive() external payable {}
}
