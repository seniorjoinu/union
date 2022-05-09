import {
    ALLOW_WRITE_PERMISSION_ID, connectSetup,
    ALLOW_VOTE_ACCESS_CONFIG_ID,
    delay,
    expectThrowsAsync,
    getSecsNano,
    getWasmBinary,
    ISetup,
    setup, UNLIMITED_ACCESS_CONFIG_ID
} from "../utils";
import {Ed25519KeyIdentity} from "@dfinity/identity";
import {assert} from 'chai';
import {
    CreateAccessConfigRequest,
    Profile,
    QuantityOf,
} from "dfx-type/wallet/wallet";

describe('access configs', () => {
    let walletCreator: ISetup;

    beforeEach(async () => {
        walletCreator = await setup(Ed25519KeyIdentity.generate());
    });

    it('everyone permission works as expected', async () => {
        const outsideUser = await connectSetup(Ed25519KeyIdentity.generate(), walletCreator.wallet.canisterId, walletCreator.historyLedger.canisterId);

        const createAccessConfigRequest: CreateAccessConfigRequest = {
            name: "Test access config",
            description: "Test test",
            allowees: [
                {Everyone: null}
            ],
            permissions: [
                ALLOW_WRITE_PERMISSION_ID
            ]
        };

        await expectThrowsAsync(outsideUser.wallet.actor.create_access_config(createAccessConfigRequest), "Should throw for outside user");
        const {id: newAccessConfigId} = await walletCreator.wallet.actor.create_access_config(createAccessConfigRequest);

        outsideUser.walletAgent.setCurrentAccessConfig(newAccessConfigId);
        await outsideUser.wallet.actor.delete_access_config({id: newAccessConfigId});
    });

    it('crud works fine', async () => {
        const randomProfile = Ed25519KeyIdentity.generate();

        const createAccessConfigRequest: CreateAccessConfigRequest = {
            name: "Test access config",
            description: "Test test",
            allowees: [
                {Profile: randomProfile.getPrincipal()}
            ],
            permissions: [
                ALLOW_WRITE_PERMISSION_ID
            ]
        };

        // profile not exists
        await expectThrowsAsync(walletCreator.wallet.actor.create_access_config(createAccessConfigRequest));
        // impossible to delete vote access config
        await expectThrowsAsync(walletCreator.wallet.actor.delete_access_config({id: ALLOW_VOTE_ACCESS_CONFIG_ID}));

        await walletCreator.wallet.actor.update_access_config({
            id: UNLIMITED_ACCESS_CONFIG_ID,
            new_name: ["Updated name"],
            new_description: ["Updated description"],
            new_allowees: [],
            new_permissions: []
        });

        // creating 3 more access configs to check if pagination filters work
        const walletCreatorPrincipal = await walletCreator.agent.getPrincipal();
        const createAccessConfigRequest1: CreateAccessConfigRequest = {
            name: "Test access config",
            description: "Test test",
            allowees: [
                {Profile: walletCreatorPrincipal}
            ],
            permissions: [
                ALLOW_WRITE_PERMISSION_ID
            ]
        };

        const {id: acId1} = await walletCreator.wallet.actor.create_access_config(createAccessConfigRequest1);
        const {id: acId2} = await walletCreator.wallet.actor.create_access_config(createAccessConfigRequest1);
        const {id: acId3} = await walletCreator.wallet.actor.create_access_config(createAccessConfigRequest1);

        const {page: page1} = await walletCreator.wallet.actor.list_access_configs({
            page_req: {
                page_index: 0,
                page_size: 2,
                filter: {
                    permission: [],
                    group: [],
                    profile: [walletCreatorPrincipal]
                },
                sort: null,
            }
        });

        assert(page1.has_next);
        assert(page1.data.length == 2);

        const {page: page2} = await walletCreator.wallet.actor.list_access_configs({
            page_req: {
                page_index: 1,
                page_size: 2,
                filter: {
                    permission: [],
                    group: [],
                    profile: [walletCreatorPrincipal]
                },
                sort: null,
            }
        });

        assert(!page2.has_next);
        assert(page2.data.length == 2);

        const {page: page3} = await walletCreator.wallet.actor.list_access_configs({
            page_req: {
                page_index: 10,
                page_size: 2,
                filter: {
                    permission: [],
                    group: [],
                    profile: [walletCreatorPrincipal]
                },
                sort: null,
            }
        });

        assert(!page3.has_next);
        assert(page3.data.length == 0);
    });
});