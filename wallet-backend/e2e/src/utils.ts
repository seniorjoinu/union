import {Actor, CanisterInstallMode, getManagementCanister, HttpAgent, Identity} from "@dfinity/agent";
import fetch from 'node-fetch';
import {exec} from 'child_process';
import {expect} from "chai";

import {_SERVICE as IUnionWalletClient} from 'dfx-type/union-wallet/union-wallet';
import {idlFactory} from 'dfx-idl/union-wallet/union-wallet';
import * as fs from "fs";
import {IDL} from "@dfinity/candid";
import {Principal} from "@dfinity/principal";

export interface ISetup {
    agent: HttpAgent;
    walletClient: IUnionWalletClient;
    canister_id: Principal,
}

export async function setup(identity: Identity): Promise<ISetup> {

    const agent = new HttpAgent({
        host: 'http://localhost:8000/',
        // @ts-ignore
        fetch,
        identity
    });

    await agent.fetchRootKey();

    const managementCanister = getManagementCanister({agent});
    const {canister_id} = await managementCanister.provisional_create_canister_with_cycles({amount: [], settings: []});
    const wasm = fs.readFileSync('.dfx/local/canisters/union-wallet/union-wallet.wasm');

    await managementCanister.install_code({
        canister_id,
        mode: { [CanisterInstallMode.Install]: null },
        wasm_module: [...wasm],
        arg: [...IDL.encode([IDL.Principal], [identity.getPrincipal()])]
    });

    const walletClient: IUnionWalletClient = Actor.createActor(idlFactory, {
        agent,
        canisterId: canister_id
    });

    return {
        agent,
        walletClient,
        canister_id,
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

export async function execAsync(command: string) {
    return new Promise((res, rej) => {
        exec(command, (err, stderr, stdout) => {
            if (err) {
                rej(err);
            } else if (stderr) {
                rej(stderr);
            } else if (stdout) {
                res(stdout);
            } else {
                res("No error");
            }
        })
    })
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