import {Actor, CanisterInstallMode, getManagementCanister, HttpAgent, Identity} from "@dfinity/agent";
import fetch from 'node-fetch';
import {expect} from "chai";

import {_SERVICE as IWallet} from 'dfx-type/wallet/wallet';
import {_SERVICE as IDeployer} from 'dfx-type/deployer/deployer';
import {_SERVICE as IGateway} from 'dfx-type/gateway/gateway';
import * as fs from "fs";
import {IDL} from "@dfinity/candid";
import {Principal} from "@dfinity/principal";

export interface ActorWithId<T> {
    actor: T;
    canisterId: Principal ;
}

export interface ISetup {
    agent: HttpAgent;
    wallet: ActorWithId<IWallet>;
    deployer: ActorWithId<IDeployer>;
    gateway: ActorWithId<IGateway>;
}

export async function setup(identity: Identity): Promise<ISetup> {
    const agent = new HttpAgent({
        host: 'http://localhost:8000/',
        // @ts-ignore
        fetch,
        identity
    });
    await agent.fetchRootKey();

    const deployerArgs = [...IDL.encode([IDL.Principal, IDL.Principal], [identity.getPrincipal(), identity.getPrincipal()])];
    const deployer = await deployCanister<IDeployer>("deployer", deployerArgs, agent);

    const gatewayArgs = [...IDL.encode([IDL.Principal, IDL.Principal], [identity.getPrincipal(), deployer.canisterId])];
    const gateway = await deployCanister<IGateway>("gateway", gatewayArgs, agent);

    const {canister_id} = await deployer.actor.spawn_wallet({wallet_creator: identity.getPrincipal(), version: "0.0.0", gateway: gateway.canisterId})
    const wallet = await connectCanister<IWallet>("wallet", canister_id, agent);

    return {
        agent,
        wallet,
        deployer,
        gateway,
    };
}

export function getWasmBinary(name: string): number[] {
    const wasm = fs.readFileSync(`.dfx/local/canisters/${name}/${name}.wasm`);

    return [...wasm]
}

export async function deployCanister<T>(name: string, arg: number[], agent: HttpAgent): Promise<{ actor: T, canisterId: Principal }> {
    const managementCanister = getManagementCanister({agent});
    const {canister_id} = await managementCanister.provisional_create_canister_with_cycles({amount: [], settings: []});
    const wasm_module = getWasmBinary(name);
    const {idlFactory} = await import(`dfx-idl/${name}/${name}`)

    await managementCanister.install_code({
        canister_id,
        mode: {[CanisterInstallMode.Install]: null},
        wasm_module,
        arg
    });

    console.log(`Canister ${name} ${canister_id} deployed`);

    return {
        actor: Actor.createActor(idlFactory, {
            agent,
            canisterId: canister_id
        }),
        canisterId: canister_id
    };
}

export async function connectCanister<T>(name: string, canisterId: Principal, agent: HttpAgent): Promise<{ actor: T, canisterId: Principal }> {
    const {idlFactory} = await import(`dfx-idl/${name}/${name}`)

    console.log(`Canister ${name} ${canisterId} connected`);

    return {
        actor: Actor.createActor(idlFactory, {
            agent,
            canisterId: canisterId
        }),
        canisterId,
    };
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