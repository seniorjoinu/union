import {
    Actor,
    ActorConfig,
    CanisterInstallMode,
    getManagementCanister,
    HttpAgent,
    Identity,
} from "@dfinity/agent";
import fetch from 'node-fetch';
import {expect} from "chai";

import {
    _SERVICE as IWallet,
    InitRequest,
} from 'dfx-type/wallet/wallet';
import {_SERVICE as IHistoryLedger} from 'dfx-type/history-ledger/history-ledger';
import * as fs from "fs";
import {IDL} from "@dfinity/candid";
import {Principal} from "@dfinity/principal";
import {createWalletExecuteProxyActor, WalletExecuteProxyAgent} from "./executeWalletProxy";

export interface ActorWithId<T> {
    actor: T;
    canisterId: Principal;
}

export interface ISetup {
    walletAgent: WalletExecuteProxyAgent,
    wallet: ActorWithId<IWallet>;
    walletPersonal: ActorWithId<IWallet>;
    agent: HttpAgent;
    historyLedger: ActorWithId<IHistoryLedger>;
}

export async function createAgents(identity: Identity): Promise<[HttpAgent, WalletExecuteProxyAgent]> {
    const agent = new HttpAgent({
        host: 'http://localhost:8000/',
        // @ts-ignore
        fetch,
        identity
    });
    await agent.fetchRootKey();

    const walletAgent = new WalletExecuteProxyAgent(UNLIMITED_ACCESS_CONFIG_ID, agent);

    return [agent, walletAgent];
}

export async function connectSetup(identity: Identity, walletCanisterId: Principal, ledgerCanisterId: Principal): Promise<ISetup> {
    const [agent, walletAgent] = await createAgents(identity);

    const wallet = await connectCanister<IWallet>("wallet", {
        canisterId: walletCanisterId,
        agent: walletAgent,
    });
    const walletPersonal = await connectCanister<IWallet>("wallet", {
        canisterId: walletCanisterId,
        agent,
    });
    const historyLedger = await connectCanister<IHistoryLedger>("history-ledger", {
        canisterId: ledgerCanisterId,
        agent,
    });

    return {
        walletAgent,
        wallet,
        walletPersonal,
        agent,
        historyLedger,
    };
}

export async function setup(identity: Identity): Promise<ISetup> {
    const [agent, walletAgent] = await createAgents(identity);

    const ledgerCanisterId = await createCanister(agent);
    const init: InitRequest = {
        union_name: "Union #1",
        union_description: "Test description",
        wallet_creator: identity.getPrincipal(),
        history_ledger: ledgerCanisterId
    };
    const walletCanisterId = await deployCanister(
        "wallet",
        [
            ...IDL.encode(
                [IDL.Record({
                    union_name: IDL.Text,
                    union_description: IDL.Text,
                    wallet_creator: IDL.Principal,
                    history_ledger: IDL.Principal,
                })],
                [init]
            )
        ],
        agent
    );

    await installCanisterCode(
        ledgerCanisterId,
        "history-ledger",
        [
            ...IDL.encode(
                [IDL.Principal],
                [walletCanisterId]
            )
        ],
        agent
    );

    // waiting until ledger subscribes to wallet events
    await delay(1000 * 10);

    const wallet = await connectCanister<IWallet>("wallet", {
        canisterId: walletCanisterId,
        agent: walletAgent,
    });
    const walletPersonal = await connectCanister<IWallet>("wallet", {
        canisterId: walletCanisterId,
        agent,
    });
    const historyLedger = await connectCanister<IHistoryLedger>("history-ledger", {
        canisterId: ledgerCanisterId,
        agent,
    });

    // accepting tokens
    await walletPersonal.actor.accept_my_group_shares({
        group_id: HAS_PROFILE_GROUP_ID,
        qty: 100n
    });

    return {
        walletAgent,
        wallet,
        walletPersonal,
        agent,
        historyLedger,
    };
}

export function getWasmBinary(name: string): number[] {
    const wasm = fs.readFileSync(`.dfx/local/canisters/${name}/${name}.wasm`);

    return [...wasm]
}

export async function deployCanister(name: string, arg: number[], agent: HttpAgent): Promise<Principal> {
    let canister_id = await createCanister(agent);
    await installCanisterCode(canister_id, name, arg, agent);

    console.log(`Canister ${canister_id} is deployed`);

    return canister_id;
}

export async function createCanister(agent: HttpAgent): Promise<Principal> {
    const managementCanister = getManagementCanister({agent});
    const {canister_id} = await managementCanister.provisional_create_canister_with_cycles({amount: [], settings: []});

    return canister_id;
}

export async function installCanisterCode(canisterId: Principal, name: string, arg: number[], agent: HttpAgent): Promise<void> {
    const managementCanister = getManagementCanister({agent});
    const wasm_module = getWasmBinary(name);

    await managementCanister.install_code({
        canister_id: canisterId,
        mode: {[CanisterInstallMode.Install]: null},
        wasm_module,
        arg
    });
}

export async function connectCanister<T>(name: string, actorConfig: ActorConfig): Promise<{ actor: T, canisterId: Principal }> {
    const {idlFactory} = await import(`dfx-idl/${name}/${name}`)

    console.log(`Canister ${name} ${actorConfig.canisterId} connected`);
    let actor;
    // @ts-ignore
    if (actorConfig.agent.isProxyAgent && actorConfig.agent.isProxyAgent()) {
        actor = createWalletExecuteProxyActor<T>(idlFactory, actorConfig);
    } else {
        actor = Actor.createActor<T>(idlFactory, actorConfig);
    }

    // @ts-ignore
    return {actor, canisterId: actorConfig.canisterId};
}

export function getTimeNano(): bigint {
    return BigInt(new Date().getTime() * 1000_000)
}

export function getHoursNano(h: number): bigint {
    return BigInt(1000_000_000 * 60 * 60 * h);
}

export function getSecsNano(s: number): bigint {
    return BigInt(1000_000_000 * s);
}

export function getMinsNano(m: number): bigint {
    return BigInt(1000_000_000 * 60 * m);
}

export const expectThrowsAsync = async (method: Promise<any>, errorMessage?: string) => {
    let error = null
    try {
        await method
    } catch (err) {
        error = err
    }

    expect(error).to.be.an('Error', errorMessage);
}

export async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const ALLOW_WRITE_PERMISSION_ID = 0n;
export const ALLOW_READ_PERMISSION_ID = 1n;
export const ALLOW_SEND_FEEDBACK_PERMISSION_ID = 2n;
export const ALLOW_VOTE_PERMISSION_ID = 3n;

export const HAS_PROFILE_GROUP_ID = 0n;

export const ALLOW_VOTE_ACCESS_CONFIG_ID = 0n;
export const UNLIMITED_ACCESS_CONFIG_ID = 1n;
export const READ_ONLY_ACCESS_CONFIG_ID = 2n;

export const EMERGENCY_VOTING_CONFIG_ID = 0n;
export const FEEDBACK_VOTING_CONFIG_ID = 1n;
