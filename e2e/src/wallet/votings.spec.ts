import {
    ALLOW_VOTE_ACCESS_CONFIG_ID,
    connectSetup, delay,
    EMERGENCY_VOTING_CONFIG_ID,
    HAS_PROFILE_GROUP_ID,
    ISetup,
    setup,
    UNLIMITED_ACCESS_CONFIG_ID
} from "../utils";
import {Ed25519KeyIdentity} from "@dfinity/identity";
import {CreateVotingRequest, SharesInfo, UpdateAccessConfigRequest} from "dfx-type/wallet/wallet";
import {assert} from "chai";
import {Principal} from "@dfinity/principal";
import {IDL} from "@dfinity/candid";

describe('votings', () => {
    let walletCreator: ISetup;

    beforeEach(async () => {
        walletCreator = await setup(Ed25519KeyIdentity.generate());
    });

    it('votings should work fine', async () => {
        const user1 = await connectSetup(Ed25519KeyIdentity.generate(), walletCreator.wallet.canisterId, walletCreator.historyLedger.canisterId);
        const user2 = await connectSetup(Ed25519KeyIdentity.generate(), walletCreator.wallet.canisterId, walletCreator.historyLedger.canisterId);

        await walletCreator.wallet.actor.create_profile({
            id: await user1.agent.getPrincipal(),
            name: 'User1',
            description: ''
        });
        await walletCreator.wallet.actor.create_profile({
            id: await user2.agent.getPrincipal(),
            name: 'User2',
            description: ''
        });

        await user1.walletPersonal.actor.accept_my_group_shares({
            group_id: HAS_PROFILE_GROUP_ID,
            qty: 100n
        });
        user1.walletAgent.setCurrentAccessConfig(ALLOW_VOTE_ACCESS_CONFIG_ID);

        await user2.walletPersonal.actor.accept_my_group_shares({
            group_id: HAS_PROFILE_GROUP_ID,
            qty: 100n
        });
        user2.walletAgent.setCurrentAccessConfig(ALLOW_VOTE_ACCESS_CONFIG_ID);

        await walletCreator.wallet.actor.update_access_config({
            id: UNLIMITED_ACCESS_CONFIG_ID,
            new_name: [],
            new_description: [],
            new_permissions: [],
            new_allowees: [[]]
        });
        walletCreator.walletAgent.setCurrentAccessConfig(ALLOW_VOTE_ACCESS_CONFIG_ID);

        // THERE IS NOTHING SPECIAL ABOUT WALLET CREATOR ANYMORE - ALL OF THEM ARE JUST 'Has profile' GROUP MEMBERS NOW

        const {id: votingId} = await user1.wallet.actor.create_voting({
            name: 'Test',
            description: 'Lets make us a new king!',
            voting_config_id: EMERGENCY_VOTING_CONFIG_ID,
            winners_need: 1
        });

        const updateAccessConfigRequestType = IDL.Record({
            id: IDL.Nat64,
            new_name: IDL.Opt(IDL.Text),
            new_description: IDL.Opt(IDL.Text),
            new_permissions: IDL.Opt(IDL.Vec(IDL.Nat64)),
            new_allowees: IDL.Opt(IDL.Vec(IDL.Variant({
                Everyone: IDL.Null,
                Group: IDL.Record({
                    id: IDL.Nat64,
                    min_shares: IDL.Nat,
                }),
                Profile: IDL.Principal,
            })))
        });

        const updateAccessConfigRequest: UpdateAccessConfigRequest = {
            id: UNLIMITED_ACCESS_CONFIG_ID,
            new_name: [],
            new_description: [],
            new_permissions: [],
            new_allowees: [[{Profile: await user1.agent.getPrincipal()}]]
        };

        await user1.wallet.actor.create_voting_choice({
            name: 'Make user1 a king',
            description: 'test',
            voting_id: votingId,
            program: {
                RemoteCallSequence: [{
                    endpoint: {canister_id: user1.wallet.canisterId, method_name: 'update_access_config'},
                    args: {
                        Encoded: [...IDL.encode([updateAccessConfigRequestType], [updateAccessConfigRequest])]
                    },
                    cycles: 0n,
                }]
            }
        });

        updateAccessConfigRequest.new_allowees = [[{Profile: await user2.agent.getPrincipal()}]];

        await user1.wallet.actor.create_voting_choice({
            name: 'Make user2 a king',
            description: 'test',
            voting_id: votingId,
            program: {
                RemoteCallSequence: [{
                    endpoint: {canister_id: user1.wallet.canisterId, method_name: 'update_access_config'},
                    args: {
                        Encoded: [...IDL.encode([updateAccessConfigRequestType], [updateAccessConfigRequest])]
                    },
                    cycles: 0n,
                }]
            }
        });

        updateAccessConfigRequest.new_allowees = [[{Profile: await walletCreator.agent.getPrincipal()}]];

        await user1.wallet.actor.create_voting_choice({
            name: 'Make wallet creator a king',
            description: 'test',
            voting_id: votingId,
            program: {
                RemoteCallSequence: [{
                    endpoint: {canister_id: user1.wallet.canisterId, method_name: 'update_access_config'},
                    args: {
                        Encoded: [...IDL.encode([updateAccessConfigRequestType], [updateAccessConfigRequest])]
                    },
                    cycles: 0n,
                }]
            }
        });

        const {voting: voting0} = await user1.wallet.actor.get_voting({id: votingId});

        const {shares_info: user1SharesInfo} = await user1.walletPersonal.actor.get_my_shares_info_at({
            group_id: HAS_PROFILE_GROUP_ID,
            at: voting0.created_at
        });
        const {shares_info: user2SharesInfo} = await user2.walletPersonal.actor.get_my_shares_info_at({
            group_id: HAS_PROFILE_GROUP_ID,
            at: voting0.created_at
        });
        const {shares_info: walletCreatorSharesInfo} = await walletCreator.walletPersonal.actor.get_my_shares_info_at({
            group_id: HAS_PROFILE_GROUP_ID,
            at: voting0.created_at
        });

        // skip first minute because of how emergency voting config works
        await delay(1000 * 65);

        const {voting} = await user1.wallet.actor.get_voting({id: votingId});

        console.log(stringify(voting));

        assert(voting.status.hasOwnProperty('Round'));
        assert((voting.status as unknown as { Round: bigint }).Round == 1n);

        // everybody votes for user1

        await user1.walletPersonal.actor.cast_my_vote({
            id: votingId,
            vote: {
                Common: {
                    shares_info: user1SharesInfo[0] as SharesInfo,
                    vote: [[voting.choices[0], "1.0"]]
                }
            }
        });

        await user2.walletPersonal.actor.cast_my_vote({
            id: votingId,
            vote: {
                Common: {
                    shares_info: user2SharesInfo[0] as SharesInfo,
                    vote: [[voting.choices[0], "1.0"]]
                }
            }
        });

        await walletCreator.walletPersonal.actor.cast_my_vote({
            id: votingId,
            vote: {
                Common: {
                    shares_info: walletCreatorSharesInfo[0] as SharesInfo,
                    vote: [[voting.choices[0], "1.0"]]
                }
            }
        });

        const timestampPre = BigInt((new Date()).getTime()) * BigInt(1000000);

        // waiting for round end
        await delay(1000 * 60);

        const {voting: voting1} = await user1.wallet.actor.get_voting({id: votingId});

        console.log(stringify(voting1));
        assert(voting1.status.hasOwnProperty('Success'));

        // waiting for program execution and events propagation
        await delay(1000 * 30);

        const timestampPost = BigInt((new Date()).getTime()) * BigInt(1000000);

        let {page} = await user1.walletPersonal.actor.list_program_execution_entry_ids({
            page_req: {
                page_index: 0,
                page_size: 20,
                filter: {
                    from_timestamp: [timestampPre],
                    to_timestamp: [timestampPost],
                    endpoint: [],
                },
                sort: null
            }
        });

        for (let id of page.data) {
            const {program_executed_with, initiator} = await user1.historyLedger.actor.get_program_execution_entry_meta({id});
            const {program} = await user1.historyLedger.actor.get_program_execution_entry_program({id});
            const {result} = await user1.historyLedger.actor.get_program_execution_entry_result({id});

            console.log(id, stringify(program_executed_with), stringify(initiator), stringify(program), stringify(result));
        }

        const {access_config: accessConfig} = await user1.wallet.actor.get_access_config({id: UNLIMITED_ACCESS_CONFIG_ID});

        console.log(stringify(accessConfig));
        assert(accessConfig.allowees[0].hasOwnProperty('Profile'));
        assert((accessConfig.allowees[0] as {Profile: Principal}).Profile.toString() == (await user1.agent.getPrincipal()).toString());
    });
});

const stringify = (it: any) => {
    return JSON.stringify(it, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value // return everything else unchanged
    )
}