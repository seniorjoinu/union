import {delay, getSecsNano, ISetup, setup} from "./utils";
import {Ed25519KeyIdentity} from "@dfinity/identity";
import {assert} from 'chai';
import {
    CreateRoleResponse,
    HistoryEntryId,
    Profile,
    QuantityOf,
    RoleAndPermission
} from "dfx-type/union-wallet/union-wallet";

describe('wallet works fine', () => {
    let s: ISetup;

    before(async () => {
        s = await setup(Ed25519KeyIdentity.generate());
    });

    it("defaults are right", async () => {
        const myPrincipal = await s.agent.getPrincipal();

        const {roles} = await s.walletClient.get_my_roles();
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

        const {permissions} = await s.walletClient.get_my_permissions();
        assert(permissions.length == 1, "There should be only one permission");
        const defaultPermission = permissions[0];
        assert(defaultPermission.name == "Default");

        const rnp: RoleAndPermission = {role_id: hasProfileRole!.id, permission_id: defaultPermission.id};

        const result = await s.walletClient.execute({
            title: "Create new role",
            description: "Test",
            rnp,
            authorization_delay_nano: 100n,
            program: {
                RemoteCallSequence: [{
                    endpoint: {
                        canister_id: s.canister_id,
                        method_name: "create_role"
                    },
                    cycles: 0n,
                    args_candid: [`record { role_type = variant { Profile = record { principal_id = principal "aaaaa-aa"; name = "Test"; description = "Test role" } } }`]
                }]
            }
        }) as {Executed: HistoryEntryId};

        assert(result.Executed !== undefined, "Create role call should be executed right away");

        const {entries} = await s.walletClient.get_history_entries({ids: [result.Executed], rnp});
        assert(entries.length == 1);
        assert(entries[0].title = "Create new role");

        const {ids} = await s.walletClient.get_role_ids({rnp});
        const {roles: newRoles} = await s.walletClient.get_roles({ids, rnp});

        assert(newRoles.length == 4);
        const newRole = newRoles.find(it => {
            const profile = (it.role_type as {Profile: Profile}).Profile;
            return profile && profile.name == "Test";
        });
        assert(newRole);

        const result1 = await s.walletClient.execute({
            title: "Create new permission",
            description: "Test permission",
            rnp,
            authorization_delay_nano: 100n,
            program: {
                RemoteCallSequence: [{
                    endpoint: {
                        canister_id: s.canister_id,
                        method_name: "create_permission"
                    },
                    cycles: 0n,
                    args_candid: [`record { name = "Test permission"; targets = vec {} : vec variant { SelfEmptyProgram; Canister : principal; Endpoint : record { canister_id : principal; method_name : text } }; scope = variant { Blacklist } }`]
                }]
            }
        }) as {Executed: HistoryEntryId};


        const {entries: entries1} = await s.walletClient.get_history_entries({ids: [result1.Executed], rnp});

        console.log(JSON.stringify(entries1, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        ), 2);
    });
});