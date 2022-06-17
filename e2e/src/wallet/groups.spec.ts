import { connectSetup, ISetup, setup } from "../utils";
import { Ed25519KeyIdentity } from "@dfinity/identity";
import { assert } from "chai";

describe("groups", () => {
  let walletCreator: ISetup;

  beforeEach(async () => {
    walletCreator = await setup(Ed25519KeyIdentity.generate());
  });

  it("open groups work fine", async () => {
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

    const { group_id: groupId } = await walletCreator.wallet.actor.create_group(
      {
        name: "Test open group",
        description: "Test",
        private: false,
        transferable: true,
      }
    );

    await walletCreator.wallet.actor.mint_group_shares({
      group_id: groupId,
      owner: await user1.agent.getPrincipal(),
      qty: 1000n,
    });

    const { groups } = await user1.walletPersonal.actor.get_my_groups();
    assert(groups[0].it.id[0] == groupId);

    await walletCreator.wallet.actor.transfer_group_shares({
      group_id: groupId,
      from: await user1.agent.getPrincipal(),
      to: await user2.agent.getPrincipal(),
      qty: 300n,
    });

    await walletCreator.wallet.actor.burn_group_shares({
      group_id: groupId,
      owner: await user1.agent.getPrincipal(),
      qty: 400n,
    });

    const {
      balance: user1Balance1,
    } = await user1.walletPersonal.actor.get_my_group_shares_balance({
      group_id: groupId,
    });
    const {
      balance: user2Balance1,
    } = await user2.walletPersonal.actor.get_my_group_shares_balance({
      group_id: groupId,
    });
    const {
      total: totalSupply1,
    } = await walletCreator.wallet.actor.get_total_group_shares({
      group_id: groupId,
      query_delegation_proof_opt: [],
    });

    assert(user1Balance1 == user2Balance1);
    assert(user1Balance1 == 300n);
    assert(totalSupply1 == 600n);

    await user1.walletPersonal.actor.transfer_my_group_shares({
      group_id: groupId,
      to: await user2.agent.getPrincipal(),
      qty: 300n,
    });

    const {
      balance: user1Balance2,
    } = await user1.walletPersonal.actor.get_my_group_shares_balance({
      group_id: groupId,
    });
    const {
      balance: user2Balance2,
    } = await user2.walletPersonal.actor.get_my_group_shares_balance({
      group_id: groupId,
    });

    assert(user1Balance2 == 0n);
    assert(user2Balance2 == 600n);

    await user2.walletPersonal.actor.burn_my_group_shares({
      group_id: groupId,
      qty: 600n,
    });

    const {
      balance: user1Balance3,
    } = await user1.walletPersonal.actor.get_my_group_shares_balance({
      group_id: groupId,
    });
    const {
      balance: user2Balance3,
    } = await user2.walletPersonal.actor.get_my_group_shares_balance({
      group_id: groupId,
    });
    const {
      total: totalSupply3,
    } = await walletCreator.wallet.actor.get_total_group_shares({
      group_id: groupId,
      query_delegation_proof_opt: [],
    });

    assert(user1Balance3 == user2Balance3);
    assert(user1Balance3 == 0n);
    assert(totalSupply3 == 0n);
  });
});
