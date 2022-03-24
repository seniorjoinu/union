import {delay, expectThrowsAsync, getSecsNano, getWasmBinary, ISetup, setup} from "./utils";
import {Ed25519KeyIdentity} from "@dfinity/identity";
import {assert} from 'chai';
import {
    HistoryEntryId,
    Profile,
    QuantityOf,
    RoleAndPermission
} from "dfx-type/wallet/wallet";

describe('setup', () => {
    let s: ISetup;

    beforeEach(async () => {
        s = await setup(Ed25519KeyIdentity.generate());
    });

    it("deployer works fine", async () => {
        const myPrincipal = await s.agent.getPrincipal();
        const walletWasmBinary = getWasmBinary("wallet");

        await s.deployer.actor.create_binary_version({version: "0.0.1", description: "Initial version"});
        await s.deployer.actor.upload_binary({version: "0.0.1", binary: walletWasmBinary});

        const {canister_id: newWalletId} = await s.deployer.actor.spawn_wallet({version: "0.0.1", wallet_creator: myPrincipal});

        await s.deployer.actor.release_binary_version({version: "0.0.1"});

        const {canister_id: newWalletId1} = await s.deployer.actor.spawn_wallet({version: "0.0.1", wallet_creator: myPrincipal});

        await expectThrowsAsync(s.deployer.actor.delete_binary_version({version: "0.0.1"}));

        await s.deployer.actor.create_binary_version({version: "0.0.2", description: "New version"});
        await s.deployer.actor.upload_binary({version: "0.0.2", binary: walletWasmBinary});
        await s.deployer.actor.release_binary_version({version: "0.0.2"});

        await s.deployer.actor.delete_binary_version({version: "0.0.1"})
        await expectThrowsAsync(s.deployer.actor.spawn_wallet({version: "0.0.1", wallet_creator: myPrincipal}));

        const {version: latestVersion} = await s.deployer.actor.get_latest_version();
        assert(latestVersion == "0.0.2");

        const {infos} = await s.deployer.actor.get_binary_version_infos({versions: ["0.0.1"]});
        assert(infos.length == 1);
        assert(JSON.stringify(infos[0].status) == JSON.stringify({Deleted: null}));

        const {ids} = await s.deployer.actor.get_instance_ids();
        assert(ids.length == 2);
        assert(ids.map(it => it.toText()).includes(newWalletId.toText()) && ids.map(it => it.toText()).includes(newWalletId1.toText()));

        const {instances} = await s.deployer.actor.get_instances({ids});
        assert(instances.length == 2);
    });

    it("wallet works fine", async () => {
        const myPrincipal = await s.agent.getPrincipal();

        const {roles} = await s.wallet.actor.get_my_roles();
        assert(roles.length == 3, "There should be three roles for me");

        const myPersonalRole = roles.find((it) => {
            const myProfile = (it.role_type as { Profile: Profile }).Profile;
            return myProfile && myProfile.principal_id.toText() == myPrincipal.toText();
        });
        assert(!!myPersonalRole, "My personal profile role should exist");

        const hasProfileRole = roles.find((it) => {
            const hasProfile = (it.role_type as { QuantityOf: QuantityOf }).QuantityOf;
            return hasProfile && hasProfile.name == "Has profile" && hasProfile.enumerated.includes(myPersonalRole!.id);
        });
        assert(!!hasProfileRole, "Has profile role should exist");

        const everyoneRole = roles.find((it) => {
            return (it.role_type as { Everyone: null }).Everyone === null;
        });
        assert(!!everyoneRole, "Default Everyone role should exist");

        const {permissions} = await s.wallet.actor.get_my_permissions();
        assert(permissions.length == 1, "There should be only one permission");
        const defaultPermission = permissions[0];
        assert(defaultPermission.name == "Default");

        const rnp: RoleAndPermission = {role_id: hasProfileRole!.id, permission_id: defaultPermission.id};

        const result = await s.wallet.actor.execute({
            title: "Create new role",
            description: "Test",
            rnp,
            authorization_delay_nano: 100n,
            program: {
                RemoteCallSequence: [{
                    endpoint: {
                        canister_id: s.wallet.canisterId,
                        method_name: "create_role"
                    },
                    cycles: 0n,
                    args_candid: [`record { role_type = variant { Profile = record { principal_id = principal "aaaaa-aa"; name = "Test"; description = "Test role" } } }`]
                }]
            }
        }) as {Executed: HistoryEntryId};

        assert(result.Executed !== undefined, "Create role call should be executed right away");

        const {entries} = await s.wallet.actor.get_history_entries({ids: [result.Executed], rnp});
        assert(entries.length == 1);
        assert(entries[0].title = "Create new role");

        const {ids} = await s.wallet.actor.get_role_ids({rnp});
        const {roles: newRoles} = await s.wallet.actor.get_roles({ids, rnp});

        assert(newRoles.length == 4);
        const newRole = newRoles.find(it => {
            const profile = (it.role_type as {Profile: Profile}).Profile;
            return profile && profile.name == "Test";
        });
        assert(newRole);
    });
});