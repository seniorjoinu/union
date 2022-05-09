import {
    Actor, ActorConfig,
    ActorConstructor, ActorMethod, ActorSubclass,
    Agent, CallConfig,
    CallOptions,
    QueryCallRejectedError,
    QueryFields,
    QueryResponse,
    ReadStateOptions,
    ReadStateResponse,
    SubmitResponse,
    UpdateCallRejectedError
} from "@dfinity/agent";
import {BinaryBlob, IDL, JsonObject} from "@dfinity/candid";
import {Principal} from "@dfinity/principal";
import {ExecuteRequest, ExecuteResponse, RawCandidCallResult} from "dfx-type/wallet/wallet";
import {pollForResponse, strategy} from "@dfinity/agent/lib/cjs/polling";

enum QueryResponseStatus {
    Replied = "replied",
    Rejected = "rejected"
}
const remoteCallEndpoint = IDL.Record({
    'canister_id' : IDL.Principal,
    'method_name' : IDL.Text,
});
const remoteCallArgs = IDL.Variant({
    'CandidString' : IDL.Vec(IDL.Text),
    'Encoded' : IDL.Vec(IDL.Nat8),
});
const remoteCallPayload = IDL.Record({
    'endpoint' : remoteCallEndpoint,
    'args' : remoteCallArgs,
    'cycles' : IDL.Nat64,
});
const program = IDL.Variant({
    'Empty' : IDL.Null,
    'RemoteCallSequence' : IDL.Vec(remoteCallPayload),
});

export class WalletExecuteProxyAgent implements Agent {
    constructor(private accessConfigId: bigint, private _agent: Agent) {
        this.rootKey = _agent.rootKey;
    }
    rootKey: BinaryBlob | null;

    isProxyAgent(): boolean {
        return true;
    }

    setCurrentAccessConfig(accessConfigId: bigint) {
        this.accessConfigId = accessConfigId;
    }

    getPrincipal(): Promise<Principal> {
        return this._agent.getPrincipal()
    }
    readState(effectiveCanisterId: string | Principal, options: ReadStateOptions): Promise<ReadStateResponse> {
        return this._agent.readState(effectiveCanisterId, options)
    }
    call(canisterId: string | Principal, fields: CallOptions): Promise<SubmitResponse> {
        const argTypes = [IDL.Record({
            access_config_id: IDL.Nat64,
            program,
        })];
        const args: [ExecuteRequest] = [{
            access_config_id: this.accessConfigId,
            program: {
                RemoteCallSequence: [{
                    endpoint: {canister_id: canisterId as Principal, method_name: fields.methodName},
                    args: {Encoded: [...fields.arg]},
                    cycles: 0n,
                }]
            }
        }];

        let arg = IDL.encode(argTypes, args);

        return this._agent.call(canisterId, {
            arg,
            methodName: "execute",
            effectiveCanisterId: fields.effectiveCanisterId,
        })
    }
    status(): Promise<JsonObject> {
        return this._agent.status()
    }
    query(canisterId: string | Principal, options: QueryFields): Promise<QueryResponse> {
        return this._agent.query(canisterId, options)
    }
    fetchRootKey(): Promise<BinaryBlob> {
        return this._agent.fetchRootKey()
    }
}

const DEFAULT_ACTOR_CONFIG = {
    pollingStrategyFactory: strategy.defaultStrategy,
};

function createWalletExecuteProxyActorClass(interfaceFactory: IDL.InterfaceFactory): ActorConstructor {
    const service = interfaceFactory({ IDL });

    class CanisterActor extends Actor {
        [x: string]: ActorMethod;

        constructor(config: ActorConfig) {
            const canisterId =
                typeof config.canisterId === 'string'
                    ? Principal.fromText(config.canisterId)
                    : config.canisterId;

            super({
                config: {
                    ...DEFAULT_ACTOR_CONFIG,
                    ...config,
                    canisterId,
                },
                service,
            });

            for (const [methodName, func] of service._fields) {
                this[methodName] = _createActorMethod(this, methodName, func);
            }
        }
    }

    return CanisterActor;
}

export function createWalletExecuteProxyActor<T = Record<string, ActorMethod>>(
    interfaceFactory: IDL.InterfaceFactory,
    configuration: ActorConfig,
): ActorSubclass<T> {
    return new (createWalletExecuteProxyActorClass(interfaceFactory))(
        configuration,
    ) as unknown as ActorSubclass<T>;
}

const metadataSymbol = Symbol.for('ic-agent-metadata');

function decodeCommonReturnValue(types: IDL.Type[], msg: ArrayBuffer) {
    // @ts-ignore
    const returnValues = IDL.decode(types, Buffer.from(msg));
    switch (returnValues.length) {
        case 0:
            return undefined;
        case 1:
            return returnValues[0];
        default:
            return returnValues;
    }
}

