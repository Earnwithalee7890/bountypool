// BountyPool TypeScript SDK
// Interact with the BountyPool Clarity contract from TypeScript

import { StacksMainnet, StacksTestnet } from '@stacks/network';
import {
    makeContractCall,
    broadcastTransaction,
    standardPrincipalCV,
    uintCV,
    stringUtf8CV,
    stringAsciiCV,
    AnchorMode,
    PostConditionMode,
    FungibleConditionCode,
    makeStandardSTXPostCondition
} from '@stacks/transactions';

export interface BountyPostParams {
    amount: number;       // in microSTX
    description: string;
    durationBlocks: number;
    skillTag: string;
    senderKey: string;
}

export interface BountySDKConfig {
    contractAddress: string;
    contractName: string;
    network: 'mainnet' | 'testnet';
}

export class BountyPoolSDK {
    private config: BountySDKConfig;
    private network: StacksMainnet | StacksTestnet;

    constructor(config: BountySDKConfig) {
        this.config = config;
        this.network = config.network === 'mainnet'
            ? new StacksMainnet()
            : new StacksTestnet();
    }

    /**
     * Post a new bounty on-chain, locking STX in the contract.
     */
    async postBounty(params: BountyPostParams): Promise<string> {
        const postCondition = makeStandardSTXPostCondition(
            params.senderKey,
            FungibleConditionCode.Equal,
            BigInt(params.amount)
        );

        const tx = await makeContractCall({
            contractAddress: this.config.contractAddress,
            contractName: this.config.contractName,
            functionName: 'post-bounty',
            functionArgs: [
                uintCV(params.amount),
                stringUtf8CV(params.description),
                uintCV(params.durationBlocks),
                stringAsciiCV(params.skillTag)
            ],
            senderKey: params.senderKey,
            network: this.network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Deny,
            postConditions: [postCondition],
        });

        const result = await broadcastTransaction(tx, this.network);
        return result.txid;
    }

    /**
     * Submit work for a specific open bounty.
     */
    async submitWork(bountyId: number, senderKey: string): Promise<string> {
        const tx = await makeContractCall({
            contractAddress: this.config.contractAddress,
            contractName: this.config.contractName,
            functionName: 'submit-work',
            functionArgs: [uintCV(bountyId)],
            senderKey,
            network: this.network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        });

        const result = await broadcastTransaction(tx, this.network);
        return result.txid;
    }

    /**
     * Approve submitted work and release payment to worker.
     */
    async approveAndPay(bountyId: number, senderKey: string): Promise<string> {
        const tx = await makeContractCall({
            contractAddress: this.config.contractAddress,
            contractName: this.config.contractName,
            functionName: 'approve-and-pay',
            functionArgs: [uintCV(bountyId)],
            senderKey,
            network: this.network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        });

        const result = await broadcastTransaction(tx, this.network);
        return result.txid;
    }

    /**
     * Cancel an open bounty and retrieve locked funds.
     */
    async cancelBounty(bountyId: number, senderKey: string): Promise<string> {
        const tx = await makeContractCall({
            contractAddress: this.config.contractAddress,
            contractName: this.config.contractName,
            functionName: 'cancel-bounty',
            functionArgs: [uintCV(bountyId)],
            senderKey,
            network: this.network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        });

        const result = await broadcastTransaction(tx, this.network);
        return result.txid;
    }

    /**
     * Raise a dispute on a submitted bounty.
     */
    async raiseDispute(bountyId: number, reason: string, senderKey: string): Promise<string> {
        const tx = await makeContractCall({
            contractAddress: this.config.contractAddress,
            contractName: this.config.contractName,
            functionName: 'raise-dispute',
            functionArgs: [uintCV(bountyId), stringUtf8CV(reason)],
            senderKey,
            network: this.network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        });

        const result = await broadcastTransaction(tx, this.network);
        return result.txid;
    }
}
