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

    const encodedUserPrincipal = [...IDL.encode([IDL.Principal], [identity.getPrincipal()])];

    const wallet = await deployCanister<IWallet>("wallet", encodedUserPrincipal, agent);
    const deployer = await deployCanister<IDeployer>("deployer", encodedUserPrincipal, agent);
    const gateway = await deployCanister<IGateway>("gateway", encodedUserPrincipal, agent);

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