const candidRejectionCode = IDL.Variant({
    'NoError' : IDL.Null,
    'CanisterError' : IDL.Null,
    'SysTransient' : IDL.Null,
    'DestinationInvalid' : IDL.Null,
    'Unknown' : IDL.Null,
    'SysFatal' : IDL.Null,
    'CanisterReject' : IDL.Null,
});
const rawCandidCallResult = IDL.Variant({
    'Ok' : IDL.Vec(IDL.Nat8),
    'Err' : IDL.Tuple(candidRejectionCode, IDL.Text),
});
const programExecutionResult = IDL.Variant({
    'Empty' : IDL.Null,
    'RemoteCallSequence' : IDL.Vec(rawCandidCallResult),
});
const executeResponse = IDL.Record({ 'result' : programExecutionResult });

function decodeExecuteReturnValue(types: IDL.Type[], executeMsg: ArrayBuffer) {
    // @ts-ignore
    const executeReturnValues: [ExecuteResponse] = IDL.decode([executeResponse], Buffer.from(executeMsg));
    if (!executeReturnValues[0].result.hasOwnProperty('RemoteCallSequence')) {
        throw new Error("Invalid response (no RemoteCallSequence variant found)");
    }
    // @ts-ignore
    const results: RawCandidCallResult[] = executeReturnValues[0].result['RemoteCallSequence'];
    if (results[0].hasOwnProperty("Err")) {
        // @ts-ignore
        let err = results[0]['Err'];
        throw new Error(`execute() returned an error (${err[0]}) ${err[1]}`);
    }

    // @ts-ignore
    const msg = results[0]['Ok'];
    return decodeCommonReturnValue(types, msg);
}

function _createActorMethod(actor: Actor, methodName: string, func: IDL.FuncClass): ActorMethod {
    let caller: (options: CallConfig, ...args: unknown[]) => Promise<unknown>;
    if (func.annotations.includes('query')) {
        caller = async (options, ...args) => {
            // First, if there's a config transformation, call it.
            options = {
                ...options,
                // @ts-ignore
                ...actor[metadataSymbol].config.queryTransform?.(methodName, args, {
                    // @ts-ignore
                    ...actor[metadataSymbol].config,
                    ...options,
                }),
            };

            // @ts-ignore
            const agent = options.agent || actor[metadataSymbol].config.agent || getDefaultAgent();
            // @ts-ignore
            const cid = Principal.from(options.canisterId || actor[metadataSymbol].config.canisterId);
            const arg = IDL.encode(func.argTypes, args);

            const result = await agent.query(cid, { methodName, arg });

            switch (result.status) {
                case QueryResponseStatus.Rejected:
                    throw new QueryCallRejectedError(cid, methodName, result);

                case QueryResponseStatus.Replied:
                    return decodeCommonReturnValue(func.retTypes, result.reply.arg);
            }
        };
    } else {
        caller = async (options, ...args) => {
            // First, if there's a config transformation, call it.
            options = {
                ...options,
                // @ts-ignore
                ...actor[metadataSymbol].config.callTransform?.(methodName, args, {
                    // @ts-ignore
                    ...actor[metadataSymbol].config,
                    ...options,
                }),
            };
            // @ts-ignore
            const agent = options.agent || actor[metadataSymbol].config.agent || getDefaultAgent();
            // @ts-ignore
            const { canisterId, effectiveCanisterId, pollingStrategyFactory } = {
                ...DEFAULT_ACTOR_CONFIG,
                // @ts-ignore
                ...actor[metadataSymbol].config,
                ...options,
            };
            const cid = Principal.from(canisterId);
            const ecid = effectiveCanisterId !== undefined ? Principal.from(effectiveCanisterId) : cid;
            const arg = IDL.encode(func.argTypes, args);
            const { requestId, response } = await agent.call(cid, {
                methodName,
                arg,
                effectiveCanisterId: ecid,
            });

            if (!response.ok) {
                throw new UpdateCallRejectedError(cid, methodName, requestId, response);
            }

            const pollStrategy = pollingStrategyFactory();
            const responseBytes = await pollForResponse(agent, ecid, requestId, pollStrategy);

            if (responseBytes !== undefined) {
                return decodeExecuteReturnValue(func.retTypes, responseBytes);
            } else if (func.retTypes.length === 0) {
                return undefined;
            } else {
                throw new Error(`Call was returned undefined, but type [${func.retTypes.join(',')}].`);
            }
        };
    }

    const handler = (...args: unknown[]) => caller({}, ...args);
    handler.withOptions =
        (options: CallConfig) =>
            (...args: unknown[]) =>
                caller(options, ...args);
    return handler as ActorMethod;
}