import {describe} from "mocha";
import {
    ALLOW_READ_PERMISSION_ID, ALLOW_SEND_FEEDBACK_PERMISSION_ID, ALLOW_VOTE_PERMISSION_ID,
    ALLOW_WRITE_PERMISSION_ID,
    connectSetup, delay, getMinsNano,
    setup,
    UNLIMITED_ACCESS_CONFIG_ID
} from "../utils";
import {Ed25519KeyIdentity} from "@dfinity/identity";
import {assert} from "chai";

describe('nested votings', () => {
    it('work fine', async () => {
        const user1Identity = Ed25519KeyIdentity.generate();
        const user1 = await setup(user1Identity);

        const user2Identity = Ed25519KeyIdentity.generate();
        const user2 = await setup(user2Identity);
        const user2Wallet1 = await connectSetup(user2Identity, user1.wallet.canisterId, user1.historyLedger.canisterId);

        // create an open group in wallet1 - group1
        const {group_id: wallet1GroupId} = await user1.wallet.actor.create_group({
            name: 'Group 1',
            description: 'test',
            transferable: true,
            private: false,
        });

        // create an access config for group1 to read voting info
        const {id: wallet1AccessConfigId} = await user1.wallet.actor.create_access_config({
            name: 'group1 can read voting info',
            description: '',
            allowees: [{Group : {id: wallet1GroupId, min_shares: 1n}}],
            permissions: [ALLOW_VOTE_PERMISSION_ID]
        });

        // create a voting config for group1
        const {id: wallet1VotingConfigId} = await user1.wallet.actor.create_voting_config({
            name: 'Voting config',
            description: 'test',
            // they can write anything with votings
            permissions: [ALLOW_WRITE_PERMISSION_ID],
            winners_count: [],
            choices_count: [],
            round: {round_delay: 0n, round_duration: getMinsNano(1)},
            approval: {
                // 500 shares is enough to approve this voting
                QuantityOf: {
                    quantity: 500n,
                    target: { Group : wallet1GroupId  }
                }
            },
            rejection: {
                FractionOf: {
                    fraction: '1.0',
                    target: { Group : wallet1GroupId  }
                }
            },
            // in order for this voting config to work all 100% of group members should vote
            quorum: {
                FractionOf: {
                    fraction: '1.0',
                    target: { Group : wallet1GroupId  }
                }
            },
            win: {
                FractionOf: {
                    fraction: '1.0',
                    target: { Group : wallet1GroupId  }
                }
            },
            next_round: {
                FractionOf: {
                    fraction: '0.2',
                    target: { Group : wallet1GroupId  }
                }
            }
        });

        // group1 contains wallet2 with 1000 shares
        await user1.wallet.actor.mint_group_shares({
            group_id: wallet1GroupId,
            owner: user2.wallet.canisterId,
            qty: 1000n
        });

        // group1 also contains some random voter with 500 shares
        const voter11 = await connectSetup(Ed25519KeyIdentity.generate(), user1.wallet.canisterId, user1.historyLedger.canisterId);
        await user1.wallet.actor.mint_group_shares({
            group_id: wallet1GroupId,
            owner: await voter11.agent.getPrincipal(),
            qty: 500n
        });


        // create an open group in wallet2 - group2
        const {group_id: wallet2GroupId} = await user2.wallet.actor.create_group({
            name: 'Group 2',
            description: 'test',
            transferable: true,
            private: false,
        });

        // group2 contains three random voters with 1000 shares each
        const voter21Identity = Ed25519KeyIdentity.generate();
        const voter21 = await connectSetup(voter21Identity, user2.wallet.canisterId, user2.historyLedger.canisterId);
        const voter22 = await connectSetup(Ed25519KeyIdentity.generate(), user2.wallet.canisterId, user2.historyLedger.canisterId);
        const voter23 = await connectSetup(Ed25519KeyIdentity.generate(), user2.wallet.canisterId, user2.historyLedger.canisterId);
        await user2.wallet.actor.mint_group_shares({
            group_id: wallet2GroupId,
            owner: await voter21.agent.getPrincipal(),
            qty: 1000n
        });
        await user2.wallet.actor.mint_group_shares({
            group_id: wallet2GroupId,
            owner: await voter22.agent.getPrincipal(),
            qty: 1000n
        });
        await user2.wallet.actor.mint_group_shares({
            group_id: wallet2GroupId,
            owner: await voter23.agent.getPrincipal(),
            qty: 1000n
        });

        // create a permission to read votings of wallet1
        const {id: wallet2PermissionId} = await user2.wallet.actor.create_permission({
            name: "read union1's votings",
            description: '',
            targets: [
                {Endpoint : { canister_id: user1.wallet.canisterId, method_name: 'list_votings' }},
            ]
        });

        // create an access config for group2 (so they can read remote votings and create and read local votings)
        const {id: wallet2AccessConfigId} = await user2.wallet.actor.create_access_config({
            permissions: [wallet2PermissionId, ALLOW_VOTE_PERMISSION_ID],
            name: 'group2 can read union1 votings',
            description: '',
            allowees: [{Group : { id: wallet2GroupId, min_shares: 1n} }]
        });

        voter21.walletAgent.setCurrentAccessConfig(wallet2AccessConfigId);
        voter22.walletAgent.setCurrentAccessConfig(wallet2AccessConfigId);
        voter23.walletAgent.setCurrentAccessConfig(wallet2AccessConfigId);

        // create a nested voting config for group2
        const {id: wallet2NestedVotingConfigId} = await user2.wallet.actor.create_nested_voting_config({
            remote_union_id: user1.wallet.canisterId,
            remote_voting_config_id: { Common : wallet1VotingConfigId },
            name: 'Nested voting config',
            description: 'Test',
            allowee_groups: [[wallet2GroupId, '1.0']],
            vote_calculation: { Total: null },
        });

        // start a voting
        const {id: wallet1VotingId} = await user1.wallet.actor.create_voting({
            voting_config_id: wallet1VotingConfigId,
            name: 'test',
            description: 'test',
            winners_need: 1
        });

        // add choices
        await user1.wallet.actor.create_voting_choice({
            voting_id: { Common : wallet1VotingId },
            name: 'create a profile for voter11',
            description: 'test',
            program: {
                RemoteCallSequence: [
                    {
                        endpoint: {
                            canister_id: user1.wallet.canisterId,
                            method_name: 'create_profile'
                        },
                        args: {
                            CandidString: [
                                `record { id = principal "${await voter11.agent.getPrincipal()}"; name = "voter11"; description = ""; }`
                            ]
                        },
                        cycles: 0n,
                    }
                ]
            },
        });

        const {voting} = await user1.wallet.actor.get_voting({
            id: wallet1VotingId,
            query_delegation_proof_opt: [],
        });

        // get shares info proof for voter11
        const {shares_info: [voter11SharesInfo]} = await voter11.walletPersonal.actor.get_my_shares_info_at({
            group_id: wallet1GroupId,
            at: voting.created_at
        });

        assert(voter11SharesInfo);

        // approve voting by voter11 (500 is enough to approve)
        await voter11.walletPersonal.actor.cast_my_vote({
            id: wallet1VotingId,
            vote: {
                Approval: {
                    shares_info: voter11SharesInfo!,
                }
            }
        });

        // wait for one minute for voting to start a new round
        await delay(1000 * 60);

        // voter21 wants to check new votings of wallet1
        // he needs a query delegation proof in order to do that
        const {proof} = await voter21.walletPersonal.actor.get_my_query_delegation_proof({
            requested_targets: [
                {
                    Endpoint: { canister_id: user1.wallet.canisterId, method_name: 'list_votings' },
                },
            ]
        });

        const voter21Wallet1 = await connectSetup(voter21Identity, user1.wallet.canisterId, user1.historyLedger.canisterId);
        const {page} = await voter21Wallet1.walletPersonal.actor.list_votings({
            page_req: {
                page_size: 100,
                page_index: 0,
                filter: null,
                sort: null
            },
            query_delegation_proof_opt: [proof]
        });

        // voter21 sees there is one new voting and he can participate in it through nested votings!
        assert(page.data.length == 1);
        const voting1 = page.data[0];

        // voter21 creates nested voting
        const {id: wallet2NestedVotingId} = await voter21.wallet.actor.create_nested_voting({
            remote_group_id: wallet1GroupId,
            remote_voting_id: { Common: wallet1VotingId },
            local_nested_voting_config_id: wallet2NestedVotingConfigId
        });

        // group2 voters get their shares info proofs
        const {shares_info: [voter21SharesInfo]} = await voter21.walletPersonal.actor.get_my_shares_info_at({
            group_id: wallet2GroupId,
            at: voting1.created_at
        });
        assert(voter21SharesInfo);

        const {shares_info: [voter22SharesInfo]} = await voter22.walletPersonal.actor.get_my_shares_info_at({
            group_id: wallet2GroupId,
            at: voting1.created_at
        });
        assert(voter22SharesInfo);

        const {shares_info: [voter23SharesInfo]} = await voter23.walletPersonal.actor.get_my_shares_info_at({
            group_id: wallet2GroupId,
            at: voting1.created_at
        });
        assert(voter23SharesInfo);

        const {nested_voting} = await voter21.wallet.actor.get_nested_voting({
            id: wallet2NestedVotingId,
            query_delegation_proof_opt: [],
        });

        assert(nested_voting.choices.length == 1);

        // group2 voters cast nested votes (using all the shares they have)
        await voter21.walletPersonal.actor.cast_my_nested_vote({
            id: wallet2NestedVotingId,
            vote: {
                shares_info: voter21SharesInfo!,
                vote: [[nested_voting.choices[0], '1.0']]
            }
        });

        await voter22.walletPersonal.actor.cast_my_nested_vote({
            id: wallet2NestedVotingId,
            vote: {
                shares_info: voter22SharesInfo!,
                vote: [[nested_voting.choices[0], '1.0']]
            }
        });

        await voter23.walletPersonal.actor.cast_my_nested_vote({
            id: wallet2NestedVotingId,
            vote: {
                shares_info: voter23SharesInfo!,
                vote: [[nested_voting.choices[0], '1.0']]
            }
        });

        // voter11 casts their vote also
        await voter11.walletPersonal.actor.cast_my_vote({
            id: wallet1VotingId,
            vote: {
                Common: {
                    shares_info: voter11SharesInfo!,
                    vote: [[voting1.choices[0], '1.0']]
                }
            }
        });

        // waiting for round to finish
        await delay(1000 * 60);

        // voting finished (it could only finish if all the votes in group1 were casted)
        // voter11 should have a profile now
        const {profile} = await voter11.walletPersonal.actor.get_my_profile();
        assert(profile.id.toText() == (await voter11.agent.getPrincipal()).toText());
    });
});