import {
  connectSetup,
  delay,
  HAS_PROFILE_GROUP_ID,
  ISetup,
  setup,
  stringify,
  UNLIMITED_ACCESS_CONFIG_ID,
} from "../utils";
import { Ed25519KeyIdentity } from "@dfinity/identity";
import {
  CreateProfileRequest,
  SharesInfo,
  UpdateAccessConfigRequest,
} from "dfx-type/wallet/wallet";
import { assert } from "chai";
import { IDL } from "@dfinity/candid";

describe("votings", () => {
  let walletCreator: ISetup;

  beforeEach(async () => {
    walletCreator = await setup(Ed25519KeyIdentity.generate());
  });

  it("votings should work fine", async () => {
    const user1 = await connectSetup(
      Ed25519KeyIdentity.generate(),
      walletCreator.wallet.canisterId,
      walletCreator.historyLedger.canisterId
    );
    const user2 = await connectSetup(
      Ed25519KeyIdentity.generate(),
      walletCreator.wallet.canisterId,
      walletCreator.historyLedger.canisterId
    );

    await walletCreator.wallet.actor.create_profile({
      id: await user1.agent.getPrincipal(),
      name: "User1",
      description: "",
    });

    await user1.walletPersonal.actor.accept_my_group_shares({
      group_id: HAS_PROFILE_GROUP_ID,
      qty: 100n,
    });
    await walletCreator.wallet.actor.update_access_config({
      id: UNLIMITED_ACCESS_CONFIG_ID,
      new_name: [],
      new_description: [],
      new_permissions: [],
      new_allowees: [
        [
          { Profile: await walletCreator.agent.getPrincipal() },
          { Profile: await user1.agent.getPrincipal() },
        ],
      ],
    });
    user1.walletAgent.setCurrentAccessConfig(UNLIMITED_ACCESS_CONFIG_ID);
    walletCreator.walletAgent.setCurrentAccessConfig(
      UNLIMITED_ACCESS_CONFIG_ID
    );

    const { id: vcId } = await walletCreator.wallet.actor.create_voting_config({
      name: "lol",
      description: "kek",
      permissions: [0n, 1n, 2n, 3n],
      choices_count: [],
      winners_count: [],
      win: {
        QuantityOf: { quantity: 1n, target: { Group: HAS_PROFILE_GROUP_ID } },
      },
      rejection: {
        QuantityOf: { quantity: 1n, target: { Group: HAS_PROFILE_GROUP_ID } },
      },
      next_round: {
        QuantityOf: { quantity: 1n, target: { Group: HAS_PROFILE_GROUP_ID } },
      },
      approval: {
        QuantityOf: { quantity: 1n, target: { Group: HAS_PROFILE_GROUP_ID } },
      },
      quorum: {
        QuantityOf: { quantity: 1n, target: { Group: HAS_PROFILE_GROUP_ID } },
      },
      round: { round_delay: 0n, round_duration: BigInt(30 * 10 ** 9) },
    });

    // THERE IS NOTHING SPECIAL ABOUT WALLET CREATOR ANYMORE - ALL OF THEM ARE JUST 'Has profile' GROUP MEMBERS NOW

    const { id: votingId } = await user1.wallet.actor.create_voting({
      name: "Test",
      description: "Lets make us a new king!",
      voting_config_id: vcId,
      winners_need: 1,
    });

    const updateAccessConfigRequestType = IDL.Record({
      id: IDL.Nat64,
      new_name: IDL.Opt(IDL.Text),
      new_description: IDL.Opt(IDL.Text),
      new_permissions: IDL.Opt(IDL.Vec(IDL.Nat64)),
      new_allowees: IDL.Opt(
        IDL.Vec(
          IDL.Variant({
            Everyone: IDL.Null,
            Group: IDL.Record({
              id: IDL.Nat64,
              min_shares: IDL.Nat,
            }),
            Profile: IDL.Principal,
          })
        )
      ),
    });

    const updateAccessConfigRequest: UpdateAccessConfigRequest = {
      id: UNLIMITED_ACCESS_CONFIG_ID,
      new_name: [],
      new_description: [],
      new_permissions: [],
      new_allowees: [
        [
          { Profile: await walletCreator.agent.getPrincipal() },
          { Profile: await user1.agent.getPrincipal() },
          { Profile: await user2.agent.getPrincipal() },
        ],
      ],
    };

    const CreateProfileRequestType = IDL.Record({
      id: IDL.Principal,
      name: IDL.Text,
      description: IDL.Text,
    });

    const CreateProfileRequest: CreateProfileRequest = {
      id: await user2.agent.getPrincipal(),
      name: "User2",
      description: "User2 desc",
    };

    await user1.wallet.actor.create_voting_choice({
      name: "Create user2 profile",
      description: "test",
      voting_id: { Common: votingId },
      program: {
        RemoteCallSequence: [
          {
            endpoint: {
              canister_id: user1.wallet.canisterId,
              method_name: "create_profile",
            },
            args: {
              Encoded: [
                ...IDL.encode(
                  [CreateProfileRequestType],
                  [CreateProfileRequest]
                ),
              ],
            },
            cycles: 1n,
          },
          {
            endpoint: {
              canister_id: user1.wallet.canisterId,
              method_name: "update_access_config",
            },
            args: {
              Encoded: [
                ...IDL.encode(
                  [updateAccessConfigRequestType],
                  [updateAccessConfigRequest]
                ),
              ],
            },
            cycles: 1n,
          },
        ],
      },
    });

    const { voting: voting0 } = await user1.wallet.actor.get_voting({
      id: votingId,
      query_delegation_proof_opt: [],
    });

    const {
      shares_info: user1SharesInfo,
    } = await user1.walletPersonal.actor.get_my_shares_info_at({
      group_id: HAS_PROFILE_GROUP_ID,
      at: voting0.created_at,
    });
    await user1.walletPersonal.actor.cast_my_vote({
      id: votingId,
      vote: {
        Approval: {
          shares_info: user1SharesInfo[0] as SharesInfo,
        },
      },
    });

    console.log("VOTING 0", stringify(voting0));
    // skip first minute because of how emergency voting config works
    await delay(1000 * 45);

    const { voting } = await user1.wallet.actor.get_voting({
      id: votingId,
      query_delegation_proof_opt: [],
    });

    console.log("VOTING 1", stringify(voting));

    assert(voting.status.hasOwnProperty("Round"));
    assert(((voting.status as unknown) as { Round: bigint }).Round == 1n);

    // everybody votes for user1

    await user1.walletPersonal.actor.cast_my_vote({
      id: votingId,
      vote: {
        Common: {
          shares_info: user1SharesInfo[0] as SharesInfo,
          vote: [[voting.choices[0], "1.0"]],
        },
      },
    });

    const timestampPre = BigInt(new Date().getTime()) * BigInt(1000000);

    // waiting for round end
    await delay(1000 * 45);

    const { voting: voting1 } = await user1.wallet.actor.get_voting({
      id: votingId,
      query_delegation_proof_opt: [],
    });

    console.log("VOTING 2", stringify(voting1));
    assert(voting1.status.hasOwnProperty("Success"));

    // waiting for program execution and events propagation
    await delay(1000 * 30);

    const timestampPost = BigInt(new Date().getTime()) * BigInt(1000000);

    let {
      page,
    } = await user1.walletPersonal.actor.list_program_execution_entry_ids({
      page_req: {
        page_index: 0,
        page_size: 20,
        filter: {
          from_timestamp: [timestampPre],
          to_timestamp: [timestampPost],
          endpoint: [],
        },
        sort: null,
      },
      query_delegation_proof_opt: [],
    });

    for (let id of page.data) {
      const {
        program_executed_with,
        initiator,
      } = await user1.historyLedger.actor.get_program_execution_entry_meta({
        id,
      });
      const {
        program,
      } = await user1.historyLedger.actor.get_program_execution_entry_program({
        id,
      });
      const {
        result,
      } = await user1.historyLedger.actor.get_program_execution_entry_result({
        id,
      });

      console.log(
        "RESULTS",
        id,
        stringify(program_executed_with),
        stringify(initiator),
        stringify(program),
        stringify(result)
      );
    }

    const {
      access_config: accessConfig,
    } = await user1.wallet.actor.get_access_config({
      id: UNLIMITED_ACCESS_CONFIG_ID,
      query_delegation_proof_opt: [],
    });

    console.log("ACCESS_CONFIG", stringify(accessConfig));
    assert(accessConfig.allowees[0].hasOwnProperty("Profile"));
    assert(accessConfig.allowees.length == 3);
  });
});
