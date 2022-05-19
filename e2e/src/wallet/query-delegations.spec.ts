import {describe} from "mocha";
import {connectSetup, expectThrowsAsync, HAS_PROFILE_GROUP_ID, setup, UNLIMITED_ACCESS_CONFIG_ID} from "../utils";
import {Ed25519KeyIdentity} from "@dfinity/identity";
import {assert} from "chai";
import {RawCandidCallResult} from "dfx-type/wallet/wallet";

describe('query delegations', () => {
   it('accessing through a delegation works fine', async () => {
      const user1 = await setup(Ed25519KeyIdentity.generate());
      const user2Identity = Ed25519KeyIdentity.generate();
      const user2 = await setup(user2Identity);
      const user2Wallet1 = await connectSetup(user2Identity, user1.wallet.canisterId, user1.historyLedger.canisterId);

      // create a profile for wallet2 in wallet1
      await user1.wallet.actor.create_profile({
         id: user2.wallet.canisterId,
         name: 'Wallet 2',
         description: 'Another union'
      });

      // create a permission in wallet2 to read something in wallet1 to user2
      const {id: acceptMyGroupSharesPermission} = await user2.wallet.actor.create_permission({
         targets: [{Endpoint : { canister_id: user1.wallet.canisterId, method_name: 'accept_my_group_shares' }}],
         name: 'Can accept tokens of this union in another union',
         description: 'test'
      });

      // create an access config with this permission
      const {id: accessConfigId} = await user2.wallet.actor.create_access_config({
         permissions: [acceptMyGroupSharesPermission],
         allowees: [{Profile : user2Identity.getPrincipal()}],
         name: 'Test',
         description: 'test'
      });

      // accept HAS_PROFILE group tokens of wallet1 by wallet2
      const resp = await user2.walletPersonal.actor.execute({
         access_config_id: accessConfigId,
         program: {
            RemoteCallSequence: [{
               endpoint: {
                  canister_id: user1.wallet.canisterId,
                  method_name: 'accept_my_group_shares'
               },
               args: {
                  CandidString: [
                      'record { group_id = 0 : nat64; qty = 100 : nat; }'
                  ]
               },
               cycles: 0n
            }]
         }
      });

      assert(resp.result.hasOwnProperty('RemoteCallSequence'));
      assert((resp.result as {RemoteCallSequence : Array<RawCandidCallResult>}).RemoteCallSequence[0].hasOwnProperty('Ok'));

      // create a permission in wallet2 to read something in wallet1 to user2
      const {id: listVotingsPermissionId} = await user2.wallet.actor.create_permission({
         targets: [{Endpoint : { canister_id: user1.wallet.canisterId, method_name: 'list_votings' }}],
         name: 'Can read votings of another union',
         description: 'test'
      });

      // update the access config we created earlier
      await user2.wallet.actor.update_access_config({
         id: accessConfigId,
         new_permissions: [[acceptMyGroupSharesPermission, listVotingsPermissionId]],
         new_allowees: [],
         new_name: [],
         new_description: []
      });

      // fetch a query delegation proof
      const {proof} = await user2.walletPersonal.actor.get_my_query_delegation_proof({requested_targets: [{Endpoint : {canister_id: user1.wallet.canisterId, method_name: 'list_votings'}}]});

      // validate that user2 can't read anything in wallet1 without the proof
      await expectThrowsAsync(user2Wallet1.walletPersonal.actor.list_votings({
         page_req: {
            page_index: 0,
            page_size: 1,
            filter: null,
            sort: null,
         },
         query_delegation_proof_opt: []
      }));

      // validate that proof enables user2 to read
      const {page} = await user2Wallet1.walletPersonal.actor.list_votings({
         page_req: {
            page_index: 0,
            page_size: 1,
            filter: null,
            sort: null,
         },
         query_delegation_proof_opt: [proof]
      });
   });
});