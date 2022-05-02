import { checkPrincipal } from 'toolkit';
import { ExecutorFormData, Program } from './types';

export const parseMessage = (data: any): Partial<ExecutorFormData> | null => {
  if (!data) {
    return null;
  }

  console.log('Received data', data);

  const authorization_delay_nano = data.authorization_delay_nano
    ? Number(data.authorization_delay_nano)
    : Number.NaN;

  const result: Partial<ExecutorFormData> = {
    title: data.title ? String(data.title) : '',
    description: data.description ? String(data.description) : '',
    authorization_delay_nano: !Number.isNaN(authorization_delay_nano)
      ? authorization_delay_nano
      : 0,
  };

  const rnpExists = data.rnp && typeof data.rnp == 'object';

  if (rnpExists && 'role_id' in data.rnp && 'permission_id' in data.rnp) {
    const roleId = Number(data.rnp.role_id);
    const permissionId = Number(data.rnp.permission_id);

    if (!Number.isNaN(roleId) && !Number.isNaN(permissionId)) {
      result.rnp = { role_id: roleId, permission_id: permissionId };
    }
  }

  if (!data.program || 'Empty' in data.program) {
    console.log('Parsed data', result);
    return result;
  }

  if ('RemoteCallSequence' in data.program && Array.isArray(data.program.RemoteCallSequence)) {
    const program = data.program.RemoteCallSequence.filter(
      (p: any) => !!p && 'endpoint' in p && !!p.endpoint?.canister_id && !!p.endpoint?.method_name,
    ).map(
      (p: any): Program => {
        const remoteCall = {
          endpoint: {
            canister_id: checkPrincipal(p.endpoint.canister_id)?.toString() || '',
            method_name: String(p.endpoint.method_name),
          },
          cycles: !Number.isNaN(Number(p.cycles)) ? String(p.cycles) : '',
          args_candid: [],
          args_encoded: [],
        };

        if (
          'Encoded' in p.args &&
          Array.isArray(p.args.Encoded) &&
          typeof p.args.Encoded[0] == 'number'
        ) {
          remoteCall.args_encoded = p.args.Encoded;
        }
        if (
          'CandidString' in p.args &&
          Array.isArray(p.args.CandidString) &&
          typeof p.args.CandidString[0] == 'string'
        ) {
          remoteCall.args_candid = p.args.CandidString;
        }

        return remoteCall;
      },
    );

    result.program = program;
  }

  console.log('Parsed data', result);
  return result;
};
