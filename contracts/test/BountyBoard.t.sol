// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/BountyBoard.sol";

contract BountyBoardTest is Test {
    BountyBoard bb;
    address alice; // creator
    address bob = makeAddr("bob");
    address charlie = makeAddr("charlie");

    function setUp() public {
        vm.warp(10000);
        alice = address(this);
        bb = new BountyBoard();
        vm.deal(alice, 100 ether);
        vm.deal(bob, 10 ether);
    }

    function _createBounty() internal returns (uint256) {
        return bb.createBounty{value: 5 ether}("Fix bug", block.timestamp + 7 days);
    }

    function _submitBob() internal {
        vm.prank(bob);
        bb.submit(0, "Here is the fix");
    }

    // ─── Create ──────────────────────────────────────────────────────
    function test_create() public {
        uint256 id = _createBounty();
        assertEq(id, 0);
        assertEq(bb.bountyCount(), 1);
    }

    function test_create_zeroReward() public { vm.expectRevert("zero reward"); bb.createBounty("x", block.timestamp + 1 days); }
    function test_create_emptyTitle() public { vm.expectRevert("empty title"); bb.createBounty{value: 1 ether}("", block.timestamp + 1 days); }
    function test_create_pastDeadline() public { vm.expectRevert("past deadline"); bb.createBounty{value: 1 ether}("x", block.timestamp - 1); }

    // ─── Submit ──────────────────────────────────────────────────────
    function test_submit() public {
        _createBounty();
        _submitBob();
        assertTrue(bb.hasSubmitted(0, bob));
    }

    function test_submit_creatorCant() public {
        _createBounty();
        vm.expectRevert("creator cant submit");
        bb.submit(0, "my own fix");
    }

    function test_submit_alreadySubmitted() public {
        _createBounty();
        _submitBob();
        vm.prank(bob); vm.expectRevert("already submitted"); bb.submit(0, "again");
    }

    function test_submit_pastDeadline() public {
        _createBounty();
        vm.warp(block.timestamp + 8 days);
        vm.prank(bob); vm.expectRevert("past deadline"); bb.submit(0, "late");
    }

    function test_submit_emptyDetails() public {
        _createBounty();
        vm.prank(bob); vm.expectRevert("empty details"); bb.submit(0, "");
    }

    // ─── Award ───────────────────────────────────────────────────────
    function test_award() public {
        _createBounty();
        _submitBob();
        uint256 bobBal = bob.balance;
        bb.award(0, 0);
        assertEq(bob.balance, bobBal + 5 ether);
    }

    function test_award_notCreator() public {
        _createBounty();
        _submitBob();
        vm.prank(bob); vm.expectRevert("not creator"); bb.award(0, 0);
    }

    function test_award_invalidSub() public {
        _createBounty();
        vm.expectRevert("invalid submission"); bb.award(0, 0);
    }

    function test_award_alreadyCompleted() public {
        _createBounty();
        _submitBob();
        bb.award(0, 0);
        vm.expectRevert("not open"); bb.award(0, 0);
    }

    // ─── Cancel ──────────────────────────────────────────────────────
    function test_cancel() public {
        _createBounty();
        vm.warp(block.timestamp + 7 days);
        uint256 bal = alice.balance;
        bb.cancel(0);
        assertEq(alice.balance, bal + 5 ether);
    }

    function test_cancel_notCreator() public {
        _createBounty();
        vm.warp(block.timestamp + 7 days);
        vm.prank(bob); vm.expectRevert("not creator"); bb.cancel(0);
    }

    function test_cancel_notExpired() public {
        _createBounty();
        vm.expectRevert("not expired"); bb.cancel(0);
    }

    // ─── Views ───────────────────────────────────────────────────────
    function test_getBounty() public {
        _createBounty();
        (address creator, string memory title, uint256 reward,,,, ) = bb.getBounty(0);
        assertEq(creator, alice);
        assertEq(title, "Fix bug");
        assertEq(reward, 5 ether);
    }

    function test_getSubmission() public {
        _createBounty();
        _submitBob();
        (address submitter, string memory details,) = bb.getSubmission(0, 0);
        assertEq(submitter, bob);
        assertEq(details, "Here is the fix");
    }

    receive() external payable {}
}
