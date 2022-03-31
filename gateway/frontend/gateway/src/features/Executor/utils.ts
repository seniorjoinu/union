import { ExecutorFormData } from './types';

export const parseMessage = (data: any): Partial<ExecutorFormData> | null => {
  if (!data) {
    return null;
  }

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

  if (data.program && Array.isArray(data.program)) {
    const program = data.program
      .filter(
        (p: any) =>
          !!p && 'endpoint' in p && !!p.endpoint?.canister_id && !!p.endpoint?.method_name,
      )
      .map((p: any) => ({
        endpoint: {
          canister_id: String(p.endpoint.canister_id),
          method_name: String(p.endpoint.method_name),
        },
        cycles: !Number.isNaN(Number(p.cycles)) ? String(p.cycles) : '',
        args_candid: Array.isArray(p.args_candid)
          ? p.args_candid.filter((a: any) => typeof a == 'string')
          : [],
      }));

    result.program = program;
  }

  console.log('PARSED', data, result);
  return result;
};
