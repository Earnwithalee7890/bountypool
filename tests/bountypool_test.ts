// BountyPool Contract Test Suite
// Tests core bounty lifecycle: post, submit, approve, cancel, dispute

import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';

Clarinet.test({
    name: "post-bounty: issuer can create a bounty and STX are locked",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        let block = chain.mineBlock([
            Tx.contractCall('bountypool', 'post-bounty', [
                types.uint(1_000_000), // 1 STX
                types.utf8("Build a Clarity smart contract for token swaps"),
                types.uint(1000),       // duration in blocks
                types.ascii("clarity")
            ], deployer.address)
        ]);

        block.receipts[0].result.expectOk().expectUint(0);
        assertEquals(block.receipts[0].events.length, 1); // STX transfer event
    }
});

Clarinet.test({
    name: "submit-work: worker can submit work on an OPEN bounty",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const worker = accounts.get('wallet_1')!;

        chain.mineBlock([
            Tx.contractCall('bountypool', 'post-bounty', [
                types.uint(500_000),
                types.utf8("Write unit tests for paystream contract"),
                types.uint(500),
                types.ascii("testing")
            ], deployer.address)
        ]);

        let block = chain.mineBlock([
            Tx.contractCall('bountypool', 'submit-work', [
                types.uint(0)
            ], worker.address)
        ]);

        block.receipts[0].result.expectOk().expectBool(true);
    }
});

Clarinet.test({
    name: "approve-and-pay: issuer pays worker net of platform fee",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const worker = accounts.get('wallet_1')!;

        chain.mineBlock([
            Tx.contractCall('bountypool', 'post-bounty', [
                types.uint(10_000_000),
                types.utf8("Implement cross-chain bridge prototype"),
                types.uint(2000),
                types.ascii("bridge")
            ], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall('bountypool', 'submit-work', [types.uint(0)], worker.address)
        ]);

        let block = chain.mineBlock([
            Tx.contractCall('bountypool', 'approve-and-pay', [types.uint(0)], deployer.address)
        ]);

        block.receipts[0].result.expectOk().expectBool(true);
    }
});

Clarinet.test({
    name: "cancel-bounty: issuer can cancel OPEN bounty and get refund",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        chain.mineBlock([
            Tx.contractCall('bountypool', 'post-bounty', [
                types.uint(2_000_000),
                types.utf8("Audit existing contracts for vulnerabilities"),
                types.uint(300),
                types.ascii("security")
            ], deployer.address)
        ]);

        let block = chain.mineBlock([
            Tx.contractCall('bountypool', 'cancel-bounty', [types.uint(0)], deployer.address)
        ]);

        block.receipts[0].result.expectOk().expectBool(true);
    }
});

Clarinet.test({
    name: "raise-dispute: assignee can dispute SUBMITTED bounty",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const worker = accounts.get('wallet_1')!;

        chain.mineBlock([
            Tx.contractCall('bountypool', 'post-bounty', [
                types.uint(5_000_000),
                types.utf8("Design and deploy DID registry on Stacks testnet"),
                types.uint(800),
                types.ascii("identity")
            ], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall('bountypool', 'submit-work', [types.uint(0)], worker.address)
        ]);

        let block = chain.mineBlock([
            Tx.contractCall('bountypool', 'raise-dispute', [
                types.uint(0),
                types.utf8("Work does not meet quality standards")
            ], deployer.address)
        ]);

        block.receipts[0].result.expectOk().expectBool(true);
    }
});
